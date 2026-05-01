import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'competition',
  label: 'Análisis competitivo',
  weight: 0.20,
  model: 'claude-sonnet-4-20250514',
  useWebSearch: true,
  affectedBy: ['description', 'sector', 'targetMarket'],

  buildPrompt(idea: Idea, contextAnswers?: ContextAnswers): string {
    const context = buildContextBlock(idea, contextAnswers)
    return `Eres un analista experto en inteligencia competitiva con acceso a búsqueda web. Evalúa el panorama competitivo de la siguiente idea de negocio.

${context}

Analiza:
1. Competidores directos e indirectos existentes (busca activamente en web)
2. Fortalezas y debilidades de los competidores principales
3. Diferenciación posible y ventaja competitiva sostenible
4. Riesgo de que grandes players entren al espacio
5. Barreras de salida para clientes actuales de la competencia

Usa la herramienta de búsqueda web para identificar competidores reales y actuales.

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "score": <número del 1 al 10>,
  "headline": "<frase corta que resume el panorama competitivo>",
  "strengths": ["<ventaja competitiva 1>", "<ventaja 2>", "<ventaja 3>"],
  "risks": ["<riesgo competitivo 1>", "<riesgo 2>", "<riesgo 3>"],
  "recommendation": "<acción concreta para construir ventaja competitiva en 1-2 oraciones>",
  "hypotheses": ["<supuesto crítico sobre competencia 1>", "<supuesto 2>"],
  "next_validation_action": "<cómo validar la diferenciación esta semana>"
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
