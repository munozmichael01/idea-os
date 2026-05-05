# IdeaOS — Design Brief para Claude Design

Eres el agente de diseño de IdeaOS. Tu trabajo es diseñar e implementar la interfaz visual completa de la aplicación, aplicando el sistema de diseño oscuro definido abajo sobre las pantallas existentes.

---

## Qué es IdeaOS

Plataforma SaaS para capturar, validar y priorizar ideas de negocio mediante agentes de IA especializados. Cada idea recibe análisis de 5 agentes (mercado, competencia, economía, go-to-market, fit con el fundador) y un scoring compuesto que genera un ranking dinámico.

---

## Sistema de diseño

### Colores
```
Background principal:  #07070f
Background cards:      #0a0a18
Background elevated:   #0d0d1a
Border sutil:          #1e1e3a
Border activo:         #2a2a4a

Accent verde:          #00E5A0   ← score alto, acciones primarias
Accent naranja:        #FF6B35   ← riesgos, score bajo
Accent amarillo:       #FFD700   ← score medio
Accent púrpura:        #A78BFA   ← agente GTM
Accent azul:           #38BDF8   ← agente Founder Fit

Texto principal:       #F0F0F0
Texto secundario:      #AAAAAA
Texto muted:           #555555
Texto placeholder:     #333333

Score alta prioridad:  #00E5A0   (≥7.5)
Score prometedora:     #FFD700   (≥6.5)
Score a desarrollar:   #FF6B35   (≥5.0)
Score baja prioridad:  #FF4444   (<5.0)
```

### Tipografías
```
Headings / logotipo:   Syne (700, 800)
Body / UI:             DM Sans (300, 400, 500)
Datos / monospace:     DM Mono (400, 500)
```

### Componentes base
- Bordes: border-radius 10-12px en cards, 6-8px en inputs y badges
- Score ring: SVG circular animado con el score en el centro en DM Mono
- Agent card: fondo #0d0d1a, borde izquierdo de color del agente, estado loading con barra superior animada
- Badge de prioridad: fondo con 15% opacidad del color del score, texto del mismo color
- Inputs: fondo #0d0d1a, borde #1e1e3a, focus con borde del accent color
- Botones primarios: fondo #00E5A0, texto #07070f, font-weight 700
- Botones secundarios: borde #1e1e3a, texto #888, hover con borde accent

### Colores por agente
```
Viabilidad de mercado:  #00E5A0
Análisis competitivo:   #FF6B35
Modelo económico:       #FFD700
Go-to-market:           #A78BFA
Fit con el fundador:    #38BDF8
Contexto (agente 0):    #888888
```

---

## Pantallas existentes

