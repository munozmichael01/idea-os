'use server'

import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { runAgent, runContextAgent, runSynthesisAgent, runPitchAgent } from '@/lib/claude'
import {
  computeCompositeScore,
  computeOpportunityScore,
  computeExecutionScore,
  computeConfidenceScore,
  computeVolatilityScore,
  getAffectedAgents,
} from '@/lib/scoring'
import {
  HypothesisStatus,
} from '@/lib/types'
import type {
  AgentDefinition,
  AgentType,
  ContextAnswers,
  ContextOutput,
  CreateIdeaPayload,
  ExportFormat,
  ExportResult,
  Idea,
  IdeaField,
  IdeaFull,
  PitchDeck,
  UpdateIdeaPayload,
} from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAllAgentDefinitions(): Promise<Record<AgentType, AgentDefinition>> {
  const [market, competition, economics, gtm, founder_fit, problem] = await Promise.all([
    import('@/agents/market').then((m) => m.agent),
    import('@/agents/competition').then((m) => m.agent),
    import('@/agents/economics').then((m) => m.agent),
    import('@/agents/gtm').then((m) => m.agent),
    import('@/agents/founder_fit').then((m) => m.agent),
    import('@/agents/problem').then((m) => m.agent),
  ])
  return { market, competition, economics, gtm, founder_fit, problem }
}

function computeInputHash(idea: Idea, affectedFields: IdeaField[]): string {
  const fieldValues = affectedFields.map((f) => String(idea[f] ?? '')).join('|')
  const contextStr = idea.contextAnswers ? JSON.stringify(idea.contextAnswers) : ''
  return createHash('sha256').update(fieldValues + contextStr).digest('hex')
}

async function refreshScores(ideaId: string): Promise<void> {
  const [allAnalyses, hypotheses] = await Promise.all([
    prisma.analysis.findMany({ where: { ideaId }, orderBy: { createdAt: 'desc' } }),
    prisma.hypothesis.findMany({ where: { ideaId } }),
  ])

  // Use only the most recent analysis per agent type
  const seen = new Set<string>()
  const analyses = allAnalyses.filter((a) => {
    if (seen.has(a.agentType)) return false
    seen.add(a.agentType)
    return true
  })

  const compositeScore    = computeCompositeScore(analyses)
  const opportunityScore  = computeOpportunityScore(analyses)
  const executionScore    = computeExecutionScore(analyses)
  const confidenceScore   = computeConfidenceScore(hypotheses)
  const volatilityScore   = computeVolatilityScore(hypotheses)

  // Update idea scores — always runs, independent of rankingHistory
  await prisma.idea.update({
    where: { id: ideaId },
    data: { compositeScore, opportunityScore, executionScore, confidenceScore, volatilityScore },
  })

  // rankingHistory is non-critical — failure here should not block score update
  prisma.rankingHistory.create({
    data: { ideaId, compositeScore, confidenceScore, volatilityScore, reason: 'score_refresh' },
  }).catch((err) => console.error('[refreshScores] rankingHistory failed:', err))
}

// ─── createIdea ───────────────────────────────────────────────────────────────

export async function createIdea(userId: string, payload: CreateIdeaPayload): Promise<Idea> {
  const idea = await prisma.idea.create({
    data: {
      workspaceId: payload.workspaceId,
      createdBy: userId,
      title: payload.title,
      description: payload.description,
      sector: payload.sector ?? null,
      targetMarket: payload.targetMarket ?? null,
      businessModel: payload.businessModel ?? null,
      notes: payload.notes ?? null,
      inputType: payload.inputType ?? 'text',
    },
  })

  revalidatePath('/dashboard')
  return idea
}

// ─── updateIdea ───────────────────────────────────────────────────────────────

