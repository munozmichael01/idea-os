import { buildContextBlock } from '@/lib/agents/shared'
import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'competition',
  label: 'Análisis competitivo',
  weight: 0.15,
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
  "score": <entero del 1 al 10 según esta rubrica — úsala estrictamente:
    1-3: mercado dominado por incumbentes con moat fuerte (red, datos, contratos); diferenciación estructuralmente imposible
    4-5: competencia intensa de players bien financiados; ventaja competitiva débil o fácilmente replicable en <6 meses
    6-7: competencia moderada; existe espacio pero la ventaja no es sostenible a largo plazo sin ejecución perfecta
    8-9: posición competitiva fuerte; diferenciación clara, defendible y difícil de copiar en el corto plazo
    10: categoría nueva sin competencia directa + ventaja estructural única (datos, regulación, distribución exclusiva)>,
  "headline": "<frase corta que resume el panorama competitivo>",
  "strengths": ["<ventaja competitiva 1>", "<ventaja 2>", "<ventaja 3>"],
  "risks": ["<riesgo competitivo 1>", "<riesgo 2>", "<riesgo 3>"],
  "recommendation": "<acción concreta para construir ventaja competitiva en 1-2 oraciones>",
  "hypotheses": ["<supuesto crítico sobre competencia 1>", "<supuesto 2>"],
  "next_validation_action": "<cómo validar la diferenciación esta semana>"
}`
  },
}
