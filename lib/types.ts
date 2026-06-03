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
  MessageRole,
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
export type Message = Prisma.MessageGetPayload<Record<string, never>>

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
    messages: { orderBy: { createdAt: 'asc' } }
  }
}>

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface MessageAttachment {
  name: string
  mimeType: string
  size: number
}

/** Emitted at end of SSE stream when model detects valuable new info */
export interface ContextPatch {
  agents: AgentType[]
  newInfo: string
  summary: string
}

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

export interface InferredFields {
  sector?: string | null
  targetMarket?: string | null
  businessModel?: string | null
}

export interface ContextOutput {
  summary: string
  inferredFields?: InferredFields
  questions: ContextQuestion[]
}

/** Stored in ideas.context_answers — keyed by question id */
export type ContextAnswers = Record<string, string>

// ─── Pitch deck ───────────────────────────────────────────────────────────────

export type PitchSlideKey =
  | 'problem'
  | 'solution'
  | 'market'
  | 'competition'
  | 'businessModel'
  | 'gtm'
  | 'team'
  | 'ask'

export interface PitchDeck {
  meta: {
    ideaName: string
    tagline: string
    sector: string
    stage: string
    geography?: string
    contactEmail?: string
  }
  slides: {
    problem?: {
      title: string
      body: string
      headlineStat: { value: string; label: string }
      facts: Array<{ value: string; label: string }>
    }
    solution?: {
      title: string
      steps: Array<{ title: string; description: string }>
      benefits: Array<{ title: string; description: string }>
    }
    market?: {
      title: string
      tam: { value: string; description: string }
      sam: { value: string; description: string }
      som: { value: string; description: string }
      growthNote: string
    }
    competition?: {
      title: string
      table: {
        headers: string[]
        rows: Array<{
          feature: string
          values: string[]
          highlightLast: boolean
        }>
      }
    }
    businessModel?: {
      title: string
      pricing: {
        tier: string
        amount: string
        unit: string
        description: string
        features: string[]
      }
      unitEconomics: {
        cac?: string
        ltv?: string
        ltvCacRatio?: string
        grossMargin?: string
      }
    }
    gtm?: {
      title: string
      phases: Array<{
        title: string
        timeframe: string
        actions: string[]
        kpiLabel: string
        kpiValue: string
      }>
    }
    team?: {
      title: string
      members: Array<{
        initials: string
        name: string
        role: string
        bio: string
        credentials: Array<{ year: string; what: string; where?: string }>
      }>
    }
    ask?: {
      title: string
      amount: string
      currency: string
      description: string
      useOfFunds: Array<{ label: string; percentage: number }>
      nextMilestone: string
    }
  }
  enabledSlides: PitchSlideKey[]
}

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