export async function updateIdea(
  ideaId: string,
  payload: UpdateIdeaPayload
): Promise<{ idea: Idea; reanalyzedAgents: AgentType[] }> {
  const current = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })

  const ideaFields: IdeaField[] = ['title', 'description', 'sector', 'targetMarket', 'businessModel', 'notes']
  const changedFields = ideaFields.filter((key) => {
    if (!(key in payload)) return false
    return payload[key as keyof UpdateIdeaPayload] !== (current as Record<string, unknown>)[key]
  })

  const idea = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.sector !== undefined && { sector: payload.sector ?? null }),
      ...(payload.targetMarket !== undefined && { targetMarket: payload.targetMarket ?? null }),
      ...(payload.businessModel !== undefined && { businessModel: payload.businessModel ?? null }),
      ...(payload.notes !== undefined && { notes: payload.notes ?? null }),
      ...(payload.status !== undefined && { status: payload.status }),
      ...(payload.contextAnswers !== undefined && { contextAnswers: payload.contextAnswers }),
    },
  })

  const reanalyzedAgents: AgentType[] = []

  if (changedFields.length > 0) {
    const affectedAgentTypes = getAffectedAgents(changedFields)
    const agentDefs = await getAllAgentDefinitions()
    const contextAnswers = idea.contextAnswers as ContextAnswers | null

    const settledResults = await Promise.allSettled(
      affectedAgentTypes.map(async (agentType) => {
        const agentDef = agentDefs[agentType]
        if (!agentDef) return null
        const newHash = computeInputHash(idea, agentDef.affectedBy)

        const existingAnalysis = await prisma.analysis.findFirst({
          where: { ideaId, agentType },
          orderBy: { createdAt: 'desc' },
        })

        if (existingAnalysis?.inputHash === newHash) return null

        const output = await runAgent(agentDef, idea, contextAnswers ?? undefined)

        await prisma.analysis.create({
          data: {
            ideaId,
            agentType,
            score: output.score,
            headline: output.headline,
            strengths: output.strengths,
            risks: output.risks,
            recommendation: output.recommendation,
            hypotheses: output.hypotheses,
            nextValidationAction: output.next_validation_action,
            webSearchUsed: agentDef.useWebSearch,
            inputHash: newHash,
            modelVersion: agentDef.model,
          },
        })

        await prisma.hypothesis.deleteMany({
          where: { ideaId, agentType, status: HypothesisStatus.unvalidated },
        })

        await prisma.hypothesis.createMany({
          data: output.hypotheses.map((description) => ({
            ideaId,
            agentType,
            description,
          })),
        })

        return agentType
      })
    )

    for (const result of settledResults) {
      if (result.status === 'fulfilled' && result.value) {
        reanalyzedAgents.push(result.value)
      } else if (result.status === 'rejected') {
        console.error('[updateIdea] Agent failed:', result.reason)
      }
    }

    if (reanalyzedAgents.length > 0) {
      await refreshScores(ideaId)
    }
  }

  revalidatePath(`/ideas/${ideaId}`)
  return { idea, reanalyzedAgents }
}

// ─── runContextAgentForIdea ───────────────────────────────────────────────────

export async function runContextAgentForIdea(ideaId: string): Promise<ContextOutput> {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })
  const output = await runContextAgent(idea)

  const inferredData: Record<string, string> = {}
  const f = output.inferredFields
  if (f) {
    if (!idea.sector && f.sector) inferredData.sector = f.sector
    if (!idea.targetMarket && f.targetMarket) inferredData.targetMarket = f.targetMarket
    if (!idea.businessModel && f.businessModel) inferredData.businessModel = f.businessModel
  }

  await prisma.idea.update({
    where: { id: ideaId },
    data: {
      contextSummary: output.summary,
      contextQuestions: JSON.parse(JSON.stringify(output.questions)),
      ...inferredData,
    },
  })

  revalidatePath(`/ideas/${ideaId}`)
  return output
}

// ─── runSynthesisAgentForIdea ─────────────────────────────────────────────────

export async function runSynthesisAgentForIdea(ideaId: string): Promise<string> {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })
  const contextAnswers = idea.contextAnswers as ContextAnswers | null

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

  const summary = await runSynthesisAgent(idea, latestAnalyses, contextAnswers ?? undefined)

  await prisma.idea.update({
    where: { id: ideaId },
    data: { executiveSummary: summary },
  })

  revalidatePath(`/ideas/${ideaId}`)
  return summary
}

