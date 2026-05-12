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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [filterSectors, setFilterSectors] = React.useState<string[]>([]);
  const [filterModels, setFilterModels] = React.useState<string[]>([]);
  const [filterMinScore, setFilterMinScore] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(true);

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsMobile(!mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem('idea-os-view-mode');
    if (saved === 'list' || saved === 'grid') setViewMode(saved);
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('idea-os-view-mode', mode);
  };

  const availableSectors = React.useMemo(
    () => [...new Set(initialIdeas.map(i => i.sector).filter(Boolean))] as string[],
    [initialIdeas]
  );
  const availableModels = React.useMemo(
    () => [...new Set(initialIdeas.map(i => i.businessModel).filter(Boolean))] as string[],
    [initialIdeas]
  );
  const activeFiltersCount = filterSectors.length + filterModels.length + (filterMinScore > 0 ? 1 : 0);

  const clearFilters = () => {
    setFilterSectors([]);
    setFilterModels([]);
    setFilterMinScore(0);
  };

  const toggleFilter = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const RANKING_MODES = [
    { id: 'composite', label: 'Oportunidad', desc: 'Score compuesto global' },
    { id: 'viable', label: 'Viabilidad', desc: 'Basado en confianza' },
    { id: 'edge', label: 'Ventaja', desc: 'Diferenciación competitiva' },
    { id: 'effort', label: 'Valor/Esfuerzo', desc: 'Retorno esperado' },
    { id: 'wild', label: 'Wildcard', desc: 'Alta volatilidad/riesgo' },
  ];

  const sortedIdeas = React.useMemo(() => {
    let list = initialIdeas.filter(i => i.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.sector?.toLowerCase().includes(q)) ||
        (i.description?.toLowerCase().includes(q))
      );
    }
    if (filterSectors.length > 0) {
      list = list.filter(i => i.sector && filterSectors.includes(i.sector));
    }
    if (filterModels.length > 0) {
      list = list.filter(i => i.businessModel && filterModels.includes(i.businessModel));
    }
    if (filterMinScore > 0) {
      list = list.filter(i => (i.compositeScore || 0) >= filterMinScore);
    }
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
  }, [initialIdeas, rankingMode, activeTab, searchQuery, filterSectors, filterModels, filterMinScore]);

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
          <input
            placeholder="Buscar ideas, sectores, hipótesis…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>✕</button>
          ) : (
            <span className="kbd">⌘K</span>
          )}
        </div>
        <div className="topbar-actions">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="btn btn-ghost btn-icon min-w-[44px] min-h-[44px]" title="Notificaciones">
                <Bell className="h-[15px] w-[15px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4 bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] shadow-lg">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3">Notificaciones</p>
              <p className="text-[13px] text-[var(--text-muted)] text-center py-4 italic">Sin notificaciones nuevas</p>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <Button
                variant="secondary"
                size="sm"
                className="h-8 gap-1.5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] relative"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="h-3 w-3" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] text-[9px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <div className="view-toggle flex bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] p-1">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={cn("p-1.5 rounded-[5px] transition-all", viewMode === 'grid' ? "bg-[var(--bg-elev)] text-[var(--text-primary)]" : "text-[var(--text-muted)]")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
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
          {searchQuery ? (
            <>
              <p className="text-[14px] text-[var(--text-secondary)]">Sin resultados para &ldquo;{searchQuery}&rdquo;.</p>
              <button onClick={() => setSearchQuery('')} className="text-[13px] text-[var(--accent-pri)] hover:underline">Limpiar búsqueda</button>
            </>
          ) : (
            <p className="text-[14px] text-[var(--text-secondary)]">No hay ideas en este estado.</p>
          )}
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

      {/* Filters drawer */}
      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="h-full w-full max-w-[340px] flex flex-col bg-[var(--bg-elev)] border-l border-[var(--border-subtle)] overflow-y-auto"
            style={{ padding: '28px 24px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-bold font-display text-[var(--text-primary)]">Filtros</h2>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-[12px] text-[var(--accent-pri)] hover:underline font-medium"
                  >
                    Limpiar ({activeFiltersCount})
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all text-[16px]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sector */}
            {availableSectors.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3">Sector</p>
                <div className="flex flex-col gap-1.5">
                  {availableSectors.map(sector => (
                    <label key={sector} className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer hover:bg-[var(--bg-card)] transition-all">
                      <span
                        className="h-4 w-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: filterSectors.includes(sector) ? 'var(--accent-pri)' : 'var(--border-subtle)',
                          background: filterSectors.includes(sector) ? 'var(--accent-pri)' : 'transparent',
                        }}
                        onClick={() => toggleFilter(filterSectors, setFilterSectors, sector)}
                      >
                        {filterSectors.includes(sector) && <span style={{ color: 'var(--accent-pri-ink)', fontSize: '10px', fontWeight: 'bold' }}>✓</span>}
                      </span>
                      <span
                        className="text-[13px] text-[var(--text-secondary)] flex-1"
                        onClick={() => toggleFilter(filterSectors, setFilterSectors, sector)}
                      >
                        {sector}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Business model */}
            {availableModels.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3">Modelo de negocio</p>
                <div className="flex flex-col gap-1.5">
                  {availableModels.map(model => (
                    <label key={model} className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer hover:bg-[var(--bg-card)] transition-all">
                      <span
                        className="h-4 w-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: filterModels.includes(model) ? 'var(--accent-pri)' : 'var(--border-subtle)',
                          background: filterModels.includes(model) ? 'var(--accent-pri)' : 'transparent',
                        }}
                        onClick={() => toggleFilter(filterModels, setFilterModels, model)}
                      >
                        {filterModels.includes(model) && <span style={{ color: 'var(--accent-pri-ink)', fontSize: '10px', fontWeight: 'bold' }}>✓</span>}
                      </span>
                      <span
                        className="text-[13px] text-[var(--text-secondary)] flex-1"
                        onClick={() => toggleFilter(filterModels, setFilterModels, model)}
                      >
                        {model}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Min score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--text-muted)]">Score mínimo</p>
                <span className="text-[12px] font-mono font-bold text-[var(--text-primary)]">
                  {filterMinScore > 0 ? `${filterMinScore}+` : 'Todos'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={9}
                step={1}
                value={filterMinScore}
                onChange={e => setFilterMinScore(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: 'var(--accent-pri)', background: `linear-gradient(to right, var(--accent-pri) ${filterMinScore * 100 / 9}%, var(--bg-card) ${filterMinScore * 100 / 9}%)` }}
              />
              <div className="flex justify-between mt-1.5">
                {[0, 3, 5, 7, 9].map(v => (
                  <span key={v} className="text-[10px] font-mono text-[var(--text-muted)]">{v}</span>
                ))}
              </div>
            </div>

            {availableSectors.length === 0 && availableModels.length === 0 && filterMinScore === 0 && (
              <p className="text-[13px] text-[var(--text-muted)] italic text-center py-8">
                Crea ideas con sector y modelo de negocio para poder filtrar.
              </p>
            )}

            <div className="mt-auto pt-4">
              <Button
                className="w-full h-10 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold"
                onClick={() => setFiltersOpen(false)}
              >
                Ver {sortedIdeas.length} resultado{sortedIdeas.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
