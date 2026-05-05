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

// Thinking lines pool — agent-flavored "in flight" thoughts
const THOUGHTS = {
  context:  ['Encuadrando brief', 'Inmogrowth · Real Estate · ES', 'Detectando ICP latente', 'Resumiendo señales del input'],
  market:  ['Calculando TAM/SAM en SoEU', 'Cruzando INE × SEPE × Idealista', 'Tasa de captación residencial 2024-26', 'Demanda real vs declarada'],
  comp:    ['Mapeando players UE/US', 'Compass · Witei · Sooprema', 'Riesgo plataformización Idealista', 'Buscando moats defendibles'],
  econ:    ['Modelando ARPU €490/mes', 'CAC payback ~6 meses', 'Curva de churn vertical SaaS', 'Sensibilidad a precio'],
  gtm:     ['Mapa de canales · SIMA mayo', 'Wedge: valoración predictiva', 'Outbound · LinkedIn × eventos', 'Loop viral por API'],
  fit:     ['Cruce founder × tesis', '7 años en proptech', 'Red activa SIMA + top-50', 'Gap: CTO ML senior'],
};

// Position for each agent on the orbital ring. 6 agents, evenly spaced (60° apart)
const AGENT_POSITIONS = [
  { angle: -90 }, // top
  { angle: -30 },
  { angle:  30 },
  { angle:  90 }, // bottom
  { angle: 150 },
  { angle: 210 },
];

