import { buildContextBlock } from '@/lib/agents/shared'
import type { AgentDefinition, ContextAnswers, Idea } from '@/lib/types'

export const agent: AgentDefinition = {
  id: 'gtm',
  label: 'Go-to-market',
  weight: 0.15,
  model: 'claude-sonnet-4-20250514',
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
  "score": <entero del 1 al 10 según esta rubrica — úsala estrictamente:
    1-3: sin canal claro; early adopter no identificado; precio indefendible o ciclo de venta >12 meses
    4-5: canal hipotético; acceso al cliente complicado o dependiente de partnerships sin confirmar
    6-7: canal probable pero sin validación; early adopter definido pero sin acceso concreto todavía
    8-9: canal probado con acceso directo al decisor; early adopter validado y dispuesto a pagar precio objetivo
    10: distribución asegurada (partnership estratégico, efecto viral, comunidad existente) con tracción inicial demostrada>,
  "headline": "<frase corta que resume la estrategia GTM>",
  "strengths": ["<ventaja GTM 1>", "<ventaja 2>", "<ventaja 3>"],
  "risks": ["<riesgo GTM 1>", "<riesgo 2>", "<riesgo 3>"],
  "recommendation": "<primer paso concreto de GTM en 1-2 oraciones>",
  "hypotheses": ["<supuesto GTM crítico 1>", "<supuesto 2>"],
  "next_validation_action": "<experimento de distribución a ejecutar esta semana>"
}`
  },
}
