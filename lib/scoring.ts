import type { Analysis, AgentType, Hypothesis, IdeaField } from './types'

// ─── Agent registry ───────────────────────────────────────────────────────────
// Weights must sum to 1.0
// Reference: Scorecard Method (Payne), Gompers et al. 2020, CB Insights 2024

const AGENT_AFFECTED_BY: Record<AgentType, IdeaField[]> = {
  problem:      ['description', 'targetMarket'],
  market:       ['description', 'sector', 'targetMarket'],
  competition:  ['description', 'sector', 'targetMarket'],
  economics:    ['description', 'businessModel'],
  gtm:          ['description', 'sector', 'targetMarket', 'businessModel'],
  founder_fit:  ['description', 'notes'],
}

const AGENT_WEIGHTS: Record<AgentType, number> = {
  problem:     0.20,  // Scorecard Method: Problem 20% — "no market need" is top failure cause
  market:      0.20,  // Timing/market is #1 predictor (Bill Gross 42%); shared with problem
  founder_fit: 0.20,  // VCs rank team #1 at early stage (Gompers et al. 2020, 95% of VCs)
  competition: 0.15,  // Scorecard Method: Product/differentiation 15%
  gtm:         0.15,  // Path to first customers + problem discovery
  economics:   0.10,  // Scorecard Method: Business model 5% + Risk 5%; hypothesis at idea-stage
}

// ─── Opportunity / Execution groupings ───────────────────────────────────────

const OPPORTUNITY_AGENTS: AgentType[] = ['problem', 'market', 'competition']
const EXECUTION_AGENTS: AgentType[]   = ['founder_fit', 'gtm', 'economics']

// ─── Composite score ──────────────────────────────────────────────────────────

/** Weighted average of all agent scores, normalized to 0-10 */
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

// ─── Opportunity score ────────────────────────────────────────────────────────

/** 0-10: is the opportunity worth pursuing? (problem + market + competition) */
export function computeOpportunityScore(analyses: Analysis[]): number {
  const relevant = analyses.filter((a) => OPPORTUNITY_AGENTS.includes(a.agentType))
  if (relevant.length === 0) return 0

  let weightedSum = 0
  let totalWeight = 0

  for (const analysis of relevant) {
    const weight = AGENT_WEIGHTS[analysis.agentType] ?? 0
    weightedSum += analysis.score * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

// ─── Execution score ──────────────────────────────────────────────────────────

/** 0-10: can this team execute it? (founder_fit + gtm + economics) */
export function computeExecutionScore(analyses: Analysis[]): number {
  const relevant = analyses.filter((a) => EXECUTION_AGENTS.includes(a.agentType))
  if (relevant.length === 0) return 0

  let weightedSum = 0
  let totalWeight = 0

  for (const analysis of relevant) {
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

/** 0-1: ratio of unvalidated hypotheses over total */
export function computeVolatilityScore(hypotheses: Hypothesis[]): number {
  if (hypotheses.length === 0) return 0
  const unvalidated = hypotheses.filter((h) => h.status === 'unvalidated').length
  return Math.round((unvalidated / hypotheses.length) * 100) / 100
}

// ─── Re-analysis selector ─────────────────────────────────────────────────────

export function getAffectedAgents(changedFields: IdeaField[]): AgentType[] {
  if (changedFields.length === 0) return []

  const affected: AgentType[] = []

  for (const [agentId, fields] of Object.entries(AGENT_AFFECTED_BY) as [AgentType, IdeaField[]][]) {
    const isAffected = fields.some((f) => changedFields.includes(f))
    if (isAffected) affected.push(agentId)
  }

  return affected
}
