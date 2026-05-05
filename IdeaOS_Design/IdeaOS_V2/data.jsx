// IdeaOS — Mock data
const MOCK_IDEAS = [
  {
    id: 'inmogrowth',
    title: 'Inmogrowth',
    sector: 'Real estate',
    model: 'Marketplace · SaaS',
    market: 'ES · LatAm',
    description: 'Plataforma de captación predictiva para inmobiliarias medianas que conecta señales de intención con agentes locales.',
    score: 8.4,
    confidence: 0.82,
    volatility: 0.34,
    agentsDone: 5,
    agentStatuses: ['done','done','done','done','done'],
    activity: 'hace 2h'
  },
  {
    id: 'cold-dm',
    title: 'Cold-DM Loop',
    sector: 'B2B SaaS',
    model: 'Vertical SaaS',
    market: 'EU · US',
    description: 'Outreach asincrónico via DMs personalizados con IA para founders early-stage.',
    score: 7.9,
    confidence: 0.71,
    volatility: 0.42,
    agentsDone: 5,
    agentStatuses: ['done','done','done','done','done'],
    activity: 'hace 6h'
  },
  {
    id: 'real-state',
    title: 'Real State Pro',
    sector: 'PropTech',
    model: 'Subscription',
    market: 'Global',
    description: 'CRM minimalista para portfolios de menos de 20 propiedades.',
    score: 6.8,
    confidence: 0.65,
    volatility: 0.51,
    agentsDone: 5,
    agentStatuses: ['done','done','done','done','done'],
    activity: 'ayer'
  },
  {
    id: 'foodloop',
    title: 'FoodLoop',
    sector: 'Marketplace',
    model: 'Comisión',
    market: 'ES',
    description: 'Excedente diario de cocinas oscuras a comedores escolares.',
    score: 7.2,
    confidence: 0.58,
    volatility: 0.29,
    agentsDone: 4,
    agentStatuses: ['done','done','done','done','running'],
    activity: 'analizando'
  },
  {
    id: 'studio-ai',
    title: 'Studio.ai',
    sector: 'Creator economy',
    model: 'Freemium',
    market: 'Global',
    description: 'Asistente de producción para podcasters solopreneurs.',
    score: 5.8,
    confidence: 0.44,
    volatility: 0.66,
    agentsDone: 5,
    agentStatuses: ['done','done','done','done','done'],
    activity: 'hace 3 días'
  },
  {
    id: 'tabwise',
    title: 'Tabwise',
    sector: 'Productividad',
    model: 'Pro tier',
    market: 'EN',
    description: 'Sesiones de pestañas que respiran con tu calendario.',
    score: 4.6,
    confidence: 0.31,
    volatility: 0.72,
    agentsDone: 3,
    agentStatuses: ['done','done','done','running','idle'],
    activity: 'analizando'
  },
];

const RANKING_MODES = [
  { id: 'composite', label: 'Mejor oportunidad total', icon: 'IconSparkles', desc: 'Score compuesto ponderado' },
  { id: 'viable', label: 'Más viable ahora', icon: 'IconShield', desc: 'Mayor confianza, menor riesgo' },
  { id: 'edge', label: 'Mayor ventaja competitiva', icon: 'IconTrending', desc: 'Diferenciación de mercado' },
  { id: 'effort', label: 'Mejor valor / esfuerzo', icon: 'IconCoin', desc: 'ROI de implementación' },
  { id: 'wild', label: 'Más incierta', icon: 'IconDice', desc: 'Alta volatilidad, alto upside' },
];

window.MOCK_IDEAS = MOCK_IDEAS;
window.RANKING_MODES = RANKING_MODES;
