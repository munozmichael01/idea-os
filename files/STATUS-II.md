# IdeaOS — Status del proyecto
_Actualizado: 30 abril 2026 — para continuar en chat nuevo_

---

## Cómo usar este documento

Si abres un chat nuevo con Claude, pega este documento completo al inicio y di:
"Continúa desde aquí. Somos Michael y estamos desarrollando IdeaOS."

---

## Stack técnico definitivo

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Framework | Next.js | **16.2.4** (Turbopack) | Actualizado desde 14 — breaking changes resueltos |
| Routing i18n | next-intl | 4.11.0 | Usar `requestLocale` (Promise) en `i18n/request.ts` |
| Base de datos | Supabase (PostgreSQL) | — | Proyecto conectado |
| ORM | Prisma | **7.8.0** | Config en `prisma.config.ts`, NO en `schema.prisma` |
| IA / Agentes | Anthropic Claude API | claude-sonnet-4 / haiku-4-5 | — |
| Audio input | OpenAI Whisper | — | — |
| Audio output | OpenAI TTS | — | Pendiente |
| Estilos | Tailwind + shadcn/ui | — | New York style, zinc. Diseño visual pendiente |
| i18n | next-intl | 4.11.0 | locales: es (default), en |
| Deploy | Vercel + Supabase | — | Repo conectado |
| Proxy/Middleware | `proxy.ts` (raíz) | — | En Next.js 16, middleware.ts → proxy.ts |

---

## Decisiones técnicas críticas (no repetir errores)

1. **Next.js 16 + Turbopack**: `params` es una Promise. Siempre `const { locale } = await params`.
2. **next-intl en Next.js 16**: `i18n/request.ts` debe usar `requestLocale` (Promise), no `locale` directamente.
3. **`getMessages()` en layout**: Debe pasarse `{ locale }` explícitamente: `getMessages({ locale })`.
4. **Middleware → proxy**: En Next.js 16, el archivo se llama `proxy.ts`, no `middleware.ts`.
5. **Prisma 7**: La conexión va en `prisma.config.ts`. El constructor es `new PrismaClient()` sin argumentos. NO usar `datasourceUrl`, NO poner `url`/`directUrl` en `schema.prisma`.
6. **Prisma en Client Components**: Nunca importar `@prisma/client` en código que llega al browser. Solo usar `lib/types.ts`.
7. **`generateStaticParams`**: Necesario en `app/[locale]/layout.tsx` y `app/[locale]/page.tsx`.

---

## Repo y servicios

- **GitHub**: https://github.com/munozmichael01/idea-os
- **Vercel**: conectado al repo, deploy automático en cada push
- **Supabase**: proyecto conectado, 3 migraciones aplicadas

---

## Variables de entorno (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Estado de fases

| Fase | Estado | Notas |
|---|---|---|
| Fase 0 — Setup | ✅ Completada | 10 tablas, RLS, types, supabase clients |
| Fase 1 — Core MVP | ✅ Completada | 6 agentes, scoring, Server Actions |
| Fase 2 — Backend | ✅ Completada | exportIdea(), workspaces.ts listos |
| Fase 2 — UI auth | ✅ Completada | Login/register con Supabase Auth funcionando |
| Fase 2 — UI dashboard | 🔄 Bloqueada | Error Prisma en lib/prisma.ts |
| Fase 3 | ⏳ Pendiente | — |

---

## Bloqueante activo

**Error de Prisma en dashboard — pendiente Claude Code**

Gemini modificó `lib/prisma.ts` incorrectamente añadiendo `datasourceUrl` al constructor:

```
PrismaClientConstructorValidationError:
Unknown property datasourceUrl provided to PrismaClient constructor
```

**Corrección correcta para Prisma 7:**
```typescript
// lib/prisma.ts — CORRECTO
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()  // sin argumentos
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
export default prisma
```

La conexión ya está en `prisma.config.ts`. Después de corregir, ejecutar `npx prisma generate`.

