import type { ContextAnswers, ContextQuestion, Idea } from '@/lib/types'

/**
 * Builds the context block injected at the top of every analysis agent prompt.
 * When contextAnswers are present, pairs each answer with its question text
 * (retrieved from idea.contextQuestions) so the LLM sees full Q&A pairs.
 */
export function buildContextBlock(
  idea: Idea,
  contextAnswers?: ContextAnswers,
  sectionLabel = 'RESPUESTAS DE CONTEXTO ADICIONAL:'
): string {
  const lines = [
    `IDEA: ${idea.title}`,
    `Descripción: ${idea.description}`,
    idea.sector ? `Sector: ${idea.sector}` : null,
    idea.targetMarket ? `Mercado objetivo: ${idea.targetMarket}` : null,
    idea.businessModel ? `Modelo de negocio: ${idea.businessModel}` : null,
    idea.notes ? `Notas: ${idea.notes}` : null,
  ].filter(Boolean)

  if (contextAnswers && Object.keys(contextAnswers).length > 0) {
    const storedQuestions = (idea.contextQuestions as ContextQuestion[] | null) ?? []
    const questionMap = new Map(storedQuestions.map((q) => [q.id, q.question]))
    lines.push(`\n${sectionLabel}`)
    for (const [questionId, answer] of Object.entries(contextAnswers)) {
      const questionText = questionMap.get(questionId)
      if (questionText) {
        lines.push(`P: ${questionText}`)
        lines.push(`R: ${answer}`)
      } else {
        lines.push(`- ${answer}`)
      }
    }
  }

  return lines.join('\n')
}
