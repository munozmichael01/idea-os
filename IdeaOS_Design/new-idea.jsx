// IdeaOS — Nueva Idea wizard
const { useState: useS3, useEffect: useE3, useRef: useR3 } = React;

const MODES = [
  { id: 'free', title: 'Texto libre', desc: 'Escribe sin estructura', icon: 'IconBulb' },
  { id: 'struct', title: 'Estructurado', desc: 'Brief con campos', icon: 'IconList' },
  { id: 'audio', title: 'Voz', desc: 'Graba 60-90s', icon: 'IconMic' },
];

const STEPS = [
  { id: 'input', label: 'Capturar' },
  { id: 'context', label: 'Contexto' },
  { id: 'analyze', label: 'Análisis' },
];

const StepBar = ({ current }) => (
  <div className="steps">
    {STEPS.map((s, i) => {
      const state = i < current ? 'done' : i === current ? 'active' : 'idle';
      return (
        <React.Fragment key={s.id}>
          <div className={`step ${state}`}>
            <div className="num">{state === 'done' ? <IconCheck size={11} sw={3}/> : i + 1}</div>
            <span>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`}/>}
        </React.Fragment>
      );
    })}
  </div>
);

const StepInput = ({ mode, setMode, onNext, data, setData }) => (
  <div className="wizard-card">
    <h2 className="wizard-h1">¿Qué idea quieres validar?</h2>
    <p className="wizard-sub">Cuanto más contexto des, mejor el análisis. Empieza por el formato que te resulte natural.</p>

    <div className="mode-tabs">
      {MODES.map(m => {
        const I = window[m.icon];
        return (
          <button key={m.id} className={`mode-tab ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
            <span className="mode-title"><I size={14}/>{m.title}</span>
            <span className="mode-desc">{m.desc}</span>
          </button>
        );
      })}
    </div>

    {mode === 'free' && (
      <>
        <div className="field"><label className="field-label">Título</label>
          <input className="input-large" placeholder="Ej. CRM minimalista para microportfolios inmobiliarios" value={data.title} onChange={e => setData({...data, title: e.target.value})}/>
        </div>
        <div className="field" style={{marginTop: 14}}><label className="field-label">Describe tu idea</label>
          <textarea className="textarea-large" placeholder="¿Qué problema resuelves? ¿Para quién? ¿Por qué tú? Sin filtros, escribe como pensarías en voz alta." value={data.desc} onChange={e => setData({...data, desc: e.target.value})}/>
          <div className="helper"><span>Markdown soportado</span><span>{data.desc.length} / 4000</span></div>
        </div>
      </>
    )}

    {mode === 'struct' && (
      <>
        <div className="field"><label className="field-label">Título</label>
          <input className="input-large" value={data.title} onChange={e => setData({...data, title: e.target.value})}/>
        </div>
        <div className="field" style={{marginTop: 14}}><label className="field-label">Descripción</label>
          <textarea className="textarea-large" style={{minHeight: 90}} value={data.desc} onChange={e => setData({...data, desc: e.target.value})}/>
        </div>
        <div className="field-row" style={{marginTop: 14}}>
          <div className="field"><label className="field-label">Sector</label>
            <select className="field-select" style={{padding:'12px 14px', fontSize: 14}} value={data.sector} onChange={e => setData({...data, sector: e.target.value})}>
              <option>Real Estate</option><option>B2B SaaS</option><option>Marketplace</option><option>PropTech</option><option>Creator economy</option>
            </select>
          </div>
          <div className="field"><label className="field-label">Modelo de negocio</label>
            <select className="field-select" style={{padding:'12px 14px', fontSize: 14}} value={data.model} onChange={e => setData({...data, model: e.target.value})}>
              <option>Subscription</option><option>Marketplace · SaaS</option><option>Comisión</option><option>Freemium</option>
            </select>
          </div>
        </div>
        <div className="field" style={{marginTop: 14}}><label className="field-label">Mercado objetivo</label>
          <input className="input-large" placeholder="Ej. ES · LatAm" value={data.market} onChange={e => setData({...data, market: e.target.value})}/>
        </div>
        <div className="field" style={{marginTop: 14}}><label className="field-label">Notas del fundador (opcional)</label>
          <textarea className="textarea-large" style={{minHeight: 80}} placeholder="Ventajas únicas, red, contexto que un agente no podría inferir." value={data.notes} onChange={e => setData({...data, notes: e.target.value})}/>
        </div>
      </>
    )}

    {mode === 'audio' && <AudioMode/>}

    <div className="wizard-actions">
      <button className="btn btn-ghost"><a href="Dashboard.html" style={{color:'inherit'}}>Cancelar</a></button>
      <div style={{display:'flex', gap: 8}}>
        <button className="btn btn-secondary">Guardar borrador</button>
        <button className="btn btn-primary" onClick={onNext}>Continuar <IconChevron size={12} sw={2.4}/></button>
      </div>
    </div>
  </div>
);