---

## Lo que está construido

### Claude Code
- 6 agentes: context (Haiku), market/competition (Sonnet+webSearch), economics (Sonnet), gtm/founder_fit (Haiku)
- `lib/claude.ts` — runContextAgent() + runAgent() con retry x3
- `lib/scoring.ts` — composite, confidence, volatility, getAffectedAgents()
- `lib/actions/ideas.ts` — createIdea, updateIdea (hash selectivo), runContextAgentForIdea, answerContextQuestions, runAgentForIdea, runAllAgents, getIdea, exportIdea
- `lib/actions/workspaces.ts` — createWorkspace, inviteMember, updateMemberRole, getWorkspaceMembers
- `lib/actions/auth.ts` — userId y workspaceId
- `scripts/export/docx.ts` y `pdf.ts`
- Prisma schema 10 modelos + 9 enums, 3 migraciones + RLS

### Gemini
- Login y register con Supabase Auth ✅
- `proxy.ts` con lógica de auth ✅
- Dashboard con 5 modos de ranking (bloqueado por Prisma)
- Formulario nueva idea (3 modos: libre, estructurado, audio)
- Página detalle `/ideas/[id]` con agent cards, edición inline
- `/api/audio/transcribe` con Whisper ✅
- `i18n/request.ts` correcto para Next.js 16 ✅
- `messages/es.json` y `messages/en.json`

---

## Próximos pasos en orden

### 1. Claude Code — corregir lib/prisma.ts (inmediato)
### 2. Verificar flujo completo de auth en local
- Crear usuario en Supabase → Authentication → Users
- Login → redirección a dashboard
- Dashboard carga sin errores

### 3. Gemini — Fase 2 UI restante
- Conectar botones exportar PDF/DOCX con `exportIdea()`
- `/ideas/[id]/export` — página HTML limpia con `[data-export-ready]`
- `/api/audio/synthesize` con OpenAI TTS
- Botón "Escuchar resumen"
- `/settings/team`

### 4. Claude Code — Fase 3
- Verificar web search activo en market y competition
- Invalidación de caché por hash en updateIdea()

### 5. Gemini — Fase 3
- Vista comparativa de dos ideas
- Historial de scoring
- QA visual mobile/accesibilidad

### 6. Diseño visual final (después de funcionalidad completa)
Aplicar el diseño oscuro del prototype original:
- Background: `#07070f`, accent: `#00E5A0`, naranja: `#FF6B35`
- Tipografías: Syne (headings), DM Sans (body), DM Mono (datos)

---

## División de trabajo

| Claude Code (VS Code) | Gemini (Antigravity) |
|---|---|
| agents/ | app/(app)/ |
| lib/ (excepto supabase/client.ts) | app/(auth)/ |
| prisma/ | app/api/audio/ |
| scripts/export/ | components/ |
| proxy.ts ← NO | messages/ |
| — | proxy.ts |

**Compartidos (Claude Code escribe, Gemini lee):** `lib/types.ts`, `lib/utils.ts`, `lib/supabase/client.ts`

---

## Prompts de arranque para nueva sesión

### Claude Code
```
Lee CLAUDE.md y STATUS.md. Estamos desarrollando IdeaOS.

Bloqueante inmediato: lib/prisma.ts fue modificado 
incorrectamente por Gemini. Corrígelo:
- new PrismaClient() sin argumentos
- Prisma 7 lee la conexión desde prisma.config.ts
- Ejecuta npx prisma generate tras corregirlo
- No toques app/ ni components/
```

### Gemini CLI
```
Lee GEMINI.md y STATUS.md. Estamos desarrollando IdeaOS.

Espera a que Claude Code corrija lib/prisma.ts.
Cuando dashboard cargue sin errores, continúa con 
las tareas de Fase 2 UI del STATUS.md.
No toques lib/, agents/, prisma/ ni scripts/.
```