### 1. /es/login — Login
Archivo: app/[locale]/(auth)/login/page.tsx
Estados: formulario, loading (submit), error (credenciales incorrectas)
Elementos:
- Logo IDEAOS centrado (Syne 800, OS en #00E5A0)
- Tagline: "Valida y prioriza tus ideas de negocio con IA"
- Campo email
- Campo password
- Botón "Iniciar sesión" (primario)
- Link "¿No tienes cuenta? Registrarse"
- Error inline bajo el formulario

### 2. /es/register — Registro
Archivo: app/[locale]/(auth)/register/page.tsx
Estados: formulario, loading, éxito (mensaje de confirmación de email), error
Elementos:
- Logo IDEAOS
- Campo email
- Campo password
- Botón "Crear cuenta" (primario)
- Link "¿Ya tienes cuenta? Iniciar sesión"
- Estado éxito: mensaje "Revisa tu email para confirmar tu cuenta"

### 3. /es/dashboard — Dashboard / Ranking
Archivo: app/[locale]/(app)/dashboard/page.tsx
Estados: empty (sin ideas), con ideas, loading

Elementos:
- Header con título "Mis ideas" y botón "+ Nueva idea"
- Selector de modo de ranking (5 opciones):
  - Mejor oportunidad total
  - Más viable ahora
  - Mayor ventaja competitiva
  - Mejor valor / esfuerzo
  - Más incierta
- Grid de IdeaCards
- Empty state: ilustración + "Aún no tienes ideas. Crea tu primera idea." + botón CTA

IdeaCard (componente clave):
- Score ring grande (SVG, 56px) con composite_score
- Título de la idea (Syne 700)
- Sector + modelo de negocio (DM Mono, muted)
- Badge de prioridad
- Barra de progreso de análisis (N/5 agentes completados)
- Confidence score y volatility score como indicadores secundarios

### 4. /es/ideas/new — Nueva idea
Archivo: app/[locale]/(app)/ideas/new/page.tsx
Flujo en 3 pasos:

Paso 1 — Input (3 modos con tabs):
- Modo libre: título + descripción (textarea grande)
- Modo estructurado: título, descripción, sector (select), mercado objetivo, modelo de negocio (select), notas
- Modo audio: botón grande de grabación, indicador de grabación activa, transcript en tiempo real

Paso 2 — Preguntas de contexto:
- Título: "Antes de analizar tu idea..."
- Lista de 3-5 preguntas generadas por el agente de contexto
- Campo de respuesta por pregunta (opcional)
- Botón "Responder y analizar" (primario)
- Botón "Saltar y analizar" (secundario)
- Indicador: "Las respuestas mejoran la calidad del análisis"

Paso 3 — Análisis en progreso:
- Vista de los 5 agentes corriendo en paralelo
- Cada agente con estado: pendiente → analizando (animación) → completado
- Score aparece cuando el agente termina
- Botón "Ver resultados" cuando todos terminan

### 5. /es/ideas/[id] — Detalle de idea
Archivo: app/[locale]/(app)/ideas/[id]/page.tsx
Estados: loading, con datos completos, con análisis parcial

Secciones:

Header:
- Título editable inline
- Score ring grande (72px) con composite_score
- Confidence score (0-1) como barra horizontal verde
- Volatility score (0-1) como barra horizontal naranja
- Badges: sector, modelo de negocio
- Botones: "Analizar todo", "Escuchar resumen", "Exportar PDF", "Exportar DOCX"

Campos editables:
- Descripción (textarea), Sector (select), Mercado objetivo (input), Modelo de negocio (select), Notas (textarea)
- Cada campo muestra un badge "Actualiza: [agentes afectados]" al hacer focus
- Botón "Guardar cambios" que dispara re-análisis selectivo

Cards de agentes (6 cards: contexto + 5 análisis):
- Color de borde izquierdo según el agente
- Score del agente (1-10) con ring pequeño
- Headline del análisis
- Fortalezas (lista con check verde)
- Riesgos (lista con guión naranja)
- Recomendación accionable
- Siguiente acción de validación
- Botón "Re-analizar" (aparece al hover)
- Estado loading con barra superior animada
- Empty state por agente: "Este agente aún no ha analizado la idea" + botón "Analizar ahora"

Hipótesis:
- Agrupadas por criticidad (Alta / Media / Baja)
- Cada hipótesis con badge de estado: No validada / Confirmada / Invalidada
- Botones para cambiar estado

---

## Sidebar / Layout de la app

Presente en todas las rutas (app)/:
- Logo IDEAOS en la parte superior
- Navegación: Dashboard, Ideas, Nueva Idea, Configuración
- Selector de idioma (ES / EN) en la parte inferior
- Toggle de sidebar (colapsable)
- Avatar del usuario + email en la parte inferior

---

## Principios de diseño

1. Dark first: todo sobre fondo oscuro, nunca blanco en las vistas de app
2. Data density: mostrar máxima información sin saturar — usar jerarquía tipográfica
3. Color semántico: verde = positivo/alto, naranja = riesgo/bajo, amarillo = medio
4. Monospace para datos: scores, fechas, porcentajes siempre en DM Mono
5. Animaciones funcionales: solo donde comunican estado (loading, transición de score)
6. Empty states útiles: siempre con CTA claro, nunca una página en blanco
7. Referencia estética: Linear, Raycast, Vercel dashboard. No Apple, no Material Design.

---

## Stack técnico

- Next.js 16.2.4 (App Router, Turbopack)
- Tailwind CSS + shadcn/ui (New York style, zinc)
- Google Fonts: Syne + DM Sans + DM Mono (importar en globals.css o layout)
- Recharts para gráficos de radar e historial de scoring

---

## Instrucciones

1. Diseña e implementa todas las pantallas listadas arriba con el sistema de diseño definido
2. Implementa todos los estados por pantalla: empty, loading, error, con datos
3. No toques: lib/, agents/, prisma/, scripts/
4. Importa Server Actions desde @/lib/actions/ideas — no las reimplementes
5. Usa tipos de @/lib/types.ts para tipar los props
6. Haz commit y push al terminar cada pantalla, no todas juntas
7. El sidebar y layout ya existe — mejora su visual, no lo rehaces desde cero
8. Empieza por el dashboard y la página de detalle de idea — son las más críticas
