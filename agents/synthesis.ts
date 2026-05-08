import type { Analysis, ContextAnswers, Idea } from '@/lib/types'

export const synthesisAgent = {
  id: 'synthesis' as const,
  model: 'claude-haiku-4-5-20251001',

  buildPrompt(idea: Idea, analyses: Analysis[], contextAnswers?: ContextAnswers): string {
    const lines: string[] = [
      `IDEA: ${idea.title}`,
      `Descripción: ${idea.description}`,
      idea.sector ? `Sector: ${idea.sector}` : '',
      idea.targetMarket ? `Mercado objetivo: ${idea.targetMarket}` : '',
      idea.businessModel ? `Modelo de negocio: ${idea.businessModel}` : '',
      idea.notes ? `Notas: ${idea.notes}` : '',
    ].filter(Boolean)

    if (contextAnswers && Object.keys(contextAnswers).length > 0) {
      lines.push('\nRESPUESTAS DEL FUNDADOR:')
      for (const [, answer] of Object.entries(contextAnswers)) {
        lines.push(`- ${answer}`)
      }
    }

    if (analyses.length > 0) {
      lines.push('\nANÁLISIS DE AGENTES:')
      for (const a of analyses) {
        lines.push(`\n[${a.agentType.toUpperCase()}] Score: ${a.score}/10 — ${a.headline}`)
        if (a.strengths?.length) lines.push(`  Fortalezas: ${a.strengths.slice(0, 2).join('; ')}`)
        if (a.risks?.length) lines.push(`  Riesgos: ${a.risks.slice(0, 2).join('; ')}`)
        if (a.recommendation) lines.push(`  Recomendación: ${a.recommendation}`)
      }
    }

    return `Eres un analista de startups senior. Basándote en toda la información disponible sobre esta idea de negocio, genera un resumen ejecutivo claro y accionable de 3-5 párrafos.

${lines.join('\n')}

El resumen debe:
1. Capturar la esencia del negocio y la oportunidad
2. Destacar las principales fortalezas y riesgos identificados por los agentes
3. Reflejar el fit del fundador con la oportunidad
4. Terminar con la acción más importante a tomar ahora

Escribe en español. Sé directo, concreto y honesto. Solo devuelve el texto del resumen, sin títulos ni formato markdown.`
  },
}
