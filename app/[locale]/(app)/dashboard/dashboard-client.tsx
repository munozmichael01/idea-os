'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Idea } from '@/lib/types';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Plus, 
  Filter, 
  LayoutGrid, 
  List, 
  Lightbulb, 
  TrendingUp, 
  Rocket, 
  Clock,
  ArrowUp,
  ArrowDown,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { IdeaWithAnalyses } from '@/lib/types';
import { IdeaStatus } from '@prisma/client';

interface DashboardClientProps {
  initialIdeas: IdeaWithAnalyses[];
}

const StatCard = ({ label, value, unit, trend, icon: Icon }: any) => {
  const TrendIcon = trend?.dir === 'up' ? ArrowUp : ArrowDown;
  return (
    <div className="stat">
      <div className="stat-label">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <div className="stat-value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {trend && (
        <div className={`stat-trend ${trend.dir}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{trend.value}</span>
          <span style={{ color: 'var(--text-muted)' }} className="ml-1">· {trend.note}</span>
        </div>
      )}
    </div>
  );
};

export function DashboardClient({ initialIdeas }: DashboardClientProps) {
  const t = useTranslations('Ideas');
  const commonT = useTranslations('Common');
  const [rankingMode, setRankingMode] = React.useState('composite');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = React.useState<IdeaStatus>('ANALYZING');
  const [isMobile, setIsMobile] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsMobile(!mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const RANKING_MODES = [
    { id: 'composite', label: 'Oportunidad', desc: 'Score compuesto global' },
    { id: 'viable', label: 'Viabilidad', desc: 'Basado en confianza' },
    { id: 'edge', label: 'Ventaja', desc: 'Diferenciación competitiva' },
    { id: 'effort', label: 'Valor/Esfuerzo', desc: 'Retorno esperado' },
    { id: 'wild', label: 'Wildcard', desc: 'Alta volatilidad/riesgo' },
  ];

  const sortedIdeas = React.useMemo(() => {
    let list = initialIdeas.filter(i => i.status === activeTab);
    switch (rankingMode) {
      case 'viable':
        list.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
        break;
      case 'wild':
        list.sort((a, b) => (b.volatilityScore || 0) - (a.volatilityScore || 0));
        break;
      default:
        list.sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0));
    }
    return list;
  }, [initialIdeas, rankingMode, activeTab]);

  const isEmpty = sortedIdeas.length === 0 && initialIdeas.length === 0;
  const isTabEmpty = sortedIdeas.length === 0;

  const avgScore = initialIdeas.length > 0 
    ? initialIdeas.reduce((acc, curr) => acc + (curr.compositeScore || 0), 0) / initialIdeas.length 
    : 0;

  const highPriority = initialIdeas.filter(i => (i.compositeScore || 0) >= 7.5).length;
  const pendingAnalysis = initialIdeas.filter(i => (i.analyses?.length || 0) < 5).length;

  return (
    <div className="main">
      {/* Topbar */}
      <div className="topbar">
        <div className="search">
          <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input placeholder="Buscar ideas, sectores, hipótesis…" />
          <span className="kbd">⌘K</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-icon min-w-[44px] min-h-[44px]" title="Notificaciones">
            <Bell className="h-[15px] w-[15px]" />
          </button>
          <button className="btn btn-secondary">
            <Sparkles className="h-[13px] w-[13px]" />
            {isMobile ? 'Analizar' : 'Analizar todo'}
          </button>
          <Link href="/ideas/new">
            <button className="btn btn-primary">
              <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} />
              {isMobile ? 'Nueva' : 'Nueva idea'}
            </button>
          </Link>
        </div>
      </div>

      {/* Page header */}
      <div className="page-header mb-2">
        <div>
          <h1 className="page-title">
            {commonT('dashboard')}
          </h1>
          <p className="page-subtitle">
            {isEmpty
              ? 'Empieza capturando tu primera idea.'
              : `${initialIdeas.length} ideas en seguimiento · ${pendingAnalysis} en análisis · última actualización hace un momento.`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      {!isEmpty && (
        <div className="mb-8" style={{ overflowX: 'scroll', WebkitOverflowScrolling: 'touch' as unknown as undefined, maxWidth: '100%' }}>
          <div className="flex border-b border-[var(--border-subtle)]" style={{ minWidth: 'max-content' }}>
            <button
              className={cn("px-4 py-3 text-[13.5px] font-medium border-b-2 transition-all -mb-[1px] whitespace-nowrap", activeTab === 'ANALYZING' ? "border-[var(--text-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)]")}
              onClick={() => setActiveTab('ANALYZING')}
            >
              Analizando ({initialIdeas.filter(i => i.status === 'ANALYZING').length})
            </button>
            <button
              className={cn("px-4 py-3 text-[13.5px] font-medium border-b-2 transition-all -mb-[1px] whitespace-nowrap", activeTab === 'IMPLEMENTING' ? "border-[var(--text-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)]")}
              onClick={() => setActiveTab('IMPLEMENTING')}
            >
              Implementando ({initialIdeas.filter(i => i.status === 'IMPLEMENTING').length})
            </button>
            <button
              className={cn("px-4 py-3 text-[13.5px] font-medium border-b-2 transition-all -mb-[1px] whitespace-nowrap", activeTab === 'DISCARDED' ? "border-[var(--text-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)]")}
              onClick={() => setActiveTab('DISCARDED')}
            >
              Descartadas ({initialIdeas.filter(i => i.status === 'DISCARDED').length})
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {!isEmpty && (
        <div className="stats">
          <StatCard
            label="Ideas activas"
            value={initialIdeas.length}
            icon={Lightbulb}
            trend={{ dir: 'up', value: '+0', note: 'esta semana' }}
          />
          <StatCard
            label="Score medio"
            value={avgScore.toFixed(1)}
            unit="/10"
            icon={TrendingUp}
            trend={{ dir: 'up', value: '+0.0', note: 'vs. mes anterior' }}
          />
          <StatCard
            label="Alta prioridad"
            value={highPriority}
            icon={Rocket}
            trend={{ dir: 'up', value: '+0', note: 'desde el lunes' }}
          />
          <StatCard
            label="Análisis pendientes"
            value={pendingAnalysis}
            icon={Clock}
            trend={{ dir: 'down', value: '-0', note: 'completados hoy' }}
          />
        </div>
      )}

      {/* Ranking bar */}
      {!isTabEmpty && !isEmpty && (
        <>
          <div className="section-head flex items-center justify-between mb-4 gap-2">
            <h2 className="text-[15px] font-bold font-display flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline">Ranking de ideas</span>
              <span className="sm:hidden">Ranking</span>
              <span className="count px-2 py-0.5 rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[11px] font-normal text-[var(--text-muted)] font-mono">
                {sortedIdeas.length}
              </span>
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" size="sm" className="h-8 gap-1.5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
                <Filter className="h-3 w-3" />
                Filtros
              </Button>
              <div className="view-toggle flex bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded-[5px] transition-all", viewMode === 'grid' ? "bg-[var(--bg-elev)] text-[var(--text-primary)]" : "text-[var(--text-muted)]")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 rounded-[5px] transition-all", viewMode === 'list' ? "bg-[var(--bg-elev)] text-[var(--text-primary)]" : "text-[var(--text-muted)]")}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="ranking-bar flex items-center gap-3 mb-6 flex-wrap">
            <span className="ranking-label text-[12px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Modo</span>
            <div className="segmented flex bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] p-1 gap-0.5">
              {RANKING_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setRankingMode(mode.id)}
                  className={cn(
                    "px-3 py-1.5 text-[12.5px] rounded-[6px] transition-all",
                    rankingMode === mode.id ? "bg-[var(--bg-elev)] text-[var(--text-primary)] font-medium shadow-[inset_0_0_0_1px_var(--border-active)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                  title={mode.desc}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Content */}
      {isEmpty ? (
        <div className="empty border border-dashed border-[var(--border-subtle)] rounded-[16px] py-16 px-8 text-center bg-gradient-to-b from-[var(--bg-card)] to-transparent flex flex-col items-center gap-4">
          <div className="empty-icon h-16 w-16 rounded-[16px] bg-[var(--bg-elev)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--green)] relative after:absolute after:-inset-2 after:border after:border-[var(--border-subtle)] after:rounded-[20px] after:opacity-50">
            <Lightbulb className="h-7 w-7" />
          </div>
          <h3 className="text-[22px] font-bold font-display tracking-tight mt-2">Aún no tienes ideas</h3>
          <p className="text-[13.5px] text-[var(--text-secondary)] max-w-[380px] leading-relaxed mx-auto">
            Captura una idea en texto, voz o formato estructurado. Nuestros agentes la analizarán en menos de 90 segundos y verás un ranking en cuanto terminen.
          </p>
          <div className="flex gap-2 mt-4">
            <Link href="/ideas/new">
              <Button className="bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold gap-2">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                Crear primera idea
              </Button>
            </Link>
            <Button variant="secondary" className="border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] gap-2">
              <Mic className="h-3.5 w-3.5" />
              Grabar idea
            </Button>
          </div>
        </div>
      ) : isTabEmpty ? (
        <div className="empty border border-dashed border-[var(--border-subtle)] rounded-[16px] py-16 px-8 text-center flex flex-col items-center gap-4">
          <p className="text-[14px] text-[var(--text-secondary)]">No hay ideas en este estado.</p>
        </div>
      ) : (
        <div className={cn(
          "ideas-grid grid gap-3.5",
          viewMode === 'grid' ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
        )}>
          {sortedIdeas.map((idea, i) => (
            <IdeaCard key={idea.id} idea={idea} delay={i * 60} />
          ))}
        </div>
      )}

      {/* Activity */}
      {!isEmpty && (
        <>
          <div className="section-head mt-12 mb-4">
            <h2 className="text-[15px] font-bold font-display flex items-center gap-2">
              Actividad reciente 
              <span className="count px-2 py-0.5 rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[11px] font-normal text-[var(--green)] font-mono">
                live
              </span>
            </h2>
          </div>
          <div className="activity bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] p-1.5">
            {[
              { color: 'var(--green)', text: <><strong>{sortedIdeas[0]?.title || 'Idea'}</strong> completó análisis de viabilidad — score subió a <strong>{(sortedIdeas[0]?.compositeScore || 0).toFixed(1)}</strong></>, time: 'hace 2m' },
              { color: 'var(--purple)', text: <>Agente <strong>Go-to-market</strong> generó nueva hipótesis para <strong>{sortedIdeas[1]?.title || 'Idea'}</strong></>, time: 'hace 14m' },
              { color: 'var(--blue)', text: <><strong>{sortedIdeas[2]?.title || 'Idea'}</strong> · Founder Fit reanalizado tras editar el contexto</>, time: 'hace 1h' },
            ].map((row, i) => (
              <div key={i} className="activity-row flex items-start sm:items-center gap-3 px-3 sm:px-3.5 py-2.5 rounded-[8px] transition-all hover:bg-[var(--bg-elev)] text-[13px]">
                <span className="activity-icon h-1.5 w-1.5 rounded-full mt-1.5 sm:mt-0 shrink-0" style={{ background: row.color }} />
                <span className="activity-text text-[var(--text-secondary)] flex-1 min-w-0">{row.text}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="ghost" className="h-auto py-1 px-2 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Ver</Button>
                  <span className="activity-time font-mono text-[11px] text-[var(--text-muted)] hidden sm:inline">{row.time}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
