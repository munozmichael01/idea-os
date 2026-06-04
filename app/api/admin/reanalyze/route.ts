import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { runAgent } from '@/lib/claude'
import { computeCompositeScore, computeConfidenceScore, computeVolatilityScore } from '@/lib/scoring'
import { HypothesisStatus } from '@prisma/client'
import type { AgentDefinition, AgentType, ContextAnswers } from '@/lib/types'

// Protect with a secret — add ADMIN_SECRET to Vercel env vars
function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-admin-secret')
  return !!process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET
}

async function getAllAgentDefs(): Promise<AgentDefinition[]> {
  const [market, competition, economics, gtm, founder_fit] = await Promise.all([
    import('@/agents/market').then((m) => m.agent),
    import('@/agents/competition').then((m) => m.agent),
    import('@/agents/economics').then((m) => m.agent),
    import('@/agents/gtm').then((m) => m.agent),
    import('@/agents/founder_fit').then((m) => m.agent),
  ])
  return [market, competition, economics, gtm, founder_fit]
}

async function reanalyzeIdea(ideaId: string, agentDefs: AgentDefinition[]): Promise<{
  ideaId: string
  scores: Record<string, number>
  composite: number
  error?: string
}> {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } })
  const contextAnswers = idea.contextAnswers as ContextAnswers | null

  const results = await Promise.allSettled(
    agentDefs.map(async (agentDef) => {
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
          inputHash: '', // forced re-analysis — hash not relevant
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

      return { agentType: agentDef.id as AgentType, score: output.score }
    })
  )

  // Refresh scores
  const allAnalyses = await prisma.analysis.findMany({
    where: { ideaId },
    orderBy: { createdAt: 'desc' },
  })
  const seen = new Set<string>()
  const latest = allAnalyses.filter((a) => {
    if (seen.has(a.agentType)) return false
    seen.add(a.agentType)
    return true
  })
  const hypotheses = await prisma.hypothesis.findMany({ where: { ideaId } })

  const compositeScore = computeCompositeScore(latest)
  const confidenceScore = computeConfidenceScore(hypotheses)
  const volatilityScore = computeVolatilityScore(hypotheses)

  await prisma.idea.update({
    where: { id: ideaId },
    data: { compositeScore, confidenceScore, volatilityScore },
  })

  const scores: Record<string, number> = {}
  for (const r of results) {
    if (r.status === 'fulfilled') scores[r.value.agentType] = r.value.score
  }
  const failed = results.filter((r) => r.status === 'rejected').length

  return {
    ideaId,
    scores,
    composite: compositeScore,
    ...(failed > 0 && { error: `${failed} agent(s) failed` }),
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const workspaceId: string | undefined = body.workspaceId

  const ideas = await prisma.idea.findMany({
    where: workspaceId ? { workspaceId } : undefined,
    select: { id: true, title: true },
    orderBy: { createdAt: 'asc' },
  })

  if (ideas.length === 0) {
    return NextResponse.json({ message: 'No ideas found', count: 0 })
  }

  const agentDefs = await getAllAgentDefs()
  const results = []
  let failed = 0

  for (const idea of ideas) {
    try {
      console.log(`[reanalyze] Processing: ${idea.title} (${idea.id})`)
      const result = await reanalyzeIdea(idea.id, agentDefs)
      results.push({ title: idea.title, ...result })
      console.log(`[reanalyze] Done: ${idea.title} → composite ${result.composite}`)
    } catch (err) {
      console.error(`[reanalyze] Failed: ${idea.title}`, err)
      results.push({ title: idea.title, ideaId: idea.id, error: String(err) })
      failed++
    }
  }

  return NextResponse.json({
    message: `Re-analyzed ${ideas.length} ideas (${failed} failed)`,
    results,
  })
}
