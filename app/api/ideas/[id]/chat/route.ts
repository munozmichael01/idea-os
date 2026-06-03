import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getIdea, getMessages } from '@/lib/actions/ideas'
import { streamChatResponse } from '@/lib/chat'
import type { ContextPatch } from '@/lib/types'

const CONTEXT_PATCH_DELIMITER = 'CONTEXT_PATCH:'
const MAX_HISTORY = 20

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ideaId } = await params
  try {
    const messages = await getMessages(ideaId)
    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ideaId } = await params
  const encoder = new TextEncoder()

  function send(controller: ReadableStreamDefaultController, data: object) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── Parse request ──────────────────────────────────────────────
        let userMessage = ''
        const fileParts: { inlineData: { mimeType: string; data: string } }[] = []
        const attachmentsMeta: { name: string; mimeType: string; size: number }[] = []

        const contentType = req.headers.get('content-type') ?? ''

        if (contentType.includes('multipart/form-data')) {
          const formData = await req.formData()
          userMessage = (formData.get('message') as string) ?? ''

          for (const [, value] of formData.entries()) {
            if (value instanceof File && value.size > 0) {
              const buffer = Buffer.from(await value.arrayBuffer())
              const base64 = buffer.toString('base64')
              fileParts.push({ inlineData: { mimeType: value.type, data: base64 } })
              attachmentsMeta.push({ name: value.name, mimeType: value.type, size: value.size })
            }
          }
        } else {
          const body = await req.json()
          userMessage = body.message ?? ''
        }

        if (!userMessage.trim() && fileParts.length === 0) {
          send(controller, { type: 'error', message: 'Mensaje vacío' })
          controller.close()
          return
        }

        // ── Load idea context ──────────────────────────────────────────
        const [idea, rawHistory] = await Promise.all([
          getIdea(ideaId),
          getMessages(ideaId),
        ])

        const allAnalyses = await prisma.analysis.findMany({
          where: { ideaId },
          orderBy: { createdAt: 'desc' },
        })
        const seen = new Set<string>()
        const latestAnalyses = allAnalyses.filter((a) => {
          if (seen.has(a.agentType)) return false
          seen.add(a.agentType)
          return true
        })

        // ── Save user message ──────────────────────────────────────────
        await prisma.message.create({
          data: {
            ideaId,
            role: 'user',
            content: userMessage,
            attachments: attachmentsMeta.length > 0 ? attachmentsMeta : undefined,
          },
        })

        // ── Stream from Gemma ──────────────────────────────────────────
        const history = rawHistory.slice(-MAX_HISTORY)

        const result = await streamChatResponse({
          idea,
          analyses: latestAnalyses,
          history,
          userMessage,
          fileParts,
        })

        let fullContent = ''

        for await (const chunk of result.stream) {
          const text = chunk.text()
          fullContent += text

          // Strip CONTEXT_PATCH from live stream so it never shows in UI
          const patchIdx = fullContent.indexOf(CONTEXT_PATCH_DELIMITER)
          const displayText = patchIdx !== -1
            ? text.slice(0, Math.max(0, patchIdx - (fullContent.length - text.length)))
            : text

          if (displayText) send(controller, { type: 'delta', content: displayText })
        }

        // ── Extract and strip CONTEXT_PATCH ───────────────────────────
        const patchIdx = fullContent.indexOf(CONTEXT_PATCH_DELIMITER)
        let patch: ContextPatch | null = null
        let cleanContent = fullContent

        if (patchIdx !== -1) {
          cleanContent = fullContent.slice(0, patchIdx).trim()
          try {
            const jsonStr = fullContent.slice(patchIdx + CONTEXT_PATCH_DELIMITER.length).trim()
            const parsed = JSON.parse(jsonStr)
            if (parsed.agents && parsed.newInfo) patch = parsed as ContextPatch
          } catch {
            // malformed patch — ignore
          }
        }

        // ── Save assistant message ─────────────────────────────────────
        await prisma.message.create({
          data: { ideaId, role: 'assistant', content: cleanContent },
        })

        send(controller, { type: 'done' })

        // ── Send patch suggestion if detected ─────────────────────────
        if (patch) send(controller, { type: 'patch', patch })

        controller.close()
      } catch (err) {
        console.error('[chat/route] error:', err)
        send(controller, {
          type: 'error',
          message: err instanceof Error ? err.message : 'Error generando respuesta',
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
