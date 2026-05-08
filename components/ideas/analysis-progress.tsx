'use client';

import * as React from 'react';
import { AgentType } from '@/lib/types';
import { ScoreRing } from '@/components/ui/score-ring';
import { Check, ChevronRight, ChevronLeft, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/navigation';

interface AnalysisProgressProps {
  ideaId: string;
  onViewResults: () => void;
  onBack?: () => void;
}

const AGENTS: { id: AgentType, name: string, short: string, color: string }[] = [
  { id: 'market', name: 'Market Intelligence', short: 'MKT', color: 'var(--accent-pri)' },
  { id: 'competition', name: 'Competitive Strategy', short: 'COMP', color: 'var(--orange)' },
  { id: 'economics', name: 'Unit Economics', short: 'ECON', color: 'var(--yellow)' },
  { id: 'gtm', name: 'Go-To-Market', short: 'GTM', color: 'var(--purple)' },
  { id: 'founder_fit', name: 'Founder Fit', short: 'FIT', color: 'var(--blue)' },
];

const THOUGHTS: Record<string, string[]> = {
  market:  ['Calculando TAM/SAM en SoEU', 'Cruzando INE × SEPE × Idealista', 'Tasa de captación residencial 2024-26', 'Demanda real vs declarada'],
  competition:    ['Mapeando players UE/US', 'Compass · Witei · Sooprema', 'Riesgo plataformización Idealista', 'Buscando moats defendibles'],
  economics:    ['Modelando ARPU €490/mes', 'CAC payback ~6 meses', 'Curva de churn vertical SaaS', 'Sensibilidad a precio'],
  gtm:     ['Mapa de canales · SIMA mayo', 'Wedge: valoración predictiva', 'Outbound · LinkedIn × eventos', 'Loop viral por API'],
  founder_fit:     ['Cruce founder × tesis', '7 años en proptech', 'Red activa SIMA + top-50', 'Gap: CTO ML senior'],
};

// 5 agents, evenly spaced 72° apart
const AGENT_POSITIONS = [
  { angle: -90 },
  { angle: -18 },
  { angle:  54 },
  { angle: 126 },
  { angle: 198 },
];

const polar = (cx: number, cy: number, r: number, angleDeg: number): [number, number] => {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

export function AnalysisProgress({ ideaId, onViewResults, onBack }: AnalysisProgressProps) {
  const [tick, setTick] = React.useState(0);
  const [logLines, setLogLines] = React.useState<{ id: number; agent: any; msg: string; ts: number }[]>([]);
  const [celebrate, setCelebrate] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // TODO: Reemplazar este setInterval simulado con el estado real de tu backend (Websockets/SSE)
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
  React.useEffect(() => {
    if (allDone && !celebrate) {
      const id = setTimeout(() => setCelebrate(true), 250);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [allDone, celebrate]);

  // Append a log line every couple ticks from a running agent
  React.useEffect(() => {
    if (allDone) return;
    if (tick % 2 !== 0) return;
    const running = tiles.filter(t => t.status === 'running');
    if (!running.length) return;
    const pick = running[Math.floor(Math.random() * running.length)];
    if (!pick) return;
    const pool = THOUGHTS[pick.agent.id] || [];
    const msg = pool[Math.floor(Math.random() * pool.length)];
    if (!msg) return;
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
    <div className="wizard-card analyze-card w-full max-w-[680px] mx-auto p-5 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[16px] sm:rounded-[24px]">
      <h2 className="wizard-h1 text-[28px] font-bold font-display tracking-tight text-[var(--text-primary)] mb-2">
        {allDone ? 'Análisis completo' : 'Analizando tu idea…'}
      </h2>
      <p className="wizard-sub text-[14.5px] text-[var(--text-secondary)] leading-relaxed mb-8">
        {allDone
          ? 'Los 5 agentes han llegado a un veredicto. Score compuesto listo.'
          : 'Los 5 agentes corren en paralelo y comparten señales. Puedes cerrar esta pestaña, te avisaremos al terminar.'}
      </p>

      {/* === Cinematic stage === */}
      <div className={cn("analyze-stage", celebrate && "celebrate")}>
        <div className="analyze-bg-grid" aria-hidden="true" />

        <svg className="analyze-svg" viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--green)" stopOpacity="0.95" />
              <stop offset="60%" stopColor="var(--green)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
            </radialGradient>
            <filter id="agentGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Outer orbit ring */}
          <circle cx={cx} cy={cy} r={orbitR} className="orbit-ring" />
          <circle cx={cx} cy={cy} r={orbitR + 18} className="orbit-ring outer" />

          {/* Pulsing rings from the core (only while running) */}
          {!allDone && [0, 1, 2].map(i => (
            <circle
              key={`pulse-${i}`}
              cx={cx} cy={cy} r={coreR}
              className="pulse-ring"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}

          {/* Connection lines: core → agent */}
          {tiles.map(({ agent, status }, i) => {
            const [x, y] = polar(cx, cy, orbitR, AGENT_POSITIONS[i]?.angle || 0);
            return (
              <g key={`line-${agent.id}`}>
                <line
                  x1={cx} y1={cy} x2={x} y2={y}
                  className={cn("agent-line", status)}
                  style={{ stroke: agent.color, '--accent': agent.color } as React.CSSProperties}
                />
                {status === 'running' && (
                  <circle r="3" className="line-pulse" style={{ fill: agent.color, offsetPath: `path('M${cx},${cy} L${x},${y}')`, animationDelay: `${i * 0.25}s` } as any} />
                )}
              </g>
            );
          })}

          {/* Cross-talk between currently-running agents */}
          {runningIdx.length > 1 && runningIdx.slice(0, -1).map((i, k) => {
            const j = runningIdx[k + 1];
            if (j === undefined) return null;
            const [x1, y1] = polar(cx, cy, orbitR, AGENT_POSITIONS[i]?.angle || 0);
            const [x2, y2] = polar(cx, cy, orbitR, AGENT_POSITIONS[j]?.angle || 0);
            return (
              <line key={`xt-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} className="cross-talk" />
            );
          })}

          {/* Agent nodes */}
          {tiles.map(({ agent, status, progress }, i) => {
            const [x, y] = polar(cx, cy, orbitR, AGENT_POSITIONS[i]?.angle || 0);
            const r = 22;
            const C = 2 * Math.PI * (r + 6);
            const dash = C * progress;
            return (
              <g key={`node-${agent.id}`} transform={`translate(${x} ${y})`} className={cn("agent-node", status)}>
                <circle r={r + 14} className="node-halo" style={{ fill: agent.color }} />
                <circle r={r + 6} className="node-arc-track" />
                <circle
                  r={r + 6}
                  className="node-arc-fill"
                  transform="rotate(-90)"
                  style={{ stroke: agent.color, strokeDasharray: `${dash} ${C}` }}
                />
                <circle r={r} className="node-body" style={{ '--accent': agent.color } as React.CSSProperties} />
                <circle r={r - 5} className="node-inner" style={{ stroke: agent.color }} />
                <text className="node-code" textAnchor="middle" dy="4">{agent.short}</text>
                {status === 'done' && (
                  <g className="node-check">
                    <circle r={11} cx={r - 4} cy={-r + 4} fill="var(--green)" />
                    <path d={`M${r - 9},${-r + 4} l3,3 l6,-6`} stroke="var(--bg-base)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Agent labels */}
          {tiles.map(({ agent, status, score }, i) => {
            const a = AGENT_POSITIONS[i]?.angle || 0;
            const [lx, ly] = polar(cx, cy, orbitR + 44, a);
            const anchor = Math.cos((a * Math.PI) / 180) > 0.2 ? 'start' : Math.cos((a * Math.PI) / 180) < -0.2 ? 'end' : 'middle';
            return (
              <g key={`lbl-${agent.id}`} className={cn("agent-label", status)}>
                <text x={lx} y={ly - 4} className="lbl-name" textAnchor={anchor as any}>{agent.name}</text>
                <text x={lx} y={ly + 10} className="lbl-meta" textAnchor={anchor as any} style={{ fill: agent.color }}>
                  {status === 'done' ? `${score?.toFixed(1)} / 10` : status === 'running' ? 'analizando' : 'en cola'}
                </text>
              </g>
            );
          })}

          {/* Core */}
          <g transform={`translate(${cx} ${cy})`} className={cn("analyze-core", allDone && "done")}>
            <circle r={coreR + 22} fill="url(#coreGrad)" className="core-glow" />
            <circle r={coreR} className="core-disc" />
            <circle r={coreR - 6} className="core-disc-inner" />
            {allDone ? (
              <path d="M-9,0 l6,6 l12,-12" stroke="var(--bg-base)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" className="core-check" />
            ) : (
              <text className="core-pct" textAnchor="middle" dy="5">{Math.round((doneCount / tiles.length) * 100)}<tspan className="core-pct-unit">%</tspan></text>
            )}
          </g>

          {/* Confetti sparks */}
          {celebrate && [...Array(14)].map((_, i) => {
            const ang = (i * 360) / 14;
            const [x, y] = polar(cx, cy, orbitR + 60, ang);
            return <circle key={`spark-${i}`} cx={cx} cy={cy} r={2} className="spark" style={{ '--tx': `${x - cx}px`, '--ty': `${y - cy}px`, animationDelay: `${i * 0.04}s` } as React.CSSProperties} />;
          })}
        </svg>

        {/* HUD */}
        <div className="analyze-hud">
          <div className="hud-pill">
            <span className={cn("dot", allDone ? "done" : "live")} />
            <span>{allDone ? 'COMPLETO' : 'EN CURSO'}</span>
          </div>
          <div className="hud-pill mono">
            {allDone ? `5 / 5 listos` : `${doneCount} / 5 listos · ETA ~${Math.max(0, 90 - tick * 3)}s`}
          </div>
        </div>
      </div>

      {/* === Live thinking log === */}
      {!allDone && (
        <div className="analyze-log">
          <div className="log-head">
            <span className="log-dot" />
            <span>Pensando en paralelo</span>
            <span className="log-spacer" />
            <span className="log-frame">{String(tick).padStart(4, '0')}</span>
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
            <ScoreRing value={8.4} size={92} stroke={5} />
            <div className="success-meta">
              <span className="kicker">Score compuesto generado</span>
              <h3 className="success-title">Idea sólida, lista para validar.</h3>
              <p className="success-body">Hipótesis generadas · oportunidades de mejora · riesgos identificados.</p>
            </div>
          </div>
          <div className="success-actions">
            <Button variant="secondary" onClick={() => {}} className="w-full sm:w-auto h-10 px-5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]"><Share2 size={13} className="mr-2" /> Compartir</Button>
            <Button className="w-full sm:w-auto h-10 px-6 gap-2 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold" onClick={onViewResults}>Ver resultados <ChevronRight size={12} strokeWidth={2.4} /></Button>
          </div>
        </div>
      )}

      <div className="wizard-actions flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--border-subtle)]">
        <Button variant="ghost" className="order-2 sm:order-1 text-[14px] text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={onBack || (() => router.push('/dashboard'))}>
          <ChevronLeft size={16} className="mr-2" /> Atrás
        </Button>
        {!allDone && (
          <Button variant="secondary" className="order-1 sm:order-2 w-full sm:w-auto border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
            Cancelar análisis
          </Button>
        )}
      </div>
    </div>
  );
}