const AudioMode = () => {
  const [recording, setRecording] = useS3(false);
  const [text, setText] = useS3('');
  const target = 'Estoy pensando en una herramienta para inmobiliarias medianas que use señales públicas — datos de SEPE, INE, anuncios cancelados — para predecir qué propietarios van a vender en los próximos 60 días.';
  useE3(() => {
    if (!recording) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setText(target.slice(0, i));
      if (i >= target.length) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, [recording]);

  return (
    <div className="audio-zone">
      <button className={`mic-button ${recording ? 'recording' : ''}`} onClick={() => { setRecording(!recording); if (recording) setText(''); }}>
        <IconMic size={36} sw={1.8}/>
      </button>
      {recording ? (
        <>
          <div className="audio-meter">{Array.from({length: 24}).map((_, i) => <span key={i} style={{ animationDelay: `${i*0.07}s`, height: `${20 + Math.sin(i)*40 + 30}%` }}/>)}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>● Grabando · 00:34</div>
        </>
      ) : (
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 360 }}>Pulsa para grabar. Ideal: 60-90 segundos describiendo problema, audiencia y por qué tú.</p>
      )}
      <div className="transcript">
        {text || <span style={{color:'var(--text-muted)'}}>El transcript aparece en tiempo real…</span>}
        {recording && text.length < target.length && <span className="typing-dot"/>}
      </div>
    </div>
  );
};

const StepContext = ({ onBack, onNext }) => {
  const questions = [
    { agent: 'market', q: '¿Cuántas inmobiliarias has hablado ya y qué te dijeron sobre el problema?' },
    { agent: 'comp', q: '¿Qué herramienta usan hoy para captar y por qué les frustra?' },
    { agent: 'econ', q: '¿Cuál es el ARPU mínimo que harías rentable este negocio en año 1?' },
    { agent: 'gtm', q: '¿Tienes acceso a algún canal o evento donde estén tus primeros 10 clientes?' },
    { agent: 'fit', q: '¿Por qué tú y no otra persona — qué ventaja única tienes?' },
  ];
  return (
    <div className="wizard-card">
      <h2 className="wizard-h1">Antes de analizar tu idea…</h2>
      <p className="wizard-sub">5 preguntas del agente de contexto. Las respuestas son opcionales pero suben la calidad del análisis ~40%.</p>

      <div className="context-banner">
        <div className="context-banner-icon"><IconSparkles size={16}/></div>
        <p>Las respuestas mejoran la calidad del análisis. <small>Generadas por el agente de contexto · 8 segundos</small></p>
      </div>

      {questions.map((item, i) => {
        const ag = AGENTS.find(a => a.id === item.agent);
        return (
          <div key={i} className="question" style={{ '--accent': ag.color }}>
            <div className="q-head">
              <span className="q-num">{i + 1}</span>
              <span className="q-text">{item.q}</span>
              <span className="q-agent">{ag.short}</span>
            </div>
            <input className="input-large" style={{padding: '10px 12px', fontSize: 13}} placeholder="Tu respuesta (opcional)…"/>
          </div>
        );
      })}

      <div className="wizard-actions">
        <button className="btn btn-ghost" onClick={onBack}><IconChevron size={12} style={{transform:'rotate(180deg)'}}/> Atrás</button>
        <div style={{display:'flex', gap: 8}}>
          <button className="btn btn-secondary" onClick={onNext}>Saltar y analizar</button>
          <button className="btn btn-primary" onClick={onNext}><IconSparkles size={13}/> Responder y analizar</button>
        </div>
      </div>
    </div>
  );
};

