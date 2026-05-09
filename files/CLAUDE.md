# IdeaOS — Contexto para Claude Code

Eres el agente responsable de la **lógica de negocio** de IdeaOS, una plataforma SaaS multi-tenant para validar y priorizar ideas de negocio con IA.

Trabajas en paralelo con Gemini CLI (corriendo en Antigravity). Cada agente tiene archivos exclusivos. **No toques los archivos de Gemini CLI.**

---

## Stack

- **Framework**: Next.js 14 (App Router), TypeScript estricto
- **Estilos**: Tailwind CSS + shadcn/ui (New York style, zinc)
- **Base de datos**: Supabase (PostgreSQL) + Prisma ORM
- **IA / Agentes**: Anthropic Claude API (`claude-sonnet-4` y `claude-haiku-4-5`)
- **Audio input**: OpenAI Whisper API
- **Audio output**: OpenAI TTS API
- **i18n**: next-intl (locales: `es`, `en`)
- **Deploy**: Vercel + Supabase

---

## Principios de desarrollo

- TypeScript estricto en todo. Sin `any` implícitos.
- Server Components por defecto. Client Components solo cuando sea imprescindible.
- Server Actions para mutaciones. No crear API routes innecesarias.
- Row-level security en Supabase para todo dato de usuario/workspace.
- Todos los strings de UI en `messages/es.json` y `messages/en.json`.
- Manejo de errores explícito. Nunca silenciar errores.
- Componentes pequeños y reutilizables. No mezclar lógica de negocio con presentación.

---

## Tus archivos exclusivos (Gemini CLI no los toca)

```
agents/                        ← prompts y lógica de cada agente
lib/scoring.ts                 ← composite, confidence, volatility score
lib/claude.ts                  ← cliente Anthropic, runAgent(), retry logic
lib/supabase/server.ts         ← cliente Supabase server-side
lib/supabase/rls.ts            ← políticas RLS
prisma/schema.prisma           ← modelo de datos completo
prisma/migrations/             ← todas las migraciones
scripts/export/pdf.ts          ← generación PDF con Puppeteer
scripts/export/docx.ts         ← generación DOCX con docx-js
```

## Archivos compartidos (puedes leer y escribir, Gemini CLI solo lee)

```
lib/types.ts                   ← tipos derivados de Prisma, contrato entre agentes
lib/utils.ts                   ← utilidades generales
lib/supabase/client.ts         ← cliente Supabase browser-side
```

## Archivos de Gemini CLI (solo leer, nunca modificar)

NOTA TEMPORAL (hasta que Gemini CLI vuelva): Claude Code tiene permiso de lectura y escritura sobre estos archivos.

```
app/(app)/dashboard/
app/(app)/ideas/[id]/page.tsx
app/(app)/ideas/new/
app/(app)/settings/
app/(auth)/
components/ui/
app/api/audio/
messages/
```

---

## Modelo de datos (entidades principales)

| Entidad | Campos clave |
|---|---|
| `users` | id, email, name, avatar_url, locale, created_at |
| `workspaces` | id, name, slug, owner_id, plan (free\|pro), created_at |
| `workspace_members` | workspace_id, user_id, role (owner\|editor\|viewer), invited_at |
| `ideas` | id, workspace_id, created_by, title, description, sector, target_market, business_model, notes, composite_score, confidence_score, volatility_score, status (active\|archived), input_type (text\|audio), created_at, updated_at |
| `analyses` | id, idea_id, agent_type, score, headline, strengths[], risks[], recommendation, hypotheses[], next_validation_action, web_search_used, model_version, created_at |
| `hypotheses` | id, idea_id, agent_type, description, criticality (high\|medium\|low), status (unvalidated\|confirmed\|invalidated), created_at |
| `experiments` | id, idea_id, hypothesis_id, type, description, status (pending\|in_progress\|done), result, created_at, updated_at |
| `audio_inputs` | id, idea_id, user_id, storage_url, transcript, duration_seconds, whisper_model, created_at |
| `exports` | id, idea_id, user_id, format (pdf\|docx\|audio), storage_url, created_at |
| `ranking_history` | id, idea_id, composite_score, confidence_score, volatility_score, reason, snapshot_at |

---

## Estructura de agentes

### Agente de Contexto (`agents/context.ts`) — corre primero

```typescript
export const contextAgent = {
  id: 'context',
  model: 'claude-haiku-4-5-20251001',  // rápido y económico
  buildPrompt: (idea: Idea): string => { ... }
}
```

Output JSON:
```json
{
  "summary": "Resumen estructurado de la idea en 2-3 oraciones",
  "questions": [
    { "id": "q1", "question": "¿Cuál es el principal problema que resuelve?", "affectedAgents": ["market", "competition"] },
    { "id": "q2", "question": "¿Tienes ya algún cliente o validación temprana?", "affectedAgents": ["economics", "gtm"] }
  ]
}
```

- No produce score — su output es contexto, no evaluación
- Las respuestas del usuario se guardan en `ideas.context_answers` (JSONB)
- Los agentes de análisis reciben el contexto enriquecido con las respuestas

### Agentes de análisis (`agents/{agent_id}.ts`) — corren en paralelo después

Cada agente exporta:

```typescript
export const agent = {
  id: 'market',
  label: 'Viabilidad de mercado',
  weight: 0.25,
  model: 'claude-sonnet-4-20250514',     // sonnet para market, competition, economics
  // model: 'claude-haiku-4-5-20251001', // haiku para gtm, founder_fit
  useWebSearch: true,                     // true solo para market y competition
  affectedBy: ['description', 'sector', 'target_market'],  // campos que lo invalidan
  buildPrompt: (idea: Idea, contextAnswers?: Record<string, string>): string => { ... }
}
```

El prompt siempre instruye a responder **SOLO en JSON** con esta estructura:

```json
{
  "score": 8,
  "headline": "Mercado creciente con ventana de entrada clara",
  "strengths": ["punto 1", "punto 2"],
  "risks": ["riesgo 1", "riesgo 2"],
  "recommendation": "Acción concreta en 1-2 oraciones",
  "hypotheses": ["supuesto crítico 1", "supuesto crítico 2"],
  "next_validation_action": "Qué validar esta semana"
}
```

---

## Re-análisis selectivo

En `lib/scoring.ts` implementar `getAffectedAgents(changedFields: string[]): AgentType[]`:

| Campo modificado | Agentes afectados |
|---|---|
| `description` | Todos |
| `sector` | market, competition, gtm |
| `target_market` | market, competition, gtm |
| `business_model` | economics, gtm |
| `notes` | Ninguno |
| Respuesta de contexto | Solo los agentes listados en `affectedAgents` de esa pregunta |

Cuando `updateIdea()` se llama, comparar hash de inputs por agente — si el hash no cambió, no re-ejecutar ese agente.

---

## Scoring

En `lib/scoring.ts` implementar tres funciones:

```typescript
// Score compuesto ponderado (suma de peso * score por agente)
computeCompositeScore(analyses: Analysis[]): number

// Confianza 0-1: proporción de hipótesis confirmadas vs total
computeConfidenceScore(hypotheses: Hypothesis[]): number

// Volatilidad 0-1: peso de hipótesis críticas no validadas
computeVolatilityScore(hypotheses: Hypothesis[]): number
```

---

## Modelos por agente (optimización de costos)

| Agente | Modelo | Motivo |
|---|---|---|
| Viabilidad de mercado | claude-sonnet-4 | Razonamiento complejo + web search |
| Análisis competitivo | claude-sonnet-4 | Razonamiento complejo + web search |
| Modelo económico | claude-sonnet-4 | Análisis financiero detallado |
| Go-to-market | claude-haiku-4-5 | Menor complejidad, ~25x más barato |
| Fit con el fundador | claude-haiku-4-5 | Menor complejidad, ~25x más barato |

---

## Variables de entorno que te corresponden

```bash
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo server-side, nunca en NEXT_PUBLIC_*
DATABASE_URL=postgresql://...       # para Prisma
```

---

## Punto de integración con Gemini CLI

- Gemini CLI consume tus Server Actions importándolas directamente.
- El contrato entre los dos agentes es `lib/types.ts`. Si modificas un tipo, avisa antes de que Gemini CLI continúe con la UI afectada.
- Gemini CLI nunca edita `prisma/schema.prisma`. Si necesita un campo nuevo, es una tarea tuya primero.

---

## Tareas por fase

### Fase 0 — Setup (Semana 1)
- [ ] Inicializar repo Next.js 14 con TypeScript strict, ESLint, Prettier
- [ ] Crear schema Prisma completo con todas las entidades del modelo de datos
- [ ] Primera migración y aplicar a Supabase
- [ ] Crear `lib/supabase/server.ts`, `lib/supabase/client.ts`
- [ ] Crear `lib/types.ts` con todos los tipos derivados de Prisma
- [ ] Configurar RLS en Supabase: políticas por workspace para todas las tablas

### Fase 1 — Core MVP (Semanas 2–4)
- [ ] `agents/context.ts` — Agente de Contexto con Haiku: analiza input, genera 3–5 preguntas con `affectedAgents[]` por pregunta
- [ ] `agents/market.ts`, `agents/competition.ts`, `agents/economics.ts`, `agents/gtm.ts`, `agents/founder_fit.ts` — 5 agentes con campo `affectedBy[]`
- [ ] `lib/claude.ts`: `runContextAgent()` y `runAgent()` con retry, JSON parsing robusto, web search donde corresponde
- [ ] `lib/scoring.ts`: `computeCompositeScore()`, `computeConfidenceScore()`, `computeVolatilityScore()`, `getAffectedAgents(changedFields)`
- [ ] Server Actions: `createIdea()`, `updateIdea()` con invalidación selectiva por hash, `runContextAgent()`, `runAgentForIdea()`, `runAllAgents()`
- [ ] Migración: índices en `idea_id` y `agent_type` en tabla `analyses`

### Fase 2 — Exportación (Semanas 5–7)
- [ ] `scripts/export/docx.ts`: business case con docx-js (score, agentes, hipótesis, radar)
- [ ] `scripts/export/pdf.ts`: Puppeteer renderiza `/ideas/[id]/export` y devuelve PDF
- [ ] Server Action: `exportIdea(id, format)` que llama al script y guarda en Supabase Storage
- [ ] RLS multi-tenant: políticas para `workspace_members`, `ideas` y `analyses` por `workspace_id`

### Fase 3 — Optimización (Semanas 8–9)
- [ ] Activar `web_search_20250305` en `agents/market.ts` y `agents/competition.ts`
- [ ] Invalidación de caché inteligente: hash de inputs por agente, re-análisis solo si el hash cambia
- [ ] Migrar GTM y Founder Fit a `claude-haiku-4-5` en `lib/claude.ts`