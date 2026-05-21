import Anthropic from '@anthropic-ai/sdk'
import type { Message } from '@anthropic-ai/sdk/resources/messages'
import type { AgentDefinition, AgentOutput, Analysis, ContextAnswers, ContextOutput, Idea, PitchDeck } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractJson<T>(text: string): T {
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON object found in response')
  let depth = 0
  let end = -1
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}' && --depth === 0) { end = i; break }
  }
  if (end === -1) throw new Error('Malformed JSON: unbalanced braces')
  return JSON.parse(text.slice(start, end + 1)) as T
}

function extractText(response: Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) throw err
      await sleep(RETRY_DELAY_MS * attempt)
    }
  }
  throw new Error('Unreachable')
}

// ─── Context Agent ────────────────────────────────────────────────────────────

export async function runContextAgent(idea: Idea): Promise<ContextOutput> {
  return withRetry(async () => {
    const { contextAgent } = await import('../agents/context')
    const prompt = contextAgent.buildPrompt(idea)

    const response = await anthropic.messages.create({
      model: contextAgent.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = extractText(response)
    const output = extractJson<ContextOutput>(text)

    if (!output.summary || !Array.isArray(output.questions)) {
      throw new Error('Invalid context agent output structure')
    }

    return output
  })
}

// ─── Synthesis Agent ─────────────────────────────────────────────────────────

export async function runSynthesisAgent(
  idea: Idea,
  analyses: Analysis[],
  contextAnswers?: ContextAnswers
): Promise<string> {
  return withRetry(async () => {
    const { synthesisAgent } = await import('../agents/synthesis')
    const prompt = synthesisAgent.buildPrompt(idea, analyses, contextAnswers)

    const response = await anthropic.messages.create({
      model: synthesisAgent.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = extractText(response).trim()
    if (!text) throw new Error('Synthesis agent returned empty response')
    return text
  })
}

// ─── Pitch Agent ─────────────────────────────────────────────────────────────

export async function runPitchAgent(
  idea: Idea,
  analyses: Analysis[],
  contextAnswers?: ContextAnswers
): Promise<PitchDeck> {
  return withRetry(async () => {
    const { pitchAgent } = await import('../agents/pitch')
    const prompt = pitchAgent.buildPrompt(idea, analyses, contextAnswers)

    const response = await anthropic.messages.create({
      model: pitchAgent.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = extractText(response)
    if (!text.trim()) throw new Error('Pitch agent returned empty response')

    const output = extractJson<PitchDeck>(text)

    if (!output.meta?.ideaName || !output.slides || !Array.isArray(output.enabledSlides)) {
      throw new Error('Pitch agent returned invalid output structure')
    }

    return output
  })
}

// ─── Analysis Agent ───────────────────────────────────────────────────────────

export async function runAgent(
  agent: AgentDefinition,
  idea: Idea,
  contextAnswers?: ContextAnswers
): Promise<AgentOutput> {
  return withRetry(async () => {
    const prompt = agent.buildPrompt(idea, contextAnswers)

    let response: Message

    if (agent.useWebSearch) {
      response = await anthropic.messages.create({
        model: agent.model,
        max_tokens: 2048,
        tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      })
    } else {
      response = await anthropic.messages.create({
        model: agent.model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })
    }

    const text = extractText(response)

    if (!text.trim()) {
      throw new Error(`Agent ${agent.id} returned no text content`)
    }

    const output = extractJson<AgentOutput>(text)

    if (
      typeof output.score !== 'number' ||
      !output.headline ||
      !Array.isArray(output.strengths) ||
      !Array.isArray(output.risks)
    ) {
      throw new Error(`Agent ${agent.id} returned invalid output structure`)
    }

    output.score = Math.min(10, Math.max(1, output.score))

    return output
  })
}
