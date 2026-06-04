import { buildContextBlock } from '@/lib/agents/shared'
import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'market',
  label: 'Viabilidad de mercado',
  weight: 0.20,
  model: 'claude-sonnet-4-20250514',
  useWebSearch: true,
  affectedBy: ['description', 'sector', 'targetMarket'],

  buildPrompt(idea: Idea, contextAnswers?: ContextAnswers): string {
    const context = buildContextBlock(idea, contextAnswers)
    return `Eres un analista experto en viabilidad de mercado con acceso a búsqueda web. Evalúa la siguiente idea de negocio desde la perspectiva del mercado.

${context}

Analiza:
1. Tamaño y crecimiento del mercado (TAM/SAM/SOM)
2. Tendencias y timing de entrada
3. Comportamiento y necesidades del segmento objetivo
4. Barreras de entrada al mercado
5. Regulación y factores externos relevantes

Usa la herramienta de búsqueda web para obtener datos actuales sobre el mercado si es necesario.

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "score": <entero del 1 al 10 según esta rubrica — úsala estrictamente:
    1-3: mercado inexistente, en declive o inaccesible (TAM <$10M, regulación prohibitiva, sin demanda demostrable)
    4-5: mercado pequeño o con barreras muy altas; timing dudoso o ventana cerrada
    6-7: mercado real con demanda validable pero gaps de datos importantes o competencia muy intensa
    8-9: mercado grande (>$500M TAM), creciente, timing favorable, segmento objetivo claro y accesible
    10: oportunidad excepcional con urgencia de adopción inmediata y ventana de entrada estrecha>,
  "headline": "<frase corta que resume el veredicto de mercado>",
  "strengths": ["<fortaleza 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "risks": ["<riesgo 1>", "<riesgo 2>", "<riesgo 3>"],
  "recommendation": "<acción concreta y específica en 1-2 oraciones>",
  "hypotheses": ["<supuesto crítico de mercado 1>", "<supuesto crítico 2>"],
  "next_validation_action": "<qué validar esta semana para reducir el riesgo principal>"
}`
  },
}
