# IdeaOS — Status del proyecto
_Actualizado: 30 abril 2026_

---

## Estado general

| Fase | Estado | Responsable |
|---|---|---|
| Fase 0 — Setup | ✅ Completada | Claude Code + Gemini |
| Fase 1 — Core MVP | ✅ Completada | Claude Code + Gemini |
| Fase 2 — Exportación + Multi-tenant | 🔄 En progreso | Claude Code + Gemini |
| Fase 3 — Web search + Comparativa + Pulido | ⏳ Pendiente | Claude Code + Gemini |

---

## Bloqueante activo

**Error de arranque en local — asignado a Gemini**

```
[next-intl] Could not locate request configuration module.
Expected: i18n/request.ts en la raíz del proyecto
```

**No lanzar más trabajo a ningún agente hasta que `localhost:3000` cargue sin errores.**

---

## Lo que está construido

### Infraestructura (Claude Code)
- Next.js 14 App Router, TypeScript strict, ESLint, Prettier
- Prisma 7 con 10 modelos + 9 enums, 3 migraciones aplicadas en Supabase
- RLS habilitado en las 10 tablas con ~20 políticas por workspace
- `lib/types.ts` — contrato completo entre Claude Code y Gemini
- `lib/supabase/client.ts` y `lib/supabase/server.ts`

### Agentes (Claude Code)
- `agents/context.ts` — Haiku, genera summary + 3–5 preguntas con `affectedAgents[]`
- `agents/market.ts` — Sonnet + web search
- `agents/competition.ts` — Sonnet + web search
- `agents/economics.ts` — Sonnet
- `agents/gtm.ts` — Haiku
- `agents/founder_fit.ts` — Haiku
- `lib/claude.ts` — `runContextAgent()` + `runAgent()` con retry x3 y JSON parsing robusto
- `lib/scoring.ts` — composite, confidence, volatility scores + `getAffectedAgents()`

### Server Actions (Claude Code)
Todas en `lib/actions/ideas.ts`:
- `createIdea()` — crea idea en DB
- `updateIdea()` — actualiza + re-análisis selectivo por hash
- `runContextAgentForIdea()` — ejecuta agente de contexto
- `answerContextQuestions()` — guarda respuestas JSONB + dispara `runAllAgents()`
- `runAgentForIdea()` — ejecuta un agente específico
- `runAllAgents()` — 5 agentes en paralelo + refresca scores
- `getIdea()` — idea completa con todas las relaciones
- `exportIdea(ideaId, userId, format)` — genera PDF/DOCX y sube a Supabase Storage

### Exportación (Claude Code)
- `scripts/export/docx.ts` — business case con docx-js (score, agentes, hipótesis, next actions)
- `scripts/export/pdf.ts` — Puppeteer renderiza `/ideas/[id]/export` y genera PDF A4
- Archivos subidos a bucket `idea-exports` con signed URL de 7 días

### UI (Gemini)
- Formulario nueva idea: modo libre + estructurado + audio (Whisper integrado)
- Pantalla de preguntas de contexto con opciones responder/saltar
- Dashboard con IdeaCard y 5 modos de ranking conectados a datos reales
- Página `/ideas/[id]` con Server Actions conectadas:
  - Score rings (composite, confidence, volatility)
  - Cards de 6 agentes con score, headline, strengths, risks, next action
  - Edición inline con indicadores de agentes afectados
  - Sección de hipótesis agrupadas por criticidad y estado
  - Botones Analizar todo / por agente / Escuchar resumen / Exportar
- `lib/actions/auth.ts` — obtiene userId y workspaceId de forma segura
- i18n es/en en todas las vistas

---

## En progreso ahora

| Agente | Tarea | Estado |
|---|---|---|
| Gemini | Fix error next-intl (`i18n/request.ts`) | 🔄 Activo |
| Claude Code | En espera hasta que localhost cargue | ⏸ Pausado |

---

## Próximos pasos (en orden)

### 1. Inmediato — resolver bloqueante
- [ ] Gemini: crear `i18n/request.ts` y verificar `next.config.mjs`
- [ ] Confirmar que `localhost:3000` carga sin errores
- [ ] Hacer prueba del flujo completo en local antes de continuar