const StepAnalyze = ({ onBack, onView }) => {
  const [tick, setTick] = useS3(0);
  useE3(() => { const t = setInterval(() => setTick(x => x + 1), 350); return () => clearInterval(t); }, []);

  // Build per-agent state
  const tiles = AGENTS.map((agent, i) => {
    const start = i * 1.2;
    const dur = 4 + (i % 3);
    const t = tick / 6;
    let progress, status, score = null;
    if (t < start) { progress = 0; status = 'idle'; }
    else if (t > start + dur) { progress = 1; status = 'done'; score = 6.8 + (i*0.4) % 2.6; }
    else { progress = (t - start) / dur; status = 'running'; }
    return { agent, progress, status, score };
  });

  const allDone = tiles.every(t => t.status === 'done');

  return (
    <div className="wizard-card">
      <h2 className="wizard-h1">Analizando tu idea…</h2>
      <p className="wizard-sub">Los 5 agentes corren en paralelo. Tarda 60–90 segundos. Puedes cerrar esta pestaña, te avisaremos cuando terminen.</p>

      <div className="analysis-grid">
        {tiles.map(({ agent, progress, status, score }) => (
          <div key={agent.id} className={`analysis-tile ${status}`} style={{ '--accent': agent.color }}>
            <div className="accent-bar"/>
            {status === 'running' && <div className="top-bar"/>}
            <div className="analysis-tile-head">
              <span className="analysis-name">{agent.name}</span>
              <span className={`status ${status}`}>
                {status === 'done' ? <><IconCheck size={10} sw={3}/> Listo</> : status === 'running' ? '● Analizando' : 'En cola'}
              </span>
            </div>
            <div className="progress-line"><div className="fill" style={{ width: `${progress*100}%` }}/></div>
            <div className="meta">
              <span>{agent.short}</span>
              <span className="score-num">{score != null ? score.toFixed(1) : '—'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="analysis-summary">
        <ScoreRing value={allDone ? 8.4 : Math.min(8.4, tiles.filter(t => t.score).reduce((s,t)=>s+t.score,0) / Math.max(1, tiles.filter(t => t.score).length))} size={56} stroke={4}/>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
            {allDone ? 'Análisis completo' : `${tiles.filter(t => t.status === 'done').length} de ${tiles.length} agentes listos`}
          </div>
          <div className="analysis-eta">
            {allDone ? 'Score compuesto · ' + 'Inmogrowth' : `ETA ~${Math.max(0, 90 - tick*4)}s · ejecución en paralelo`}
          </div>
        </div>
        {allDone ? (
          <button className="btn btn-primary" onClick={onView}>Ver resultados <IconChevron size={12} sw={2.4}/></button>
        ) : (
          <button className="btn btn-secondary" disabled style={{opacity: 0.5}}>Esperando…</button>
        )}
      </div>

      <div className="wizard-actions">
        <button className="btn btn-ghost" onClick={onBack}><IconChevron size={12} style={{transform:'rotate(180deg)'}}/> Atrás</button>
        <button className="btn btn-secondary">Cancelar análisis</button>
      </div>
    </div>
  );
};

const NewIdea = () => {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "step": 0,
    "mode": "free",
    "lang": "es",
    "collapsed": false,
    "theme": "dark"
  }/*EDITMODE-END*/);

  useE3(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  const [data, setData] = useS3({
    title: 'Inmogrowth',
    desc: 'Plataforma de captación predictiva para inmobiliarias medianas que conecta señales públicas de intención con agentes locales en tiempo real.',
    sector: 'Real Estate',
    model: 'Marketplace · SaaS',
    market: 'ES · LatAm',
    notes: '',
  });

  return (
    <div className={`app ${tweaks.collapsed ? 'collapsed' : ''}`}>
      <Sidebar
        collapsed={tweaks.collapsed}
        onToggle={() => setTweak('collapsed', !tweaks.collapsed)}
        lang={tweaks.lang}
        onLang={(l) => setTweak('lang', l)}
        theme={tweaks.theme}
        onTheme={(t) => setTweak('theme', t)}
        active="new"
        counts={{ ideas: 6 }}
      />

      <main className="main">
        <div className="topbar">
          <div className="search">
            <IconSearch size={14} stroke="var(--text-muted)"/>
            <input placeholder="Buscar ideas, sectores, hipótesis…"/>
            <span className="kbd">⌘K</span>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-icon"><IconBell size={15}/></button>
          </div>
        </div>

        <div className="crumbs">
          <a href="Dashboard.html">Panel</a>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-primary)' }}>Nueva idea</span>
        </div>

        <div className="wizard">
          <StepBar current={tweaks.step}/>
          {tweaks.step === 0 && <StepInput mode={tweaks.mode} setMode={(m) => setTweak('mode', m)} data={data} setData={setData} onNext={() => setTweak('step', 1)}/>}
          {tweaks.step === 1 && <StepContext onBack={() => setTweak('step', 0)} onNext={() => setTweak('step', 2)}/>}
          {tweaks.step === 2 && <StepAnalyze onBack={() => setTweak('step', 1)} onView={() => location.href = 'Idea Detail.html'}/>}
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apariencia">
          <TweakRadio label="Tema" value={tweaks.theme} options={['dark','light']} onChange={(v) => setTweak('theme', v)}/>
        </TweakSection>
        <TweakSection title="Paso del wizard">
          <TweakRadio value={String(tweaks.step)} options={['0','1','2']} onChange={(v) => setTweak('step', parseInt(v))}/>
        </TweakSection>
        <TweakSection title="Modo de entrada">
          <TweakRadio value={tweaks.mode} options={['free','struct','audio']} onChange={(v) => setTweak('mode', v)}/>
        </TweakSection>
        <TweakSection title="Sidebar">
          <TweakToggle label="Colapsada" value={tweaks.collapsed} onChange={(v) => setTweak('collapsed', v)}/>
          <TweakRadio label="Idioma" value={tweaks.lang} options={['es','en']} onChange={(v) => setTweak('lang', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

const newRoot = ReactDOM.createRoot(document.getElementById('root'));
newRoot.render(<NewIdea/>);
