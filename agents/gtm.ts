import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'gtm',
  label: 'Go-to-market',
  weight: 0.15,
  model: 'claude-haiku-4-5-20251001',
  useWebSearch: false,
  affectedBy: ['description', 'sector', 'targetMarket', 'businessModel'],

  buildPrompt(idea: Idea, contextAnswers?: ContextAnswers): string {
    const context = buildContextBlock(idea, contextAnswers)
    return `Eres un experto en estrategias go-to-market para startups. Evalúa cómo llevar esta idea al mercado de forma efectiva.

${context}

Analiza:
1. Canal de adquisición principal y estrategia de distribución
2. Perfil del early adopter y cómo llegar a él
3. Estrategia de precio y posicionamiento inicial
4. Partnerships o integraciones clave para acelerar adopción
5. Métricas de tracción que demostrarían product-market fit

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "score": <número del 1 al 10>,
  "headline": "<frase corta que resume la estrategia GTM>",
  "strengths": ["<ventaja GTM 1>", "<ventaja 2>", "<ventaja 3>"],
  "risks": ["<riesgo GTM 1>", "<riesgo 2>", "<riesgo 3>"],
  "recommendation": "<primer paso concreto de GTM en 1-2 oraciones>",
  "hypotheses": ["<supuesto GTM crítico 1>", "<supuesto 2>"],
  "next_validation_action": "<experimento de distribución a ejecutar esta semana>"
}`
  },
}

function buildContextBlock(idea: Idea, contextAnswers?: ContextAnswers): string {
  const lines = [
    `IDEA: ${idea.title}`,
    `Descripción: ${idea.description}`,
    idea.sector ? `Sector: ${idea.sector}` : null,
    idea.targetMarket ? `Mercado objetivo: ${idea.targetMarket}` : null,
    idea.businessModel ? `Modelo de negocio: ${idea.businessModel}` : null,
    idea.notes ? `Notas: ${idea.notes}` : null,
  ].filter(Boolean)

  if (contextAnswers && Object.keys(contextAnswers).length > 0) {
    lines.push('\nRESPUESTAS DE CONTEXTO ADICIONAL:')
    for (const [, answer] of Object.entries(contextAnswers)) {
      lines.push(`- ${answer}`)
    }
  }

  return lines.join('\n')
}