### 2. Prueba del flujo completo (tú)
Antes de lanzar Fase 2 completa, verificar manualmente:
- [ ] Crear idea en modo libre
- [ ] Crear idea en modo estructurado
- [ ] Crear idea con audio
- [ ] Responder preguntas de contexto y saltar en otra
- [ ] Verificar que los 5 agentes corren y scores aparecen
- [ ] Editar un campo y confirmar re-análisis selectivo
- [ ] Exportar en PDF
- [ ] Exportar en DOCX

### 3. Fase 2 — Claude Code (lanzar tras confirmar localhost)
- [ ] RLS multi-tenant completo: políticas para `workspace_members`, `ideas` y `analyses` por `workspace_id`
- [ ] `lib/actions/workspaces.ts`: `createWorkspace()`, `inviteMember()`, `updateMemberRole()`, `getWorkspaceMembers()`

### 4. Fase 2 — Gemini (lanzar en paralelo con Claude Code)
- [ ] Conectar botones exportar PDF y DOCX con `exportIdea()` — abrir URL en nueva pestaña
- [ ] Crear `/ideas/[id]/export` — página HTML limpia sin layout con `[data-export-ready]` en el DOM
- [ ] `/api/audio/synthesize` con OpenAI TTS
- [ ] Botón "Escuchar resumen" conectado al audio generado
- [ ] `/settings/team` — listar miembros, invitar, cambiar roles
- [ ] i18n completo en inglés (`messages/en.json`)

### 5. Fase 3 (tras completar Fase 2)
- [ ] Claude Code: invalidación de caché inteligente por hash de inputs
- [ ] Claude Code: migrar GTM y Founder Fit a Haiku (ya están en Haiku — verificar)
- [ ] Gemini: vista comparativa de dos ideas (radar superpuesto + tabla)
- [ ] Gemini: historial de scoring por idea (gráfico de línea)
- [ ] Gemini: QA visual — mobile responsive, accesibilidad, loading states

---

## Decisiones pendientes

| Decisión | Opciones | Criterio |
|---|---|---|
| Modelo de billing | Freemium / Pro mensual / Por workspace | Validar con primeros 5 usuarios externos |
| Perfil del fundador configurable | Solo Michael (hardcoded) vs. formulario por usuario | Depende de apertura a clientes externos |
| Proveedor TTS | OpenAI TTS vs. ElevenLabs | Evaluar calidad con primeros usuarios |
| Confidence Score: auto vs. manual | IA estima vs. usuario ajusta con evidencia | Empezar auto en MVP, ajuste manual en v2 |
| Experiments: integración externa | Solo interno vs. link a Notion/Google Sheets | Tras ver cómo usan el módulo |

---

## Archivos clave del proyecto

```
idea-os/
  ├── CLAUDE.md                    ← contexto y tareas para Claude Code
  ├── GEMINI.md                    ← contexto y tareas para Gemini CLI
  ├── agents/                      ← 6 agentes (context + 5 análisis)
  ├── lib/
  │   ├── types.ts                 ← contrato entre agentes
  │   ├── claude.ts                ← cliente Anthropic
  │   ├── scoring.ts               ← lógica de scores
  │   ├── actions/
  │   │   ├── ideas.ts             ← Server Actions principales
  │   │   ├── auth.ts              ← sesión y workspace
  │   │   └── workspaces.ts        ← pendiente Claude Code
  │   └── supabase/
  ├── scripts/export/              ← PDF y DOCX
  ├── app/
  │   ├── [locale]/
  │   │   ├── (auth)/              ← login, register
  │   │   └── (app)/
  │   │       ├── dashboard/
  │   │       ├── ideas/
  │   │       │   ├── new/
  │   │       │   └── [id]/
  │   │       └── settings/
  │   └── api/audio/               ← transcribe (listo) + synthesize (pendiente)
  ├── messages/
  │   ├── es.json                  ← completo
  │   └── en.json                  ← pendiente completar
  └── prisma/
```

---

## Repo y servicios

- **GitHub**: https://github.com/munozmichael01/idea-os
- **Vercel**: conectado al repo, deploy automático en cada push
- **Supabase**: proyecto conectado, 3 migraciones aplicadas
