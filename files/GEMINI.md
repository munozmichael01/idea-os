# IdeaOS — Contexto para Gemini CLI

Eres el agente responsable de la **UI, componentes y rutas** de IdeaOS, una plataforma SaaS multi-tenant para validar y priorizar ideas de negocio con IA.

Trabajas en paralelo con Claude Code (corriendo en VS Code). Cada agente tiene archivos exclusivos. **No toques los archivos de Claude Code.**

---

## Stack

- **Framework**: Next.js 14 (App Router), TypeScript estricto
- **Estilos**: Tailwind CSS + shadcn/ui (New York style, zinc)
- **Base de datos**: Supabase (PostgreSQL) + Prisma ORM
- **Audio input**: OpenAI Whisper API (`/api/audio/transcribe`)
- **Audio output**: OpenAI TTS API (`/api/audio/synthesize`)
- **i18n**: next-intl (locales: `es`, `en`)
- **Deploy**: Vercel + Supabase

---

## Principios de desarrollo

- TypeScript estricto. Sin `any` implícitos.
- Server Components por defecto. Client Components solo cuando sea imprescindible (interactividad, hooks de estado).
- Importar Server Actions de Claude Code para mutaciones. No crear lógica de negocio propia.
- Todos los strings visibles en UI deben estar en `messages/es.json` y `messages/en.json`.
- Componentes pequeños y reutilizables en `components/`.
- Siempre añadir loading states, error states y empty states en cada vista.

---

## Tus archivos exclusivos (Claude Code no los toca)

```
app/(app)/dashboard/           ← ranking de ideas, 5 modos de ordenación
app/(app)/ideas/new/           ← formulario nueva idea (libre + estructurado + audio)
app/(app)/ideas/[id]/page.tsx  ← detalle de idea (solo UI, consume Server Actions)
app/(app)/ideas/[id]/experiments/ ← módulo de validaciones
app/(app)/settings/            ← workspace, equipo, billing
app/(auth)/                    ← login, register, invite
components/ui/                 ← componentes shadcn/ui y propios
app/api/audio/transcribe/      ← route.ts con Whisper API
app/api/audio/synthesize/      ← route.ts con OpenAI TTS
messages/es.json               ← todas las traducciones en español
messages/en.json               ← todas las traducciones en inglés
```

## Archivos compartidos (puedes leer, Claude Code escribe)

```
lib/types.ts                   ← tipos de Prisma, tu fuente de verdad para props y respuestas
lib/utils.ts                   ← utilidades generales
lib/supabase/client.ts         ← cliente Supabase browser-side
```

## Archivos de Claude Code (solo leer, nunca modificar)

```
agents/
lib/scoring.ts
lib/claude.ts
lib/supabase/server.ts
lib/supabase/rls.ts
prisma/schema.prisma
prisma/migrations/
scripts/export/
```

---

## Modelo de datos (para tipado de props y UI)

Importa siempre los tipos desde `lib/types.ts`. Los tipos principales que usarás:

```typescript
// Ideas
type Idea = {
  id: string
  title: string
  description: string
  sector: string
  targetMarket: string
  businessModel: string
  notes: string
  compositeScore: number | null
  confidenceScore: number | null
  volatilityScore: number | null
  status: 'active' | 'archived'
  inputType: 'text' | 'audio'
  analyses: Analysis[]
  hypotheses: Hypothesis[]
  createdAt: Date
  updatedAt: Date
}

// Análisis por agente
type Analysis = {
  id: string
  agentType: 'market' | 'competition' | 'economics' | 'gtm' | 'founder_fit'
  score: number
  headline: string
  strengths: string[]
  risks: string[]
  recommendation: string
  hypotheses: string[]
  nextValidationAction: string
  createdAt: Date
}

// Hipótesis
type Hypothesis = {
  id: string
  agentType: string
  description: string
  criticality: 'high' | 'medium' | 'low'
  status: 'unvalidated' | 'confirmed' | 'invalidated'
}
```

---

## Vistas que construyes

### Dashboard (`/dashboard`)
- Lista de ideas ordenadas por score (default)
- Selector de 5 modos de ranking:
  - **Mejor oportunidad total** — composite_score desc
  - **Más viable ahora** — score de viabilidad + founder fit
  - **Mayor ventaja competitiva** — score competitivo
  - **Mejor valor / esfuerzo** — ratio impacto vs. complejidad
  - **Más incierta** — volatility_score desc (qué validar primero)
- Cada idea muestra: score ring, título, sector, modelo de negocio, etiqueta de prioridad
- Etiquetas: Alta prioridad (≥7.5, verde), Prometedora (≥6.5, amarillo), A desarrollar (≥5.0, naranja), Baja prioridad (<5.0, rojo)

### Nueva idea (`/ideas/new`)
- **Modo libre**: solo título + descripción
- **Modo estructurado**: título, descripción, sector, target_market, business_model, notas
- **Modo audio**: botón de grabación → llamada a `/api/audio/transcribe` → el transcript se vuelca en el formulario libre para que el usuario lo revise antes de guardar
- Al guardar: llamar Server Action `createIdea()` → automáticamente corre `runContextAgent()`
- **Pantalla de preguntas de contexto**: tras guardar, mostrar las 3–5 preguntas que generó el Agente de Contexto. El usuario puede responder o hacer clic en "Saltar y analizar". Las respuestas se envían con `answerContextQuestions()` antes de lanzar los agentes de análisis.
- Indicar visualmente que las respuestas mejoran la calidad del análisis pero no son obligatorias

