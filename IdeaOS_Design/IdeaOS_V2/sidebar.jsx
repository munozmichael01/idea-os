// IdeaOS — Sidebar
const Sidebar = ({ collapsed, onToggle, lang, onLang, theme = 'dark', onTheme, active = 'dashboard', counts = {} }) => {
  const nav = [
    { id: 'dashboard', label: 'Panel de Control', icon: IconDashboard },
    { id: 'ideas', label: 'Ideas', icon: IconBulb, badge: counts.ideas },
    { id: 'new', label: 'Nueva Idea', icon: IconPlus },
    { id: 'settings', label: 'Configuración', icon: IconSettings },
  ];

  return (
    <aside className="sidebar">
      <button className="collapse-btn" onClick={onToggle} title="Colapsar sidebar">
        <IconChevron size={11} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }} />
      </button>

      <div className="brand">
        <div className="brand-mark" aria-label="IdeaOS">
          {/* Bombilla geométrica con destello — el filamento forma un "i" minúscula */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* bulbo */}
            <path d="M9 18h6"/>
            <path d="M10 21h4"/>
            <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3Z"/>
            {/* destello del filamento — punto + raya forma una "i" */}
            <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none"/>
            <path d="M12 10.5v3"/>
          </svg>
        </div>
        <div className="brand-name">Idea<span className="accent">OS</span></div>
      </div>

      <div className="sb-section-label">Workspace</div>
      <nav className="nav">
        {nav.map(item => {
          const I = item.icon;
          return (
            <a key={item.id} href="#" className={`nav-item ${active === item.id ? 'active' : ''}`}>
              <I className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge != null && <span className="nav-badge">{item.badge}</span>}
            </a>
          );
        })}
      </nav>

      <div className="sb-section-label" style={{ marginTop: 8 }}>Recientes</div>
      <nav className="nav">
        <a href="#" className="nav-item">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginLeft: 5, marginRight: 5 }}/>
          <span className="nav-label">Inmogrowth</span>
        </a>
        <a href="#" className="nav-item">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)', flexShrink: 0, marginLeft: 5, marginRight: 5 }}/>
          <span className="nav-label">Real State Pro</span>
        </a>
        <a href="#" className="nav-item">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginLeft: 5, marginRight: 5 }}/>
          <span className="nav-label">Cold-DM Loop</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="theme-toggle">
          <button className={theme === 'dark' ? 'active' : ''} onClick={() => onTheme('dark')} title="Modo oscuro" aria-label="Dark">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
            <span>Dark</span>
          </button>
          <button className={theme === 'light' ? 'active' : ''} onClick={() => onTheme('light')} title="Modo claro" aria-label="Light">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            <span>Light</span>
          </button>
        </div>
        <div className="lang-toggle">
          <button className={lang === 'es' ? 'active' : ''} onClick={() => onLang('es')}>ES</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => onLang('en')}>EN</button>
        </div>
        <div className="user-card">
          <div className="avatar">JM</div>
          <div className="user-meta">
            <span className="user-name">Jordi M.</span>
            <span className="user-email">jordi@ideaos.app</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