// ─── runAgentForIdea ──────────────────────────────────────────────────────────

export async function runAgentForIdea(ideaId: string, agentType: AgentType): Promise<void> {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })
  const agentDefs = await getAllAgentDefinitions()
  const agentDef = agentDefs[agentType]
  if (!agentDef) throw new Error(`No agent definition found for type: ${agentType}`)
  const contextAnswers = idea.contextAnswers as ContextAnswers | null

  const inputHash = computeInputHash(idea, agentDef.affectedBy)

  const existingAnalysis = await prisma.analysis.findFirst({
    where: { ideaId, agentType },
    orderBy: { createdAt: 'desc' },
  })
  if (existingAnalysis?.inputHash === inputHash) {
    revalidatePath(`/ideas/${ideaId}`)
    return
  }

  const output = await runAgent(agentDef, idea, contextAnswers ?? undefined)

  await prisma.analysis.create({
    data: {
      ideaId,
      agentType,
      score: output.score,
      headline: output.headline,
      strengths: output.strengths,
      risks: output.risks,
      recommendation: output.recommendation,
      hypotheses: output.hypotheses,
      nextValidationAction: output.next_validation_action,
      webSearchUsed: agentDef.useWebSearch,
      inputHash,
      modelVersion: agentDef.model,
    },
  })

  await prisma.hypothesis.deleteMany({
    where: { ideaId, agentType, status: HypothesisStatus.unvalidated },
  })

  await prisma.hypothesis.createMany({
    data: output.hypotheses.map((description) => ({ ideaId, agentType, description })),
  })

  await refreshScores(ideaId)
  revalidatePath(`/ideas/${ideaId}`)
}

// ─── runAllAgents ─────────────────────────────────────────────────────────────

export async function runAllAgents(ideaId: string): Promise<void> {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })
  const agentDefs = await getAllAgentDefinitions()
  const contextAnswers = idea.contextAnswers as ContextAnswers | null

  const results = await Promise.allSettled(
    (Object.values(agentDefs) as AgentDefinition[]).map(async (agentDef) => {
      const inputHash = computeInputHash(idea, agentDef.affectedBy)
      const output = await runAgent(agentDef, idea, contextAnswers ?? undefined)

      await prisma.analysis.create({
        data: {
          ideaId,
          agentType: agentDef.id,
          score: output.score,
          headline: output.headline,
          strengths: output.strengths,
          risks: output.risks,
          recommendation: output.recommendation,
          hypotheses: output.hypotheses,
          nextValidationAction: output.next_validation_action,
          webSearchUsed: agentDef.useWebSearch,
          inputHash,
          modelVersion: agentDef.model,
        },
      })

      await prisma.hypothesis.deleteMany({
        where: { ideaId, agentType: agentDef.id, status: HypothesisStatus.unvalidated },
      })

      await prisma.hypothesis.createMany({
        data: output.hypotheses.map((description) => ({
          ideaId,
          agentType: agentDef.id,
          description,
        })),
      })
    })
  )

  const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
  if (failures.length > 0) {
    console.error(`[runAllAgents] ${failures.length} agent(s) failed:`, failures.map((f) => f.reason))
  }

  await refreshScores(ideaId)
  revalidatePath(`/ideas/${ideaId}`)
  revalidatePath('/dashboard')
}

// ─── answerContextQuestions ───────────────────────────────────────────────────

export async function answerContextQuestions(
  ideaId: string,
  answers: ContextAnswers
): Promise<void> {
  await prisma.idea.update({
    where: { id: ideaId },
    data: { contextAnswers: answers },
  })

  await runAllAgents(ideaId)
}

// ─── getRecentIdeas ───────────────────────────────────────────────────────────

