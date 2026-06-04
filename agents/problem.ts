import { buildContextBlock } from '@/lib/agents/shared'
import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'problem',
  label: 'Validación del problema',
  weight: 0.20,
  model: 'claude-sonnet-4-20250514',
  useWebSearch: false,
  affectedBy: ['description', 'targetMarket'],

  buildPrompt(idea: Idea, contextAnswers?: ContextAnswers): string {
    const context = buildContextBlock(idea, contextAnswers)
    return `Eres un experto en discovery de producto y validación de problemas. Evalúa si el problema que esta idea pretende resolver es real, doloroso y urgente.

${context}

Analiza exclusivamente la dimensión del PROBLEMA (no la solución, no el mercado, no el equipo):
1. Intensidad del dolor: ¿qué tan molesto o costoso es el problema para quien lo sufre?
2. Frecuencia: ¿con qué regularidad se experimenta el problema?
3. Urgencia: ¿hay presión de tiempo para resolverlo o puede esperar indefinidamente?
4. Alternativas actuales: ¿qué hacen hoy las personas para resolverlo? ¿lo resuelve bien?
5. Coste de no resolver: ¿qué ocurre si el problema no se soluciona?
6. Evidencia de demanda: ¿hay señales — búsquedas, comunidades, workarounds, quejas — de que la gente quiere una solución mejor?

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "score": <entero del 1 al 10 según esta rubrica — úsala estrictamente:
    1-3: problema menor, infrecuente o con buenas soluciones existentes; poca evidencia de demanda
    4-5: problema real pero tolerable; las alternativas existentes son aceptables
    6-7: problema claro con soluciones inadecuadas; evidencia limitada de urgencia
    8-9: problema doloroso, frecuente, sin buenas alternativas y con señales claras de demanda insatisfecha
    10: problema crítico que la gente paga por resolver mal — mercado claramente en busca de algo mejor>,
  "headline": "<frase corta que resume el veredicto sobre el problema>",
  "strengths": ["<evidencia de que el problema es real 1>", "<evidencia 2>", "<evidencia 3>"],
  "risks": ["<señal de que el problema podría no ser tan urgente 1>", "<señal 2>", "<señal 3>"],
  "recommendation": "<acción concreta para validar o invalidar el problema esta semana en 1-2 oraciones>",
  "hypotheses": ["<supuesto crítico sobre el problema que debe validarse 1>", "<supuesto 2>"],
  "next_validation_action": "<experimento específico para confirmar que el dolor es real y urgente>"
}`
  },
}
