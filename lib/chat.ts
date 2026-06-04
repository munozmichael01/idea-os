import {
  GoogleGenerativeAI,
  type Content,
  type Part,
} from '@google/generative-ai'
import type { Analysis, ContextAnswers, ContextQuestion, Idea, Message } from './types'

const GEMMA_MODEL = 'gemma-4-12b'

function getClient() {
  // 1. Intentar primero con los nombres exactos más comunes
  let apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.Gemini ||
    process.env.Default_Gemini_API_Key ||
    process.env.DEFAULT_GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
  // 2. Si no se encuentra, buscar de forma insensible a mayúsculas
  if (!apiKey) {
    const keys = Object.keys(process.env);
    const foundKey = keys.find(k => 
      k.toLowerCase() === 'gemini' || 
      k.toLowerCase() === 'gemini_api_key' ||
      k.toLowerCase() === 'default_gemini_api_key'
    );
    if (foundKey) apiKey = process.env[foundKey];
  }

  if (!apiKey) {
    throw new Error('API Key de Gemini no encontrada. Verifica que la variable (ej: "Gemini" o "GEMINI_API_KEY") esté configurada en Vercel.')
  }
  
  return new GoogleGenerativeAI(apiKey)
}


// ─── System prompt ────────────────────────────────────────────────────────────

export function buildChatSystemPrompt(idea: Idea, analyses: Analysis[]): string {
  const lines: string[] = [
    'Eres un asesor experto de startups. Tu rol es ayudar al fundador a reflexionar, mejorar y validar su idea de negocio.',
    'Responde de forma directa, concisa y accionable — como un mentor con experiencia real.',
    'Usa ÚNICAMENTE la información de esta idea. No inventes datos externos.',
    '',
    '═══ IDEA ═══',
    `Título: ${idea.title}`,
    `Descripción: ${idea.description}`,
    idea.sector ? `Sector: ${idea.sector}` : '',
    idea.targetMarket ? `Mercado objetivo: ${idea.targetMarket}` : '',
    idea.businessModel ? `Modelo de negocio: ${idea.businessModel}` : '',
    idea.notes ? `Notas del fundador: ${idea.notes}` : '',
  ].filter((l) => l !== null)

  if (idea.contextAnswers && Object.keys(idea.contextAnswers as object).length > 0) {
    const storedQuestions = (idea.contextQuestions as ContextQuestion[] | null) ?? []
    const questionMap = new Map(storedQuestions.map((q) => [q.id, q.question]))
    lines.push('', '═══ RESPUESTAS DEL FUNDADOR ═══')
    for (const [key, answer] of Object.entries(idea.contextAnswers as ContextAnswers)) {
      const q = questionMap.get(key)
      if (q) lines.push(`P: ${q}\nR: ${answer}`)
      else lines.push(`- ${answer}`)
    }
  }

  if (analyses.length > 0) {
    lines.push('', '═══ ANÁLISIS DE AGENTES ═══')
    for (const a of analyses) {
      lines.push(`\n[${a.agentType.toUpperCase()}] ${a.score}/10 — ${a.headline}`)
      if (a.strengths?.length) lines.push(`  Fortalezas: ${a.strengths.slice(0, 2).join('; ')}`)
      if (a.risks?.length) lines.push(`  Riesgos: ${a.risks.slice(0, 2).join('; ')}`)
      if (a.recommendation) lines.push(`  Acción: ${a.recommendation}`)
    }
  }

  lines.push(
    '',
    '═══ INSTRUCCIÓN ESPECIAL ═══',
    'Si el usuario revela información nueva, factual y específica que enriquecería el análisis',
    'de algún agente (ej: "ya tengo 200 clientes pagando", "mi co-founder es ex-Google"),',
    'añade AL FINAL de tu respuesta (nunca en medio) exactamente esta línea:',
    'CONTEXT_PATCH: {"agents": ["<agentType>"], "newInfo": "<1 frase con la info nueva>", "summary": "<lo que vas a actualizar>"}',
    '',
    'Agentes disponibles: market, competition, economics, gtm, founder_fit',
    'Solo incluye CONTEXT_PATCH cuando la info sea objetivamente nueva y verificable.',
    'Si no hay nada nuevo, NO incluyas CONTEXT_PATCH.'
  )

  return lines.join('\n')
}

// ─── History converter ────────────────────────────────────────────────────────

export function toGeminiHistory(messages: Message[]): Content[] {
  return messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))
}

// ─── Streaming chat ───────────────────────────────────────────────────────────

export interface InlineFilePart {
  inlineData: { mimeType: string; data: string }
}

export interface ChatStreamOptions {
  idea: Idea
  analyses: Analysis[]
  history: Message[]
  userMessage: string
  fileParts?: InlineFilePart[]
}

export async function streamChatResponse(options: ChatStreamOptions) {
  const { idea, analyses, history, userMessage, fileParts = [] } = options

  const genAI = getClient()
  const model = genAI.getGenerativeModel({
    model: GEMMA_MODEL,
    systemInstruction: buildChatSystemPrompt(idea, analyses),
  })

  const chat = model.startChat({
    history: toGeminiHistory(history),
  })

  const parts: Part[] = [
    { text: userMessage },
    ...fileParts.map((f) => ({ inlineData: f.inlineData } as Part)),
  ]

  return chat.sendMessageStream(parts)
}