const polar = (cx, cy, r, angleDeg) => {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

const StepAnalyze = ({ onBack, onView }) => {
  const [tick, setTick] = useS3(0);
  const [logLines, setLogLines] = useS3([]);
  const [celebrate, setCelebrate] = useS3(false);

  useE3(() => {
    const t = setInterval(() => setTick(x => x + 1), 280);
    return () => clearInterval(t);
  }, []);

  // Per-agent state
  const tiles = AGENTS.map((agent, i) => {
    const start = i * 0.6;
    const dur = 5 + (i % 3) * 0.8;
    const t = tick / 5;
    let progress, status, score = null;
    if (t < start)              { progress = 0; status = 'idle'; }
    else if (t > start + dur)   { progress = 1; status = 'done'; score = 6.8 + (i*0.4) % 2.6; }
    else                        { progress = (t - start) / dur; status = 'running'; }
    return { agent, progress, status, score };
  });

  const doneCount = tiles.filter(t => t.status === 'done').length;
  const allDone = doneCount === tiles.length;

  // Trigger one-shot celebrate when all done
  useE3(() => {
    if (allDone && !celebrate) {
      const id = setTimeout(() => setCelebrate(true), 250);
      return () => clearTimeout(id);
    }
  }, [allDone, celebrate]);

  // Append a log line every couple ticks from a running agent
  useE3(() => {
    if (allDone) return;
    if (tick % 2 !== 0) return;
    const running = tiles.filter(t => t.status === 'running');
    if (!running.length) return;
    const pick = running[Math.floor(Math.random() * running.length)];
    const pool = THOUGHTS[pick.agent.id] || [];
    const msg = pool[Math.floor(Math.random() * pool.length)];
    setLogLines(prev => [...prev.slice(-7), { id: tick, agent: pick.agent, msg, ts: tick }]);
  }, [tick]);

  // Geometry
  const W = 560, H = 360;
  const cx = W / 2, cy = H / 2;
  const orbitR = 138;
  const coreR = 28;

  // Active running agents drive cross-talk lines
  const runningIdx = tiles.map((t, i) => t.status === 'running' ? i : -1).filter(i => i >= 0);

  return (
    <div className="wizard-card analyze-card">
      <h2 className="wizard-h1">{allDone ? 'Análisis completo' : 'Analizando tu idea…'}</h2>
      <p className="wizard-sub">
        {allDone
          ? 'Los 6 agentes han llegado a un veredicto. Score compuesto listo.'
          : 'Los 6 agentes corren en paralelo y comparten señales. Puedes cerrar esta pestaña, te avisaremos al terminar.'}
      </p>

      {/* === Cinematic stage === */}
      <div className={`analyze-stage ${celebrate ? 'celebrate' : ''}`}>
        <div className="analyze-bg-grid" aria-hidden="true"/>

        <svg className="analyze-svg" viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="var(--green)" stopOpacity="0.95"/>
              <stop offset="60%" stopColor="var(--green)" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="var(--green)" stopOpacity="0"/>
            </radialGradient>
            <filter id="agentGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Outer orbit ring */}
          <circle cx={cx} cy={cy} r={orbitR} className="orbit-ring"/>
          <circle cx={cx} cy={cy} r={orbitR + 18} className="orbit-ring outer" />

          {/* Pulsing rings from the core (only while running) */}
          {!allDone && [0,1,2].map(i => (
            <circle
              key={`pulse-${i}`}
              cx={cx} cy={cy} r={coreR}
              className="pulse-ring"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}

          {/* Connection lines: core → agent */}
          {tiles.map(({ agent, status, progress }, i) => {
            const [x, y] = polar(cx, cy, orbitR, AGENT_POSITIONS[i].angle);
            return (
              <g key={`line-${agent.id}`}>
                <line
                  x1={cx} y1={cy} x2={x} y2={y}
                  className={`agent-line ${status}`}
                  style={{ stroke: agent.color, '--accent': agent.color }}
                />
                {status === 'running' && (
                  <circle r="3" className="line-pulse" style={{ fill: agent.color, offsetPath: `path('M${cx},${cy} L${x},${y}')`, animationDelay: `${i*0.25}s` }}/>
                )}
              </g>
            );
          })}

          {/* Cross-talk between currently-running agents */}
          {runningIdx.length > 1 && runningIdx.slice(0, -1).map((i, k) => {
            const j = runningIdx[k+1];
            const [x1, y1] = polar(cx, cy, orbitR, AGENT_POSITIONS[i].angle);
            const [x2, y2] = polar(cx, cy, orbitR, AGENT_POSITIONS[j].angle);
            return (
              <line key={`xt-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} className="cross-talk"/>
            );
          })}

          {/* Agent nodes */}
          {tiles.map(({ agent, status, progress, score }, i) => {
            const [x, y] = polar(cx, cy, orbitR, AGENT_POSITIONS[i].angle);
            const r = 22;
            // progress arc
            const C = 2 * Math.PI * (r + 6);
            const dash = C * progress;
            return (
              <g key={`node-${agent.id}`} transform={`translate(${x} ${y})`} className={`agent-node ${status}`}>
                {/* Halo glow */}
                <circle r={r + 14} className="node-halo" style={{ fill: agent.color }}/>
                {/* Progress arc */}
                <circle r={r + 6} className="node-arc-track"/>
                <circle
                  r={r + 6}
                  className="node-arc-fill"
                  style={{ stroke: agent.color, strokeDasharray: `${dash} ${C}`, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
                {/* Node body */}
                <circle r={r} className="node-body" style={{ '--accent': agent.color }}/>
                {/* Inner ring */}
                <circle r={r - 5} className="node-inner" style={{ stroke: agent.color }}/>
                {/* Short code */}
                <text className="node-code" textAnchor="middle" dy="4">{agent.short}</text>

                {/* Done check */}
                {status === 'done' && (
                  <g className="node-check">
                    <circle r={11} cx={r-4} cy={-r+4} fill="var(--green)"/>
                    <path d={`M${r-9},${-r+4} l3,3 l6,-6`} stroke="var(--bg-base)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </g>
                )}
              </g>
            );
          })}

          {/* Agent labels (outside the ring, anchored by angle quadrant) */}
          {tiles.map(({ agent, status, score }, i) => {
            const a = AGENT_POSITIONS[i].angle;
            const [lx, ly] = polar(cx, cy, orbitR + 44, a);
            const anchor = Math.cos((a*Math.PI)/180) > 0.2 ? 'start' : Math.cos((a*Math.PI)/180) < -0.2 ? 'end' : 'middle';
            return (
              <g key={`lbl-${agent.id}`} className={`agent-label ${status}`}>
                <text x={lx} y={ly - 4} className="lbl-name" textAnchor={anchor}>{agent.name}</text>
                <text x={lx} y={ly + 10} className="lbl-meta" textAnchor={anchor} style={{ fill: agent.color }}>
                  {status === 'done' ? `${score.toFixed(1)} / 10` : status === 'running' ? 'analizando' : 'en cola'}
                </text>
              </g>
            );
          })}

          {/* Core */}
          <g transform={`translate(${cx} ${cy})`} className={`analyze-core ${allDone ? 'done' : ''}`}>
            <circle r={coreR + 22} fill="url(#coreGrad)" className="core-glow"/>
            <circle r={coreR} className="core-disc"/>
            <circle r={coreR - 6} className="core-disc-inner"/>
            {allDone ? (
              <path d="M-9,0 l6,6 l12,-12" stroke="var(--bg-base)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" className="core-check"/>
            ) : (
              <text className="core-pct" textAnchor="middle" dy="5">{Math.round((doneCount / tiles.length) * 100)}<tspan className="core-pct-unit">%</tspan></text>
            )}
          </g>

          {/* Confetti sparks on celebrate */}
          {celebrate && [...Array(14)].map((_, i) => {
            const ang = (i * 360) / 14;
            const [x, y] = polar(cx, cy, orbitR + 60, ang);
            return <circle key={`spark-${i}`} cx={cx} cy={cy} r={2} className="spark" style={{ '--tx': `${x-cx}px`, '--ty': `${y-cy}px`, animationDelay: `${i*0.04}s` }}/>;
          })}
        </svg>

        {/* HUD: percentage + ETA */}
        <div className="analyze-hud">
          <div className="hud-pill">
            <span className={`dot ${allDone ? 'done' : 'live'}`}/>
            <span>{allDone ? 'COMPLETO' : 'EN CURSO'}</span>
          </div>
          <div className="hud-pill mono">
            {allDone ? `6 / 6 listos` : `${doneCount} / 6 listos · ETA ~${Math.max(0, 90 - tick*3)}s`}
          </div>
        </div>
      </div>

      {/* === Live thinking log (only while running) === */}
      {!allDone && (
        <div className="analyze-log">
          <div className="log-head">
            <span className="log-dot"/>
            <span>Pensando en paralelo</span>
            <span className="log-spacer"/>
            <span className="log-frame">{String(tick).padStart(4,'0')}</span>
          </div>
          <ul className="log-lines">
            {logLines.slice(-6).map((l) => (
              <li key={l.id} className="log-line">
                <span className="log-tag" style={{ color: l.agent.color, borderColor: l.agent.color }}>{l.agent.short}</span>
                <span className="log-msg">{l.msg}<span className="log-cursor">▍</span></span>
              </li>
            ))}
            {logLines.length === 0 && <li className="log-line empty">esperando arranque…</li>}
          </ul>
        </div>
      )}

      {/* === Success summary === */}
      {allDone && (
        <div className="analyze-success">
          <div className="success-left">
            <ScoreRing value={8.4} size={92} stroke={5}/>
            <div className="success-meta">
              <span className="kicker">Score compuesto · Inmogrowth</span>
              <h3 className="success-title">Idea sólida, lista para validar.</h3>
              <p className="success-body">5 hipótesis para testar esta semana · 8 oportunidades de mejora · 3 riesgos críticos identificados.</p>
            </div>
          </div>
          <div className="success-actions">
            <button className="btn btn-secondary"><IconShare size={13}/> Compartir</button>
            <button className="btn btn-primary" onClick={onView}>Ver resultados <IconChevron size={12} sw={2.4}/></button>
          </div>
        </div>
      )}

      <div className="wizard-actions">
        <button className="btn btn-ghost" onClick={onBack}><IconChevron size={12} style={{transform:'rotate(180deg)'}}/> Atrás</button>
        {!allDone && <button className="btn btn-secondary">Cancelar análisis</button>}
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
