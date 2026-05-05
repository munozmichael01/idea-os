// IdeaOS — Agent definitions + mock analyses
const AGENTS = [
  {
    id: 'context', name: 'Contexto', short: 'CTX',
    color: 'var(--a-ctx)', colorVar: '--a-ctx',
    role: 'Encuadra la idea y enriquece el brief',
  },
  {
    id: 'market', name: 'Viabilidad de mercado', short: 'MKT',
    color: 'var(--a-market)', colorVar: '--a-market',
    role: 'Tamaño, demanda real y timing',
  },
  {
    id: 'comp', name: 'Análisis competitivo', short: 'COMP',
    color: 'var(--a-comp)', colorVar: '--a-comp',
    role: 'Players, moats y diferenciación',
  },
  {
    id: 'econ', name: 'Modelo económico', short: 'ECON',
    color: 'var(--a-econ)', colorVar: '--a-econ',
    role: 'Unit economics, pricing y CAC/LTV',
  },
  {
    id: 'gtm', name: 'Go-to-market', short: 'GTM',
    color: 'var(--a-gtm)', colorVar: '--a-gtm',
    role: 'Canales de adquisición y narrativa',
  },
  {
    id: 'fit', name: 'Fit con el fundador', short: 'FIT',
    color: 'var(--a-fit)', colorVar: '--a-fit',
    role: 'Ventajas únicas y energía de ejecución',
  },
];

const INMOGROWTH_ANALYSES = {
  context: {
    status: 'done', score: null,
    headline: 'Inmobiliarias medianas españolas pagan por leads, no por SEO.',
    strengths: [
      'Presupuesto ya asignado a captación (Idealista, Fotocasa)',
      'Fragmentación: ~12k agencias con menos de 5 agentes',
      'Datos de intención públicos en SEPE, INE y portales'
    ],
    risks: [
      'Ciclo de venta enterprise lento (2-4 meses)',
    ],
    recommendation: 'Validar con 5 inmobiliarias en Madrid antes de construir más allá del MVP.',
    nextAction: 'Agendar 5 entrevistas con head of growth de inmobiliarias 2-10 agentes.',
  },
  market: {
    status: 'done', score: 8.6,
    headline: 'Mercado de €340M con CAGR del 14% en CRM vertical inmobiliario.',
    strengths: [
      'Reactivación post-2024 del residencial en zonas urbanas',
      'Tendencia clara a verticalización del CRM',
      'Compradores deciden online en >82% de los casos'
    ],
    risks: [
      'Concentración: top 3 portales capturan 70% del tráfico',
      'Sensibilidad al ciclo macro de tipos'
    ],
    recommendation: 'Posicionar como capa de inteligencia sobre los portales, no como reemplazo.',
    nextAction: 'Comprar muestra de leads de Idealista y medir conversion rate base.',
  },
  comp: {
    status: 'done', score: 7.4,
    headline: 'Competidores fuertes en Estados Unidos pero gap claro en SoEU.',
    strengths: [
      'Compass (US) cotiza 4.2x revenue · prueba de modelo',
      'Witei y Sooprema fragmentados sin layer predictivo',
      'Idealista no compite con sus propios anunciantes'
    ],
    risks: [
      'Idealista podría lanzar feature similar en 18 meses',
      'Riesgo de comoditización si OpenAI publica embeddings inmobiliarios'
    ],
    recommendation: 'Construir moat en datos propios de comportamiento, no en el modelo.',
    nextAction: 'Negociar acceso exclusivo a histórico anonimizado con 1 inmobiliaria piloto.',
  },
  econ: {
    status: 'done', score: 8.1,
    headline: 'Unit economics sanos a partir de la cuenta nº 30. CAC payback ~6 meses.',
    strengths: [
      'ARPU objetivo €490/mes · alta gross margin (87%)',
      'Churn de referencia en CRM vertical: 1.6% mensual',
      'Expansion natural por agente añadido'
    ],
    risks: [
      'CAC inicial alto en outbound · dependencia de un buen SDR'
    ],
    recommendation: 'Pricing por seat + uso de IA, con tier gratuito para agencias <3.',
    nextAction: 'Construir calculadora de ROI personalizada para usar en demos.',
  },
  gtm: {
    status: 'done', score: 8.9,
    headline: 'Eventos sectoriales + partner con 1 portal regional desbloquean 50 cuentas.',
    strengths: [
      'Comunidad inmobiliaria muy concentrada en LinkedIn',
      'API Inmobiliaria es vector de demos virales',
      'Founder con red en SIMA + Salón Inmobiliario'
    ],
    risks: [
      'Dependencia de eventos físicos para conversiones grandes'
    ],
    recommendation: 'Lanzamiento "wedge" con herramienta gratuita de valoración predictiva.',
    nextAction: 'Diseñar landing wedge con waitlist para SIMA mayo 2026.',
  },
  fit: {
    status: 'done', score: 8.7,
    headline: 'Founder con 7 años en proptech y ventaja de red en SIMA.',
    strengths: [
      'Ex Idealista (2018-2022) con conocimiento del playbook interno',
      'Red activa con CEOs de inmobiliarias top-50',
      'Experiencia previa lanzando vertical SaaS de cero'
    ],
    risks: [
      'Necesidad de partner técnico ML senior'
    ],
    recommendation: 'Cerrar CTO con perfil ML antes de la pre-seed.',
    nextAction: 'Activar 3 conversaciones de CTO esta semana.',
  },
};

const HYPOTHESES = [
  {
    id: 'h1', criticality: 'Alta', status: 'No validada',
    text: 'Las inmobiliarias de 2-10 agentes pagan más de €400/mes si la herramienta les genera ≥3 leads cualificados al mes.',
    agent: 'econ',
  },
  {
    id: 'h2', criticality: 'Alta', status: 'Confirmada',
    text: 'El head of growth tiene autonomía de compra hasta €1k/mes sin necesidad de board approval.',
    agent: 'gtm',
  },
  {
    id: 'h3', criticality: 'Alta', status: 'No validada',
    text: 'Los datos públicos de SEPE + INE son suficientes para predecir intención con AUC > 0.78.',
    agent: 'market',
  },
  {
    id: 'h4', criticality: 'Media', status: 'No validada',
    text: 'Idealista no añadirá un módulo predictivo en los próximos 18 meses.',
    agent: 'comp',
  },
  {
    id: 'h5', criticality: 'Media', status: 'Invalidada',
    text: 'Una integración con CRMs existentes (Witei/Sooprema) es indispensable para vender.',
    agent: 'comp',
  },
  {
    id: 'h6', criticality: 'Baja', status: 'No validada',
    text: 'Se puede empaquetar el producto en formato self-serve para agencias <3 agentes.',
    agent: 'fit',
  },
];

window.AGENTS = AGENTS;
window.INMOGROWTH_ANALYSES = INMOGROWTH_ANALYSES;
window.HYPOTHESES = HYPOTHESES;