export async function getRecentIdeas(userId: string, limit = 5): Promise<{ id: string; title: string; compositeScore: number | null }[]> {
  return prisma.idea.findMany({
    where: { createdBy: userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: { id: true, title: true, compositeScore: true },
  })
}

// ─── getIdea ──────────────────────────────────────────────────────────────────

export async function getIdea(ideaId: string): Promise<IdeaFull> {
  return prisma.idea.findUniqueOrThrow({
    where: { id: ideaId },
    include: {
      analyses: { orderBy: { createdAt: 'desc' } },
      hypotheses: { include: { experiments: true } },
      experiments: true,
      audioInputs: true,
      exports: true,
      rankingHistory: true,
      creator: true,
      workspace: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })
}

// ─── getMessages ──────────────────────────────────────────────────────────────

export async function getMessages(ideaId: string) {
  return prisma.message.findMany({
    where: { ideaId },
    orderBy: { createdAt: 'asc' },
  })
}

// ─── applyContextPatch ────────────────────────────────────────────────────────

export async function applyContextPatch(
  ideaId: string,
  newInfo: string,
  affectedAgents: string[]
): Promise<void> {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })
  const existing = (idea.contextAnswers as Record<string, string>) ?? {}

  const patchKey = `chat_${Date.now()}`
  const updated = { ...existing, [patchKey]: newInfo }

  await prisma.idea.update({
    where: { id: ideaId },
    data: { contextAnswers: updated },
  })

  const { AgentType } = await import('@prisma/client')
  const validAgents = affectedAgents.filter(
    (a): a is import('@/lib/types').AgentType => a in AgentType
  )

  await Promise.allSettled(
    validAgents.map((agentType) => runAgentForIdea(ideaId, agentType))
  )

  revalidatePath(`/ideas/${ideaId}`)
}

// ─── runPitchAgentForIdea ─────────────────────────────────────────────────────

export async function runPitchAgentForIdea(ideaId: string): Promise<PitchDeck> {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })
  const contextAnswers = idea.contextAnswers as ContextAnswers | null

  const allAnalyses = await prisma.analysis.findMany({
    where: { ideaId },
    orderBy: { createdAt: 'desc' },
  })

  // Most recent analysis per agent
  const seen = new Set<string>()
  const latestAnalyses = allAnalyses.filter((a) => {
    if (seen.has(a.agentType)) return false
    seen.add(a.agentType)
    return true
  })

  const deck = await runPitchAgent(idea, latestAnalyses, contextAnswers ?? undefined)

  await prisma.idea.update({
    where: { id: ideaId },
    data: { pitchDeck: JSON.parse(JSON.stringify(deck)) },
  })

  revalidatePath(`/ideas/${ideaId}`)
  return deck
}

// ─── exportIdea ───────────────────────────────────────────────────────────────

const STORAGE_BUCKET = 'idea-exports'

function storageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function exportIdea(
  ideaId: string,
  userId: string,
  format: ExportFormat
): Promise<ExportResult> {
  if (format === 'audio') {
    throw new Error('Audio export not implemented yet')
  }

  const idea = await getIdea(ideaId)
  const timestamp = Date.now()
  const fileName = `${idea.workspaceId}/${ideaId}/${timestamp}.${format}`

  let fileBuffer: Buffer
  let contentType: string

  if (format === 'docx') {
    const { generateDocx } = await import('@/scripts/export/docx')
    fileBuffer = await generateDocx(idea)
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  } else {
    const { generatePdf } = await import('@/scripts/export/pdf')
    fileBuffer = await generatePdf(ideaId)
    contentType = 'application/pdf'
  }

  const supabase = storageClient()

  // Ensure bucket exists
  const { error: bucketError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: false,
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  })
  // Ignore "already exists" error
  if (bucketError && !bucketError.message.includes('already exists')) {
    throw bucketError
  }

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, fileBuffer, { contentType, upsert: false })

  if (uploadError) throw uploadError

  const { data: signedData, error: signedError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 days

  if (signedError || !signedData) throw signedError ?? new Error('Failed to create signed URL')

  const storageUrl = signedData.signedUrl

  await prisma.export.create({
    data: { ideaId, userId, format, storageUrl },
  })

  revalidatePath(`/ideas/${ideaId}`)

  return { url: storageUrl, format }
}
