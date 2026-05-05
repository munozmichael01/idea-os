// IdeaOS — Idea Detail page
const { useState: useState2, useEffect: useEffect2 } = React;

const STATE_OPTIONS_DETAIL = ['Análisis completo', 'Análisis parcial', 'Cargando'];

const HypothesisCard = ({ h }) => {
  const agent = AGENTS.find(a => a.id === h.agent);
  const statusClass = h.status === 'Confirmada' ? 'confirmed' : h.status === 'Invalidada' ? 'invalidated' : 'pending';
  return (
    <div className="hyp" style={{ '--accent': agent.color }}>
      <span className="agent-stamp">{agent.short}</span>
      <p>{h.text}</p>
      <span className={`hyp-status ${statusClass}`}>
        {h.status === 'Confirmada' && <IconCheck size={9} sw={3}/>}
        {h.status}
      </span>
    </div>
  );
};

const HypothesesGroup = ({ criticality, color, items }) => (
  <div className="hyp-group">
    <div className="hyp-group-head">
      <span className="crit-dot" style={{ background: color }}/>
      <span>Criticidad {criticality.toLowerCase()}</span>
      <span className="crit-count">{items.length}</span>
    </div>
    {items.map(h => <HypothesisCard key={h.id} h={h}/>)}
  </div>
);

