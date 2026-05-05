// IdeaOS — Idea card
const PriorityBadge = ({ score }) => {
  const color = scoreColor(score);
  const bg = scoreBg(score, 12);
  return (
    <span className="priority-badge" style={{ background: bg, color }}>
      <span className="pulse"/>
      {scoreLabel(score)}
    </span>
  );
};

const AgentDots = ({ done, total = 5, statuses }) => {
  const dots = statuses || Array.from({ length: total }, (_, i) => i < done ? 'done' : 'idle');
  return (
    <div className="agents-progress" style={{ color: scoreColor(done >= 4 ? 8 : done >= 2 ? 6 : 5) }}>
      <div className="agent-dots">
        {dots.map((s, i) => <div key={i} className={`agent-dot ${s}`}/>)}
      </div>
      <span>{done}/{total} agentes</span>
    </div>
  );
};

const IdeaCard = ({ idea, onClick, delay = 0 }) => {
  const color = scoreColor(idea.score);
  return (
    <article className="idea-card" onClick={onClick}>
      <div className="priority-stripe" style={{ background: color }}/>

      <div className="idea-head">
        <div className="idea-meta">
          <h3 className="idea-title">{idea.title}</h3>
          <div className="idea-tags">
            <span>{idea.sector}</span>
            <span className="sep">·</span>
            <span>{idea.model}</span>
            <span className="sep">·</span>
            <span>{idea.market}</span>
          </div>
        </div>
        <ScoreRing value={idea.score} size={60} stroke={4} animateDelay={delay}/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <PriorityBadge score={idea.score}/>
        <AgentDots done={idea.agentsDone} statuses={idea.agentStatuses}/>
      </div>

      <div className="idea-stats">
        <div className="idea-stat">
          <div className="idea-stat-label">
            <span>Confianza</span>
            <span className="val">{(idea.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="bar"><div className="bar-fill" style={{ width: `${idea.confidence*100}%`, background: 'var(--green)' }}/></div>
        </div>
        <div className="idea-stat">
          <div className="idea-stat-label">
            <span>Volatilidad</span>
            <span className="val">{(idea.volatility * 100).toFixed(0)}%</span>
          </div>
          <div className="bar"><div className="bar-fill" style={{ width: `${idea.volatility*100}%`, background: 'var(--orange)' }}/></div>
        </div>
        <div className="idea-stat">
          <div className="idea-stat-label">
            <span>Agentes</span>
            <span className="val">{idea.agentsDone}<span style={{fontSize: 13, color:'var(--text-muted)', fontWeight:400}}>/5</span></span>
          </div>
        </div>
      </div>
    </article>
  );
};

const IdeaCardSkeleton = () => (
  <article className="idea-card" style={{ pointerEvents: 'none' }}>
    <div className="idea-head">
      <div className="idea-meta" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 18, width: '70%' }}/>
        <div className="skeleton" style={{ height: 11, width: '50%' }}/>
      </div>
      <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%' }}/>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="skeleton" style={{ height: 22, width: 110, borderRadius: 6 }}/>
      <div className="skeleton" style={{ height: 12, width: 90 }}/>
    </div>
    <div className="idea-stats">
      <div className="idea-stat" style={{ gap: 8 }}><div className="skeleton" style={{ height: 10, width: '60%' }}/><div className="skeleton" style={{ height: 4 }}/></div>
      <div className="idea-stat" style={{ gap: 8 }}><div className="skeleton" style={{ height: 10, width: '60%' }}/><div className="skeleton" style={{ height: 4 }}/></div>
    </div>
  </article>
);

window.IdeaCard = IdeaCard;
window.IdeaCardSkeleton = IdeaCardSkeleton;
window.PriorityBadge = PriorityBadge;
window.AgentDots = AgentDots;
