import type {
  AgentType,
  ExportFormat,
  IdeaStatus,
  InputType,
  Prisma,
} from '@prisma/client'

// ─── Re-export enums ─────────────────────────────────────────────────────────

export {
  Plan,
  WorkspaceRole,
  IdeaStatus,
  InputType,
  AgentType,
  Criticality,
  HypothesisStatus,
  ExperimentStatus,
  ExportFormat,
} from '@prisma/client'

// ─── Base entity types (plain rows, no relations) ─────────────────────────────

export type User = Prisma.UserGetPayload<Record<string, never>>
export type Workspace = Prisma.WorkspaceGetPayload<Record<string, never>>
export type WorkspaceMember = Prisma.WorkspaceMemberGetPayload<Record<string, never>>
export type Idea = Prisma.IdeaGetPayload<Record<string, never>>
export type Analysis = Prisma.AnalysisGetPayload<Record<string, never>>
export type Hypothesis = Prisma.HypothesisGetPayload<Record<string, never>>
export type Experiment = Prisma.ExperimentGetPayload<Record<string, never>>
export type AudioInput = Prisma.AudioInputGetPayload<Record<string, never>>
export type Export = Prisma.ExportGetPayload<Record<string, never>>
export type RankingHistory = Prisma.RankingHistoryGetPayload<Record<string, never>>

// ─── Rich types with relations (used by UI and Server Actions) ────────────────

export type IdeaWithAnalyses = Prisma.IdeaGetPayload<{
  include: { analyses: true }
}>

export type IdeaWithHypotheses = Prisma.IdeaGetPayload<{
  include: { hypotheses: true }
}>

export type IdeaFull = Prisma.IdeaGetPayload<{
  include: {
    analyses: true
    hypotheses: { include: { experiments: true } }
    experiments: true
    audioInputs: true
    exports: true
    rankingHistory: true
    creator: true
    workspace: true
  }
}>

export type WorkspaceWithMembers = Prisma.WorkspaceGetPayload<{
  include: { members: { include: { user: true } }; owner: true }
}>

export type WorkspaceMemberWithUser = Prisma.WorkspaceMemberGetPayload<{
  include: { user: true }
}>

export type HypothesisWithExperiments = Prisma.HypothesisGetPayload<{
  include: { experiments: true }
}>

// ─── Context agent ────────────────────────────────────────────────────────────

export interface ContextQuestion {
  id: string
  question: string
  affectedAgents: AgentType[]
}

export interface ContextOutput {
  summary: string
  questions: ContextQuestion[]
}

/** Stored in ideas.context_answers — keyed by question id */
export type ContextAnswers = Record<string, string>

// ─── Analysis agent contract ──────────────────────────────────────────────────

/** Raw JSON output every analysis agent must return */
export interface AgentOutput {
  score: number
  headline: string
  strengths: string[]
  risks: string[]
  recommendation: string
  hypotheses: string[]
  next_validation_action: string
}

/** Idea fields that, when changed, invalidate an agent's analysis */
export type IdeaField = keyof Pick<
  Idea,
  'title' | 'description' | 'sector' | 'targetMarket' | 'businessModel' | 'notes'
>

/** Resolved agent definition (matches agents/{id}.ts export shape) */
export interface AgentDefinition {
  id: AgentType
  label: string
  weight: number
  model: string
  useWebSearch: boolean
  affectedBy: IdeaField[]
  buildPrompt: (idea: Idea, contextAnswers?: ContextAnswers) => string
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

export interface ScoringSnapshot {
  compositeScore: number
  confidenceScore: number
  volatilityScore: number
}

// ─── Server Action payloads ───────────────────────────────────────────────────

export interface CreateIdeaPayload {
  workspaceId: string
  title: string
  description: string
  sector?: string | undefined
  targetMarket?: string | undefined
  businessModel?: string | undefined
  notes?: string | undefined
  inputType?: InputType | undefined
}

export interface UpdateIdeaPayload {
  title?: string | undefined
  description?: string | undefined
  sector?: string | undefined
  targetMarket?: string | undefined
  businessModel?: string | undefined
  notes?: string | undefined
  status?: IdeaStatus | undefined
  contextAnswers?: ContextAnswers | undefined
}

// ─── Export helpers ───────────────────────────────────────────────────────────

export interface ExportResult {
  url: string
  format: ExportFormat
}
