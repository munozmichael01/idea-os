// IdeaOS — Auth (Login + Register)
const { useState: useSA, useEffect: useEA } = React;

const Auth = () => {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "mode": "login",
    "state": "form",
    "theme": "dark"
  }/*EDITMODE-END*/);

  useEA(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  const isLogin = tweaks.mode === 'login';
  const isLoading = tweaks.state === 'loading';
  const isError = tweaks.state === 'error';
  const isSuccess = tweaks.state === 'success';

  return (
    <div className="auth-shell">
      <div className="theme-floater">
        <button className={tweaks.theme === 'dark' ? 'active' : ''} onClick={() => setTweak('theme','dark')}>Dark</button>
        <button className={tweaks.theme === 'light' ? 'active' : ''} onClick={() => setTweak('theme','light')}>Light</button>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-brand">
            <div className="brand-mark" aria-label="IdeaOS">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6"/>
                <path d="M10 21h4"/>
                <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3Z"/>
                <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none"/>
                <path d="M12 10.5v3"/>
              </svg>
            </div>
            <span style={{fontFamily:'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em'}}>IdeaOS · v0.4.2</span>
          </div>

          <h1 className="auth-h1">{isLogin ? <>Bienvenido de vuelta<span className="accent">.</span></> : <>Empieza a validar<span className="accent">.</span></>}</h1>
          <p className="auth-tagline">Valida y prioriza tus ideas de negocio con un equipo de 5 agentes de IA. Análisis en menos de 90 segundos.</p>

          <div className="auth-mode-tabs">
            <button className={isLogin ? 'active' : ''} onClick={() => setTweak('mode','login')}>Iniciar sesión</button>
            <button className={!isLogin ? 'active' : ''} onClick={() => setTweak('mode','register')}>Crear cuenta</button>
          </div>

          {isSuccess && !isLogin ? (
            <div className="auth-success">
              <IconCheck size={16} sw={2.4} stroke="var(--green)" style={{flexShrink:0, marginTop: 1}}/>
              <div>
                <div style={{fontWeight: 500, marginBottom: 3}}>Revisa tu email</div>
                <div style={{color:'var(--text-secondary)', fontSize: 12.5}}>Te hemos enviado un enlace de confirmación a <span style={{fontFamily:'var(--font-mono)', color:'var(--text-primary)'}}>jordi@ideaos.app</span>. Caduca en 24h.</div>
              </div>
            </div>
          ) : (
            <form className="auth-card" onSubmit={(e) => { e.preventDefault(); setTweak('state','loading'); setTimeout(() => setTweak('state', isLogin ? 'form' : 'success'), 1200); }}>
              <div className="auth-input-group">
                <label>Email</label>
                <input className={`auth-input ${isError ? 'error' : ''}`} type="email" placeholder="tu@empresa.com" defaultValue="jordi@ideaos.app"/>
              </div>
              <div className="auth-input-group">
                <label style={{display:'flex', justifyContent:'space-between'}}>
                  <span>Contraseña</span>
                  {isLogin && <a href="#" style={{textTransform:'none', letterSpacing:0, color:'var(--text-secondary)', fontSize: 11}}>¿Olvidaste?</a>}
                </label>
                <input className={`auth-input ${isError ? 'error' : ''}`} type="password" placeholder="••••••••" defaultValue="••••••••"/>
                {!isLogin && <div className="helper" style={{marginTop: 4, textTransform:'none', letterSpacing: 0}}><span style={{color:'var(--text-muted)'}}>Mínimo 8 caracteres, 1 número.</span></div>}
              </div>

              {isError && (
                <div className="auth-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  Credenciales incorrectas. Intenta de nuevo o recupera tu contraseña.
                </div>
              )}

              <button type="submit" className="btn btn-primary auth-cta" disabled={isLoading}>
                {isLoading ? (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 0.8s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.2-8.5"/></svg> Procesando…</>
                ) : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>

              <div className="auth-divider">o continúa con</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
                <button type="button" className="btn btn-secondary" style={{justifyContent:'center', padding: 10}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1H12v3.2h5.59c-.5 2.5-2.6 4-5.59 4a6.3 6.3 0 1 1 0-12.6c1.5 0 2.9.6 3.9 1.6l2.2-2.2A9.5 9.5 0 1 0 12 21.5c5.5 0 9.4-3.9 9.4-9.5 0-.4 0-.6-.05-.9z"/></svg>
                  Google
                </button>
                <button type="button" className="btn btn-secondary" style={{justifyContent:'center', padding: 10}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>
                  GitHub
                </button>
              </div>

              <div className="auth-foot">
                {isLogin ? (
                  <>¿No tienes cuenta? <a href="#" onClick={e => {e.preventDefault(); setTweak('mode','register');}}>Crear cuenta</a></>
                ) : (
                  <>¿Ya tienes cuenta? <a href="#" onClick={e => {e.preventDefault(); setTweak('mode','login');}}>Iniciar sesión</a></>
                )}
              </div>
            </form>
          )}

          <div className="auth-helper" style={{marginTop: 14}}>
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Soporte</a>
          </div>
        </div>
      </div>

      <aside className="auth-aside">
        <div className="aside-meta">5 agentes · Score compuesto · Ranking dinámico</div>
        <h2 className="aside-quote">Captura una idea en 60 segundos. <span className="accent">Sabe si vale la pena en 90.</span></h2>

        <div className="aside-preview">
          <div className="aside-meta">Última semana en IdeaOS</div>
          <div className="preview-row">
            <span className="pscore" style={{color:'var(--green)'}}>8.4</span>
            <div><div className="ptitle">Inmogrowth</div><div className="pmeta">Real Estate · 5/5 agentes</div></div>
            <span className="priority-badge" style={{background:'color-mix(in srgb, var(--green) 14%, transparent)', color:'var(--green)'}}><span className="pulse"/>Alta prioridad</span>
          </div>
          <div className="preview-row">
            <span className="pscore" style={{color:'var(--yellow)'}}>6.8</span>
            <div><div className="ptitle">Real State Pro</div><div className="pmeta">PropTech · 5/5 agentes</div></div>
            <span className="priority-badge" style={{background:'color-mix(in srgb, var(--yellow) 14%, transparent)', color:'var(--yellow)'}}><span className="pulse"/>Prometedora</span>
          </div>
          <div className="preview-row">
            <span className="pscore" style={{color:'var(--orange)'}}>5.8</span>
            <div><div className="ptitle">Studio.ai</div><div className="pmeta">Creator economy · 5/5</div></div>
            <span className="priority-badge" style={{background:'color-mix(in srgb, var(--orange) 14%, transparent)', color:'var(--orange)'}}><span className="pulse"/>A desarrollar</span>
          </div>
        </div>

        <div className="aside-stats">
          <div><div className="s-num">2.4k</div><div className="s-lbl">Ideas analizadas</div></div>
          <div><div className="s-num">87s</div><div className="s-lbl">Análisis medio</div></div>
          <div><div className="s-num">12</div><div className="s-lbl">Sectores</div></div>
        </div>
      </aside>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apariencia">
          <TweakRadio label="Tema" value={tweaks.theme} options={['dark','light']} onChange={(v) => setTweak('theme', v)}/>
        </TweakSection>
        <TweakSection title="Modo">
          <TweakRadio value={tweaks.mode} options={['login','register']} onChange={(v) => setTweak('mode', v)}/>
        </TweakSection>
        <TweakSection title="Estado">
          <TweakRadio value={tweaks.state} options={['form','loading','error','success']} onChange={(v) => setTweak('state', v)}/>
        </TweakSection>
      </TweaksPanel>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const authRoot = ReactDOM.createRoot(document.getElementById('root'));
authRoot.render(<Auth/>);
