import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'founder_fit',
  label: 'Fit con el fundador',
  weight: 0.15,
  model: 'claude-haiku-4-5-20251001',
  useWebSearch: false,
  affectedBy: ['description', 'notes'],

  buildPrompt(idea: Idea, contextAnswers?: ContextAnswers): string {
    const context = buildContextBlock(idea, contextAnswers)
    const hasContext = contextAnswers && Object.keys(contextAnswers).length > 0
    const contextWarning = hasContext
      ? ''
      : '\nADVERTENCIA: No hay respuestas de contexto del fundador. El análisis se basa únicamente en la descripción de la idea; las conclusiones sobre el fit son especulativas.\n'
    return `Eres un experto en evaluación de founder-market fit. Analiza si esta idea es adecuada para quien la propone.

${context}${contextWarning}

${hasContext ? 'USA LAS RESPUESTAS DEL FUNDADOR como fuente primaria. No inferas lo que el fundador ya ha declarado explícitamente.' : 'Sin datos directos del fundador, indica en cada punto que el análisis es inferido de la descripción de la idea.'}

Analiza:
1. Alineación entre la idea y el conocimiento/experiencia declarado por el fundador
2. Motivación intrínseca y longevidad del interés en el problema
3. Red de contactos y acceso a clientes o expertos del sector
4. Capacidad técnica o de ejecución requerida vs disponible
5. Disposición a pivotar basándose en feedback de mercado

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "score": <número del 1 al 10>,
  "headline": "<frase corta que resume el founder-market fit>",
  "strengths": ["<fortaleza del fundador para esta idea 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "risks": ["<riesgo de fit 1>", "<riesgo 2>", "<riesgo 3>"],
  "recommendation": "<acción concreta para reforzar el fit en 1-2 oraciones>",
  "hypotheses": ["<supuesto sobre capacidad del fundador 1>", "<supuesto 2>"],
  "next_validation_action": "<cómo validar el fit con el mercado esta semana>"
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
    lines.push('\nPERFIL DEL FUNDADOR (respuestas directas del fundador — tratar como hechos, no inferencias):')
    for (const [, answer] of Object.entries(contextAnswers)) {
      lines.push(`- ${answer}`)
    }
  }

  return lines.join('\n')
}
