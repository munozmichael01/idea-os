// IdeaOS — Agent card component
const AgentCard = ({ agent, analysis, onReanalyze }) => {
  const accent = agent.color;
  const isLoading = analysis?.status === 'loading';
  const isEmpty = !analysis || analysis.status === 'idle';

  if (isEmpty) {
    return (
      <article className="agent-card empty-agent" style={{ '--accent': accent }}>
        <div className="accent-bar"/>
        <div className="agent-empty-icon"><IconSparkles size={16}/></div>
        <div className="agent-tag"><span className="agent-dot"/>{agent.short}</div>
        <div className="agent-name">{agent.name}</div>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 240 }}>
          Este agente aún no ha analizado la idea.
        </p>
        <button className="btn btn-secondary" style={{ marginTop: 4 }}>
          <IconSparkles size={12}/> Analizar ahora
        </button>
      </article>
    );
  }

  return (
    <article className={`agent-card ${isLoading ? 'loading' : ''}`} style={{ '--accent': accent }}>
      <div className="accent-bar"/>
      {isLoading && <div className="top-bar"/>}

      <div className="agent-head">
        <div className="agent-meta">
          <div className="agent-tag"><span className="agent-dot"/>{agent.short}</div>
          <div className="agent-name">{agent.name}</div>
          <div className="agent-role">{agent.role}</div>
        </div>
        {analysis.score != null && (
          <ScoreRing value={analysis.score} size={48} stroke={3.5} showMax={false}/>
        )}
      </div>

      <p className="agent-headline">{analysis.headline}</p>

      {analysis.strengths?.length > 0 && (
        <div className="agent-list">
          <div className="agent-list-title">Fortalezas</div>
          {analysis.strengths.map((s, i) => (
            <div key={i} className="agent-li check">
              <span className="marker">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
              </span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {analysis.risks?.length > 0 && (
        <div className="agent-list">
          <div className="agent-list-title">Riesgos</div>
          {analysis.risks.map((r, i) => (
            <div key={i} className="agent-li" style={{ color: 'var(--orange)' }}>
              <span className="marker"/>
              <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      {analysis.recommendation && (
        <div className="agent-rec">
          <div className="agent-rec-label">Recomendación</div>
          <div className="agent-rec-text">{analysis.recommendation}</div>
        </div>
      )}

      <div className="agent-actions">
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 10px' }}>
          <IconSparkles size={11}/> Re-analizar
        </button>
        {analysis.nextAction && (
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', alignSelf: 'center' }}>
            Siguiente: {analysis.nextAction.length > 50 ? analysis.nextAction.slice(0, 48) + '…' : analysis.nextAction}
          </span>
        )}
      </div>
    </article>
  );
};

window.AgentCard = AgentCard;
