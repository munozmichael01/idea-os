import type { Analysis, ContextAnswers, ContextQuestion, Idea, PitchDeck } from '@/lib/types'

export const pitchAgent = {
  id: 'pitch' as const,
  model: 'claude-sonnet-4-20250514',

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
      const storedQuestions = (idea.contextQuestions as ContextQuestion[] | null) ?? []
      const questionMap = new Map(storedQuestions.map((q) => [q.id, q.question]))
      lines.push('\nINFORMACIÓN DEL FUNDADOR:')
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

    const agentMap = Object.fromEntries(analyses.map((a) => [a.agentType, a]))

    if (analyses.length > 0) {
      lines.push('\nANÁLISIS DISPONIBLES:')
      for (const a of analyses) {
        lines.push(`\n[${a.agentType.toUpperCase()}] Score: ${a.score}/10`)
        lines.push(`  Headline: ${a.headline}`)
        if (a.strengths?.length) lines.push(`  Fortalezas: ${a.strengths.join('; ')}`)
        if (a.risks?.length) lines.push(`  Riesgos: ${a.risks.join('; ')}`)
        if (a.recommendation) lines.push(`  Recomendación: ${a.recommendation}`)
      }
    }

    const hasMarket = !!agentMap['market']
    const hasCompetition = !!agentMap['competition']
    const hasEconomics = !!agentMap['economics']
    const hasGtm = !!agentMap['gtm']
    const hasFounderFit = !!agentMap['founder_fit']
    const hasAskSignal = !!(idea.notes?.match(/\$|k|K|seed|ronda|raise|levantar|inversión/i))

    return `Eres un experto en pitch decks para startups en etapa temprana. Tu trabajo es transformar el análisis de esta idea en contenido de pitch convincente y orientado a inversores — no análisis equilibrado, sino narrativa que vende la oportunidad.

${lines.join('\n')}

INSTRUCCIONES:
- Tono: directo, ambicioso pero creíble. Como lo diría un fundador experimentado a un inversor sofisticado.
- Usa los datos de los análisis como base, pero enmarca todo como oportunidad, no como riesgo.
- Si un análisis menciona riesgos, transfórmalos en "dónde está la oportunidad de ejecución".
- Solo incluye slides para las que tengas datos suficientes. Marca el resto como null.
- Slides disponibles según análisis: market=${hasMarket}, competition=${hasCompetition}, businessModel=${hasEconomics}, gtm=${hasGtm}, team=${hasFounderFit}, ask=${hasAskSignal}

Tu respuesta debe ser ÚNICAMENTE el siguiente JSON, sin texto adicional, sin bloques de código markdown:

{
  "meta": {
    "ideaName": "${idea.title}",
    "tagline": "<una frase que capture el valor único en menos de 15 palabras>",
    "sector": "${idea.sector ?? '<inferir del análisis>'}",
    "stage": "<Pre-seed | Seed | Serie A según el contexto>",
    "geography": "<mercado geográfico principal o null>",
    "contactEmail": null
  },
  "slides": {
    "problem": {
      "title": "<titular de la slide que expresa el problema como oportunidad, máx 12 palabras>",
      "body": "<párrafo de 2-3 frases describiendo el dolor del mercado>",
      "headlineStat": {
        "value": "<la estadística más impactante, ej: '3h' o '$2B'>",
        "label": "<qué mide ese número en 1 frase>"
      },
      "facts": [
        { "value": "<dato 1>", "label": "<qué significa>" },
        { "value": "<dato 2>", "label": "<qué significa>" },
        { "value": "<dato 3>", "label": "<qué significa>" }
      ]
    },
    "solution": {
      "title": "<titular de la solución en máx 12 palabras>",
      "steps": [
        { "title": "<paso 1>", "description": "<descripción corta>" },
        { "title": "<paso 2>", "description": "<descripción corta>" },
        { "title": "<paso 3>", "description": "<descripción corta>" }
      ],
      "benefits": [
        { "title": "<beneficio clave 1>", "description": "<descripción>" },
        { "title": "<beneficio clave 2>", "description": "<descripción>" },
        { "title": "<beneficio clave 3>", "description": "<descripción>" }
      ]
    },
    "market": ${hasMarket ? `{
      "title": "<titular de mercado>",
      "tam": { "value": "<ej: $8.4B>", "description": "<qué incluye este TAM>" },
      "sam": { "value": "<ej: $1.2B>", "description": "<segmento servible>" },
      "som": { "value": "<ej: $120M>", "description": "<objetivo a 5 años>" },
      "growthNote": "<dato de CAGR o tendencia clave>"
    }` : 'null'},
    "competition": ${hasCompetition ? `{
      "title": "<titular del panorama competitivo>",
      "table": {
        "headers": ["<Competidor 1>", "<Competidor 2>", "<Nuestro producto>"],
        "rows": [
          { "feature": "<capacidad 1>", "values": ["<val>", "<val>", "<val>"], "highlightLast": true },
          { "feature": "<capacidad 2>", "values": ["<val>", "<val>", "<val>"], "highlightLast": true },
          { "feature": "<capacidad 3>", "values": ["<val>", "<val>", "<val>"], "highlightLast": true },
          { "feature": "<capacidad 4>", "values": ["<val>", "<val>", "<val>"], "highlightLast": false },
          { "feature": "<precio o tiempo de impl.>", "values": ["<val>", "<val>", "<val>"], "highlightLast": true }
        ]
      }
    }` : 'null'},
    "businessModel": ${hasEconomics ? `{
      "title": "<titular del modelo de negocio>",
      "pricing": {
        "tier": "<nombre del plan>",
        "amount": "<precio>",
        "unit": "<unidad, ej: / usuario / mes>",
        "description": "<1-2 frases sobre el modelo>",
        "features": ["<feature 1>", "<feature 2>", "<feature 3>", "<feature 4>"]
      },
      "unitEconomics": {
        "cac": "<ej: $400 o null>",
        "ltv": "<ej: $10.8K o null>",
        "ltvCacRatio": "<ej: 27 o null>",
        "grossMargin": "<ej: 78% o null>"
      }
    }` : 'null'},
    "gtm": ${hasGtm ? `{
      "title": "<titular de la estrategia GTM>",
      "phases": [
        {
          "title": "<nombre de la fase 1>",
          "timeframe": "<ej: Meses 0–6>",
          "actions": ["<acción 1>", "<acción 2>", "<acción 3>"],
          "kpiLabel": "Hito",
          "kpiValue": "<métrica objetivo de esta fase>"
        },
        {
          "title": "<nombre de la fase 2>",
          "timeframe": "<ej: Meses 6–12>",
          "actions": ["<acción 1>", "<acción 2>", "<acción 3>"],
          "kpiLabel": "Hito",
          "kpiValue": "<métrica objetivo>"
        },
        {
          "title": "<nombre de la fase 3>",
          "timeframe": "<ej: Meses 12–18>",
          "actions": ["<acción 1>", "<acción 2>", "<acción 3>"],
          "kpiLabel": "Hito",
          "kpiValue": "<métrica objetivo>"
        }
      ]
    }` : 'null'},
    "team": ${hasFounderFit ? `{
      "title": "<titular sobre el equipo>",
      "members": [
        {
          "initials": "<2-3 letras>",
          "name": "<nombre o rol, ej: CEO & Co-founder>",
          "role": "<experiencia clave en 1 frase corta>",
          "bio": "<2-3 frases sobre por qué esta persona es la indicada para esta idea>",
          "credentials": [
            { "year": "<año o rango>", "what": "<logro o rol>", "where": "<empresa o institución>" }
          ]
        }
      ]
    }` : 'null'},
    "ask": ${hasAskSignal ? `{
      "title": "<titular de la ronda>",
      "amount": "<número solo, ej: 500>",
      "currency": "USD",
      "description": "<condiciones clave: runway, tipo de instrumento, cap si aplica>",
      "useOfFunds": [
        { "label": "<destino 1>", "percentage": 40 },
        { "label": "<destino 2>", "percentage": 30 },
        { "label": "<destino 3>", "percentage": 20 },
        { "label": "<destino 4>", "percentage": 10 }
      ],
      "nextMilestone": "<qué hito alcanzará con este capital>"
    }` : 'null'}
  },
  "enabledSlides": [<lista de keys con slides no-null: "problem", "solution", ...>]
}`
  },
}
