// IdeaOS — Dashboard page
const { useState, useMemo } = React;

const STATE_OPTIONS = ['Con datos', 'Vacío', 'Cargando'];

const StatCard = ({ label, value, unit, trend, icon }) => {
  const TrendIcon = trend?.dir === 'up' ? IconArrowUp : IconArrowDown;
  return (
    <div className="stat">
      <div className="stat-label">{icon}<span>{label}</span></div>
      <div className="stat-value">{value}{unit && <span className="unit">{unit}</span>}</div>
      {trend && (
        <div className={`stat-trend ${trend.dir}`}>
          <TrendIcon size={12} sw={2}/>
          <span>{trend.value}</span>
          <span style={{ color: 'var(--text-muted)' }}>· {trend.note}</span>
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="empty">
    <div className="empty-icon"><IconBulb size={28}/></div>
    <h3>Aún no tienes ideas</h3>
    <p>Captura una idea en texto, voz o formato estructurado. Nuestros agentes la analizarán en menos de 90 segundos y verás un ranking en cuanto terminen.</p>
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <button className="btn btn-primary"><IconPlus size={14} sw={2.4}/> Crear primera idea</button>
      <button className="btn btn-secondary"><IconMic size={14}/> Grabar idea</button>
    </div>
  </div>
);

const RankingSelector = ({ value, onChange }) => (
  <div className="segmented" role="tablist">
    {RANKING_MODES.map(m => {
      const I = window[m.icon];
      return (
        <button key={m.id} className={value === m.id ? 'active' : ''} onClick={() => onChange(m.id)} title={m.desc}>
          <I size={13}/>
          <span>{m.label}</span>
        </button>
      );
    })}
  </div>
);

const Dashboard = () => {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "state": "Con datos",
    "ranking": "composite",
    "view": "grid",
    "lang": "es",
    "collapsed": false,
    "density": "comfortable",
    "theme": "dark"
  }/*EDITMODE-END*/);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  const ideas = useMemo(() => {
    let list = [...MOCK_IDEAS];
    if (tweaks.ranking === 'viable') list.sort((a,b) => b.confidence - a.confidence);
    else if (tweaks.ranking === 'edge') list.sort((a,b) => b.score - a.score);
    else if (tweaks.ranking === 'effort') list.sort((a,b) => (b.score - b.volatility*5) - (a.score - a.volatility*5));
    else if (tweaks.ranking === 'wild') list.sort((a,b) => b.volatility - a.volatility);
    else list.sort((a,b) => b.score - a.score);
    return list;
  }, [tweaks.ranking]);

  const isEmpty = tweaks.state === 'Vacío';
  const isLoading = tweaks.state === 'Cargando';

  return (
    <div className={`app ${tweaks.collapsed ? 'collapsed' : ''}`}>
      <Sidebar
        collapsed={tweaks.collapsed}
        onToggle={() => setTweak('collapsed', !tweaks.collapsed)}
        lang={tweaks.lang}
        onLang={(l) => setTweak('lang', l)}
        theme={tweaks.theme}
        onTheme={(t) => setTweak('theme', t)}
        active="dashboard"
        counts={{ ideas: isEmpty ? 0 : MOCK_IDEAS.length }}
      />

      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="search">
            <IconSearch size={14} stroke="var(--text-muted)"/>
            <input placeholder="Buscar ideas, sectores, hipótesis…"/>
            <span className="kbd">⌘K</span>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-icon" title="Notificaciones"><IconBell size={15}/></button>
            <button className="btn btn-secondary"><IconSparkles size={13}/> Analizar todo</button>
            <button className="btn btn-primary"><IconPlus size={14} sw={2.4}/> Nueva idea</button>
          </div>
        </div>

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Panel de control</h1>
            <p className="page-subtitle">
              {isEmpty
                ? 'Empieza capturando tu primera idea.'
                : `${MOCK_IDEAS.length} ideas en seguimiento · 1 en análisis activo · última actualización hace 2 minutos.`}
            </p>
          </div>
        </div>

        {/* Stats */}
        {!isEmpty && (
          <div className="stats">
            <StatCard
              label="Ideas activas"
              value={MOCK_IDEAS.length}
              icon={<IconBulb size={11}/>}
              trend={{ dir: 'up', value: '+2', note: 'esta semana' }}
            />
            <StatCard
              label="Score medio"
              value={(MOCK_IDEAS.reduce((s,i) => s+i.score,0)/MOCK_IDEAS.length).toFixed(1)}
              unit="/10"
              icon={<IconTrending size={11}/>}
              trend={{ dir: 'up', value: '+0.4', note: 'vs. mes anterior' }}
            />
            <StatCard
              label="Alta prioridad"
              value={MOCK_IDEAS.filter(i => i.score >= 7.5).length}
              icon={<IconRocket size={11}/>}
              trend={{ dir: 'up', value: '+1', note: 'desde el lunes' }}
            />
            <StatCard
              label="Análisis pendientes"
              value={MOCK_IDEAS.filter(i => i.agentsDone < 5).length}
              icon={<IconClock size={11}/>}
              trend={{ dir: 'down', value: '-3', note: 'completados hoy' }}
            />
          </div>
        )}

        {/* Ranking bar */}
        {!isEmpty && (
          <>
            <div className="section-head" style={{ marginTop: 0 }}>
              <h2>Ranking de ideas <span className="count">{ideas.length}</span></h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary"><IconFilter size={12}/> Filtros</button>
                <div className="view-toggle">
                  <button className={tweaks.view === 'grid' ? 'active' : ''} onClick={() => setTweak('view','grid')}><IconGrid size={13}/></button>
                  <button className={tweaks.view === 'list' ? 'active' : ''} onClick={() => setTweak('view','list')}><IconList size={13}/></button>
                </div>
              </div>
            </div>

            <div className="ranking-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="ranking-label">Modo</span>
                <RankingSelector value={tweaks.ranking} onChange={(v) => setTweak('ranking', v)}/>
              </div>
            </div>
          </>
        )}

        {/* Content */}
        {isEmpty ? (
          <EmptyState/>
        ) : isLoading ? (
          <div className="ideas-grid">
            {Array.from({ length: 6 }).map((_, i) => <IdeaCardSkeleton key={i}/>)}
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map((idea, i) => (
              <IdeaCard key={idea.id} idea={idea} delay={i * 60}/>
            ))}
          </div>
        )}

        {/* Activity */}
        {!isEmpty && !isLoading && (
          <>
            <div className="section-head"><h2>Actividad reciente <span className="count">live</span></h2></div>
            <div className="activity">
              {[
                { color: 'var(--green)', text: <><strong>Inmogrowth</strong> completó análisis de viabilidad — score subió a <strong>8.4</strong></>, time: 'hace 2m' },
                { color: 'var(--purple)', text: <>Agente <strong>Go-to-market</strong> generó nueva hipótesis para <strong>FoodLoop</strong></>, time: 'hace 14m' },
                { color: 'var(--blue)', text: <><strong>Cold-DM Loop</strong> · Founder Fit reanalizado tras editar el contexto</>, time: 'hace 1h' },
                { color: 'var(--orange)', text: <><strong>Tabwise</strong> · 2 hipótesis críticas sin validar (esperan input)</>, time: 'hace 3h' },
              ].map((row, i) => (
                <div key={i} className="activity-row">
                  <span className="activity-icon" style={{ background: row.color }}/>
                  <span className="activity-text">{row.text}</span>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}>Ver</button>
                  <span className="activity-time">{row.time}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Estado de la pantalla">
          <TweakRadio value={tweaks.state} options={STATE_OPTIONS} onChange={(v) => setTweak('state', v)}/>
        </TweakSection>
        <TweakSection title="Apariencia">
          <TweakRadio label="Tema" value={tweaks.theme} options={['dark','light']} onChange={(v) => setTweak('theme', v)}/>
        </TweakSection>
        <TweakSection title="Sidebar">
          <TweakToggle label="Colapsada" value={tweaks.collapsed} onChange={(v) => setTweak('collapsed', v)}/>
          <TweakRadio label="Idioma" value={tweaks.lang} options={['es','en']} onChange={(v) => setTweak('lang', v)}/>
        </TweakSection>
        <TweakSection title="Modo de ranking">
          <TweakSelect
            value={tweaks.ranking}
            options={RANKING_MODES.map(m => ({ value: m.id, label: m.label }))}
            onChange={(v) => setTweak('ranking', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Dashboard/>);
