// IdeaOS — Score helpers + ScoreRing component
const scoreColor = (score) => {
  if (score >= 7.5) return 'var(--green)';
  if (score >= 6.5) return 'var(--yellow)';
  if (score >= 5.0) return 'var(--orange)';
  return 'var(--red)';
};
const scoreLabel = (score) => {
  if (score >= 7.5) return 'Alta prioridad';
  if (score >= 6.5) return 'Prometedora';
  if (score >= 5.0) return 'A desarrollar';
  return 'Baja prioridad';
};
const scoreBg = (score, alpha = 12) => {
  // theme-aware via color-mix
  return `color-mix(in srgb, ${scoreColor(score)} ${alpha}%, transparent)`;
};

const ScoreRing = ({ value, size = 56, stroke = 4, showMax = true, animateDelay = 0 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => setProgress(value / 10), 100 + animateDelay);
    return () => clearTimeout(t);
  }, [value, animateDelay]);

  const offset = c - progress * c;
  const color = scoreColor(value);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} className="track" strokeWidth={stroke} fill="none"/>
        <circle
          cx={size/2} cy={size/2} r={r}
          className="progress"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="label">
        <span className="num" style={{ color }}>{value.toFixed(1)}</span>
        {showMax && <span className="max">/ 10</span>}
      </div>
    </div>
  );
};

window.ScoreRing = ScoreRing;
window.scoreColor = scoreColor;
window.scoreLabel = scoreLabel;
window.scoreBg = scoreBg;
window.scoreBgRGBA = scoreBg; // alias for compat