### Detalle de idea (`/ideas/[id]`)
- Campos editables inline (llamar `updateIdea()` al guardar)
- Score ring grande con composite_score, confidence_score y volatility_score
- Cards por agente (5): score, headline, strengths, risks, recommendation, next_validation_action
- Botón "Analizar" / "Re-analizar" por agente → llama `runAgentForIdea()`
- Botón "Analizar todo" → llama `runAllAgents()` (Promise.allSettled, feedback de progreso)
- Botón "Escuchar resumen" → llama `/api/audio/synthesize` y reproduce el audio inline
- Botones exportar PDF y DOCX → llaman Server Action `exportIdea(id, format)`
- Sección de hipótesis generadas por los agentes con su estado (unvalidated / confirmed / invalidated)

### Experimentos (`/ideas/[id]/experiments`)
- Lista de experimentos vinculados a hipótesis
- Crear experimento: tipo (interview / landing / smoke_test / benchmark), descripción, hipótesis vinculada
- Actualizar estado (pending → in_progress → done) y registrar resultado

### Settings (`/settings/team`)
- Listar miembros del workspace con su rol
- Invitar por email
- Cambiar rol (solo owner puede)
- Selector de workspace si el usuario tiene más de uno

---

## Audio APIs que implementas

### `/api/audio/transcribe/route.ts`
```typescript
// Recibe: FormData con campo 'audio' (archivo de audio)
// Llama: OpenAI Whisper API
// Devuelve: { transcript: string }
// El transcript se pasa al formulario de nueva idea, NO se guarda directamente como idea
```

### `/api/audio/synthesize/route.ts`
```typescript
// Recibe: { text: string, idea_id: string }
// Llama: OpenAI TTS API (voz: 'nova' o 'alloy')
// Guarda el audio en Supabase Storage
// Devuelve: { audio_url: string }
```

---

## Variables de entorno que te corresponden

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...              # para Whisper y TTS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Punto de integración con Claude Code

- Importa las Server Actions de Claude Code así:
  ```typescript
  import { createIdea, updateIdea, runAgentForIdea, runAllAgents, exportIdea } from '@/lib/actions/ideas'
  ```
- Nunca implementes lógica de negocio propia. Si necesitas algo que no existe como Server Action, es una tarea para Claude Code.
- `lib/types.ts` es el contrato. Si algo no cuadra con los tipos, consulta antes de improvisar.
- Antes de implementar una vista que consume una Server Action nueva: confirma que Claude Code ya la tiene implementada en el repositorio.

---

## Tareas por fase

### Fase 0 — Setup (Semana 1)
- [ ] Configurar next-intl: middleware, routing `[locale]`, archivos `es.json` / `en.json` con estructura base
- [ ] Crear layout raíz autenticado: sidebar, header, selector de locale
- [ ] Estructura de rutas `(auth)` y `(app)` con redirección por middleware
- [ ] Configurar Tailwind + shadcn/ui (New York style, zinc). Deploy base en Vercel sin errores.

### Fase 1 — Core MVP (Semanas 2–4)
- [ ] Formulario nueva idea: modo libre + modo estructurado con validación client-side
- [ ] `/api/audio/transcribe/route.ts` con Whisper. El transcript vuelca en el formulario libre.
- [ ] Pantalla de preguntas de contexto: muestra las preguntas del Agente de Contexto con campos de respuesta. Botón "Responder y analizar" y botón "Saltar y analizar".
- [ ] Dashboard: IdeaCard (score ring, etiqueta, sector, modelo). Selector de 5 modos de ranking.
- [ ] Página `/ideas/[id]`: campos editables con indicador visual de qué agentes se re-ejecutarán al guardar ese campo, cards de agentes, botones analizar, botón escuchar resumen
- [ ] Loading states y feedback visual cuando los agentes están corriendo

### Fase 2 — Exportación + Experimentos + Multi-tenant (Semanas 5–7)
- [ ] `/api/audio/synthesize/route.ts` con OpenAI TTS. Botón "Escuchar resumen" en página de idea.
- [ ] Página `/ideas/[id]/export` (HTML limpio sin layout, optimizado para Puppeteer)
- [ ] Módulo de experimentos: lista, crear, actualizar estado, registrar resultado
- [ ] `/settings/team`: listar miembros, invitar por email, cambiar roles, selector de workspace
- [ ] i18n completo: traducir todos los strings al inglés en `messages/en.json`

### Fase 3 — Comparativa + Pulido (Semanas 8–9)
- [ ] Vista comparativa de dos ideas: radar superpuesto con Recharts + tabla lado a lado
- [ ] Historial de scoring: gráfico de línea con composite_score y confidence a lo largo del tiempo
- [ ] QA visual: mobile responsive, accesibilidad (aria-labels, contraste), loading states en todas las páginas
