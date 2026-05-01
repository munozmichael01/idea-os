import type { Idea } from '@/lib/types'

export const contextAgent = {
  id: 'context' as const,
  model: 'claude-haiku-4-5-20251001',

  buildPrompt(idea: Idea): string {
    return `Eres un asistente experto en validación de ideas de negocio. Tu tarea es analizar la siguiente idea y generar contexto estructurado para que otros agentes especializados la evalúen con mayor precisión.

IDEA:
Título: ${idea.title}
Descripción: ${idea.description}
${idea.sector ? `Sector: ${idea.sector}` : ''}
${idea.targetMarket ? `Mercado objetivo: ${idea.targetMarket}` : ''}
${idea.businessModel ? `Modelo de negocio: ${idea.businessModel}` : ''}
${idea.notes ? `Notas adicionales: ${idea.notes}` : ''}

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "summary": "Resumen estructurado de la idea en 2-3 oraciones que capture el problema, la solución y el mercado objetivo",
  "questions": [
    {
      "id": "q1",
      "question": "Pregunta clarificadora concreta y relevante",
      "affectedAgents": ["market", "competition"]
    }
  ]
}

Reglas:
- Genera entre 3 y 5 preguntas clarificadoras
- Cada pregunta debe ser específica, accionable y orientada a reducir incertidumbre
- Los agentes disponibles son: "market", "competition", "economics", "gtm", "founder_fit"
- Asigna a cada pregunta solo los agentes cuya evaluación se beneficiaría de la respuesta
- Los IDs de preguntas deben ser q1, q2, q3... en orden`
  },
}