const Field = ({ label, type = 'input', value, options, affects = [], rows }) => {
  const [v, setV] = useState2(value);
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {type === 'textarea' ? (
        <textarea className="field-textarea" value={v} onChange={e => setV(e.target.value)} rows={rows || 3}/>
      ) : type === 'select' ? (
        <select className="field-select" value={v} onChange={e => setV(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className="field-input" value={v} onChange={e => setV(e.target.value)}/>
      )}
      {affects.length > 0 && (
        <div className="field-affects">
          <IconSparkles size={9}/> Actualiza: {affects.join(', ')}
        </div>
      )}
    </div>
  );
};

const IdeaDetail = () => {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "state": "Análisis completo",
    "lang": "es",
    "collapsed": false,
    "theme": "dark"
  }/*EDITMODE-END*/);

  useEffect2(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  // Build analyses based on state
  let analyses = { ...INMOGROWTH_ANALYSES };
  if (tweaks.state === 'Análisis parcial') {
    analyses = {
      context: INMOGROWTH_ANALYSES.context,
      market: INMOGROWTH_ANALYSES.market,
      comp: { status: 'loading' },
      econ: INMOGROWTH_ANALYSES.econ,
      gtm: { status: 'idle' },
      fit: { status: 'idle' },
    };
  } else if (tweaks.state === 'Cargando') {
    analyses = Object.fromEntries(AGENTS.map(a => [a.id, { status: 'loading' }]));
  }

  const compositeScore = 8.4;
  const confidence = 0.82;
  const volatility = 0.34;

  const hypsByCrit = {
    Alta: HYPOTHESES.filter(h => h.criticality === 'Alta'),
    Media: HYPOTHESES.filter(h => h.criticality === 'Media'),
    Baja: HYPOTHESES.filter(h => h.criticality === 'Baja'),
  };

  return (
    <div className={`app ${tweaks.collapsed ? 'collapsed' : ''}`}>
      <Sidebar
        collapsed={tweaks.collapsed}
        onToggle={() => setTweak('collapsed', !tweaks.collapsed)}
        lang={tweaks.lang}
        onLang={(l) => setTweak('lang', l)}
        theme={tweaks.theme}
        onTheme={(t) => setTweak('theme', t)}
        active="ideas"
        counts={{ ideas: 6 }}
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
            <button className="btn btn-ghost btn-icon"><IconBell size={15}/></button>
            <button className="btn btn-secondary"><IconSparkles size={13}/> Analizar todo</button>
            <button className="btn btn-primary"><IconPlus size={14} sw={2.4}/> Nueva idea</button>
          </div>
        </div>

        <div className="crumbs">
          <a href="Dashboard.html">Panel</a>
          <span className="sep">/</span>
          <a href="#">Ideas</a>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-primary)' }}>Inmogrowth</span>
        </div>

        {/* Header */}
        <div className="detail-header">
          <div>
            <div className="detail-title-row">
              <h1 className="detail-title editable">Inmogrowth</h1>
              <span className="priority-badge" style={{ background: scoreBg(compositeScore, 14), color: scoreColor(compositeScore) }}>
                <span className="pulse"/>
                {scoreLabel(compositeScore)}
              </span>
            </div>

            <div className="detail-tags">
              <span className="tag"><span className="tag-dot" style={{ background: 'var(--purple)' }}/>Real Estate</span>
              <span className="tag"><span className="tag-dot" style={{ background: 'var(--blue)' }}/>Marketplace · SaaS</span>
              <span className="tag"><span className="tag-dot" style={{ background: 'var(--green)' }}/>ES · LatAm</span>
              <span className="tag">v3 · 5/5 agentes</span>
            </div>

            <div className="detail-meta">
              <span className="detail-meta-item">📅 Creado 04 / 05 / 2026</span>
              <span className="detail-meta-item">🔄 Re-analizado hace 2 minutos</span>
              <span className="detail-meta-item">👤 jordi@ideaos.app</span>
            </div>

            <div className="detail-actions">
              <button className="btn btn-primary"><IconSparkles size={13}/> Analizar todo</button>
              <button className="btn btn-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                Escuchar resumen
              </button>
              <button className="btn btn-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Exportar PDF
              </button>
              <button className="btn btn-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Exportar DOCX
              </button>
            </div>
          </div>

          {/* Score panel */}
          <div className="score-panel">
            <ScoreRing value={compositeScore} size={92} stroke={6}/>
            <div className="score-panel-meta">
              <div className="score-meta-label">Score compuesto</div>
              <div className="kpi-row">
                <div className="kpi-head">
                  <span className="name">Confianza</span>
                  <span className="val">{(confidence*100).toFixed(0)}%</span>
                </div>
                <div className="bar"><div className="bar-fill" style={{ width: `${confidence*100}%`, background: 'var(--green)' }}/></div>
              </div>
              <div className="kpi-row">
                <div className="kpi-head">
                  <span className="name">Volatilidad</span>
                  <span className="val">{(volatility*100).toFixed(0)}%</span>
                </div>
                <div className="bar"><div className="bar-fill" style={{ width: `${volatility*100}%`, background: 'var(--orange)' }}/></div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="detail-grid">
          <div>
            <h2 className="section-title-lg">
              Análisis por agente
              <span className="sub">{Object.values(analyses).filter(a => a?.status === 'done').length} / {AGENTS.length} completos</span>
            </h2>
            <div className="agents-grid">
              {AGENTS.map(agent => (
                <AgentCard key={agent.id} agent={agent} analysis={analyses[agent.id]}/>
              ))}
            </div>

            <h2 className="section-title-lg">
              Hipótesis
              <span className="sub">{HYPOTHESES.length} totales · {HYPOTHESES.filter(h => h.status === 'No validada').length} pendientes</span>
            </h2>
            <HypothesesGroup criticality="Alta" color="var(--red)" items={hypsByCrit.Alta}/>
            <HypothesesGroup criticality="Media" color="var(--yellow)" items={hypsByCrit.Media}/>
            <HypothesesGroup criticality="Baja" color="var(--text-muted)" items={hypsByCrit.Baja}/>
          </div>

          {/* Side panel */}
          <aside className="side-panel">
            <div className="side-card">
              <h3>Brief editable <span className="pill">auto-save</span></h3>
              <Field label="Descripción" type="textarea" rows={4}
                value="Plataforma de captación predictiva para inmobiliarias medianas que conecta señales de intención con agentes locales en tiempo real."
                affects={['MKT', 'GTM']}/>
              <Field label="Sector" type="select" value="Real Estate"
                options={['Real Estate', 'PropTech', 'B2B SaaS', 'Marketplace']}
                affects={['MKT', 'COMP']}/>
              <Field label="Mercado objetivo" type="input" value="ES · LatAm"
                affects={['MKT']}/>
              <Field label="Modelo de negocio" type="select" value="Marketplace · SaaS"
                options={['Marketplace · SaaS', 'Subscription', 'Comisión', 'Freemium']}
                affects={['ECON']}/>
              <Field label="Notas del fundador" type="textarea" rows={3}
                value="Red activa con 30+ CEOs de inmobiliarias top-50. Acceso preferente a SIMA mayo 2026."
                affects={['FIT']}/>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                <IconSparkles size={13}/> Guardar y re-analizar
              </button>
            </div>

            <div className="side-card">
              <h3>Próximas acciones <span className="pill">5</span></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {AGENTS.filter(a => analyses[a.id]?.nextAction).slice(0, 4).map(agent => {
                  const a = analyses[agent.id];
                  return (
                    <div key={agent.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: agent.color, marginTop: 7, flexShrink: 0 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: agent.color, marginBottom: 3 }}>{agent.short}</div>
                        <div style={{ fontSize: 12, lineHeight: 1.45, color: 'var(--text-primary)' }}>{a.nextAction}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="side-card">
              <h3>Score por agente</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {AGENTS.filter(a => analyses[a.id]?.score != null).map(agent => {
                  const a = analyses[agent.id];
                  return (
                    <div key={agent.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{agent.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>{a.score.toFixed(1)}</span>
                      </div>
                      <div className="bar"><div className="bar-fill" style={{ width: `${a.score*10}%`, background: agent.color }}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apariencia">
          <TweakRadio label="Tema" value={tweaks.theme} options={['dark','light']} onChange={(v) => setTweak('theme', v)}/>
        </TweakSection>
        <TweakSection title="Estado del análisis">
          <TweakRadio value={tweaks.state} options={STATE_OPTIONS_DETAIL} onChange={(v) => setTweak('state', v)}/>
        </TweakSection>
        <TweakSection title="Sidebar">
          <TweakToggle label="Colapsada" value={tweaks.collapsed} onChange={(v) => setTweak('collapsed', v)}/>
          <TweakRadio label="Idioma" value={tweaks.lang} options={['es','en']} onChange={(v) => setTweak('lang', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

const detailRoot = ReactDOM.createRoot(document.getElementById('root'));
detailRoot.render(<IdeaDetail/>);
