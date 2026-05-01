import type { Analysis, AgentType, Hypothesis, IdeaField } from './types'

// ─── Agent registry (weights must sum to 1.0) ─────────────────────────────────

const AGENT_AFFECTED_BY: Record<AgentType, IdeaField[]> = {
  market: ['description', 'sector', 'targetMarket'],
  competition: ['description', 'sector', 'targetMarket'],
  economics: ['description', 'businessModel'],
  gtm: ['description', 'sector', 'targetMarket', 'businessModel'],
  founder_fit: ['description', 'notes'],
}

const AGENT_WEIGHTS: Record<AgentType, number> = {
  market: 0.25,
  competition: 0.20,
  economics: 0.25,
  gtm: 0.15,
  founder_fit: 0.15,
}

// ─── Composite score ──────────────────────────────────────────────────────────

/** Weighted average of agent scores, normalized to 0-10 */
export function computeCompositeScore(analyses: Analysis[]): number {
  if (analyses.length === 0) return 0

  let weightedSum = 0
  let totalWeight = 0

  for (const analysis of analyses) {
    const weight = AGENT_WEIGHTS[analysis.agentType] ?? 0
    weightedSum += analysis.score * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

// ─── Confidence score ─────────────────────────────────────────────────────────

/** 0-1: ratio of confirmed hypotheses over total */
export function computeConfidenceScore(hypotheses: Hypothesis[]): number {
  if (hypotheses.length === 0) return 0
  const confirmed = hypotheses.filter((h) => h.status === 'confirmed').length
  return Math.round((confirmed / hypotheses.length) * 100) / 100
}

// ─── Volatility score ─────────────────────────────────────────────────────────

/** 0-1: weight of critical unvalidated hypotheses over total critical hypotheses */
export function computeVolatilityScore(hypotheses: Hypothesis[]): number {
  const critical = hypotheses.filter((h) => h.criticality === 'high')
  if (critical.length === 0) return 0

  const unvalidated = critical.filter((h) => h.status === 'unvalidated').length
  return Math.round((unvalidated / critical.length) * 100) / 100
}

// ─── Re-analysis selector ─────────────────────────────────────────────────────

/**
 * Returns the agent types whose analysis is invalidated by the given changed fields.
 * Used by updateIdea() to decide which agents to re-run.
 */
export function getAffectedAgents(changedFields: IdeaField[]): AgentType[] {
  if (changedFields.length === 0) return []

  const affected: AgentType[] = []

  for (const [agentId, fields] of Object.entries(AGENT_AFFECTED_BY) as [AgentType, IdeaField[]][]) {
    const isAffected = fields.some((f) => changedFields.includes(f))
    if (isAffected) affected.push(agentId)
  }

  return affected
}
