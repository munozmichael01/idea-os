import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'economics',
  label: 'Modelo económico',
  weight: 0.25,
  model: 'claude-sonnet-4-20250514',
  useWebSearch: false,
  affectedBy: ['description', 'businessModel'],

  buildPrompt(idea: Idea, contextAnswers?: ContextAnswers): string {
    const context = buildContextBlock(idea, contextAnswers)
    return `Eres un analista experto en modelos de negocio y economía de startups. Evalúa la viabilidad económica y financiera de la siguiente idea.

${context}

Analiza:
1. Estructura de ingresos y escalabilidad del modelo de monetización
2. Estimación de unit economics (CAC, LTV, márgenes brutos)
3. Capital requerido para llegar a breakeven
4. Riesgos financieros y dependencias críticas
5. Potencial de crecimiento y atractivo para inversión

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "score": <número del 1 al 10>,
  "headline": "<frase corta que resume la viabilidad económica>",
  "strengths": ["<fortaleza económica 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "risks": ["<riesgo financiero 1>", "<riesgo 2>", "<riesgo 3>"],
  "recommendation": "<acción concreta para mejorar la economía del negocio en 1-2 oraciones>",
  "hypotheses": ["<supuesto económico crítico 1>", "<supuesto 2>"],
  "next_validation_action": "<qué métrica o experimento validar esta semana>"
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
