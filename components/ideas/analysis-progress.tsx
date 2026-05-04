'use client';

import * as React from 'react';
import { AgentType } from '@/lib/types';
import { ScoreRing } from '@/components/ui/score-ring';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/navigation';

interface AnalysisProgressProps {
  ideaId: string;
  onViewResults: () => void;
}

const AGENTS: { id: AgentType, name: string, short: string, color: string }[] = [
  { id: 'market', name: 'Market Intelligence', short: 'MKT', color: 'var(--accent-pri)' },
  { id: 'competition', name: 'Competitive Strategy', short: 'COMP', color: 'var(--orange)' },
  { id: 'economics', name: 'Unit Economics', short: 'ECON', color: 'var(--yellow)' },
  { id: 'gtm', name: 'Go-To-Market', short: 'GTM', color: 'var(--purple)' },
  { id: 'founder_fit', name: 'Founder Fit', short: 'FIT', color: 'var(--blue)' },
];

export function AnalysisProgress({ ideaId, onViewResults }: AnalysisProgressProps) {
  const [tick, setTick] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 350);
    return () => clearInterval(t);
  }, []);

  // Simulating progress for the wizard feel
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
  const avgScore = tiles.filter(t => t.score).reduce((s,t)=>s+(t.score||0), 0) / Math.max(1, tiles.filter(t => t.score).length);

  return (
    <div className="wizard-card w-full max-w-[680px] mx-auto p-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px]">
      <h2 className="wizard-h1 text-[28px] font-bold font-display tracking-tight text-[var(--text-primary)] mb-2">Analizando tu idea…</h2>
      <p className="wizard-sub text-[14.5px] text-[var(--text-secondary)] leading-relaxed mb-8">Los 5 agentes corren en paralelo. Tarda 60–90 segundos. Puedes cerrar esta pestaña, te avisaremos cuando terminen.</p>

      <div className="analysis-grid grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {tiles.map(({ agent, progress, status, score }) => (
          <div key={agent.id} className={cn("analysis-tile relative p-4 rounded-[14px] border transition-all overflow-hidden", status === 'done' ? "bg-[var(--bg-card)] border-[var(--border-subtle)]" : "bg-[var(--bg-elev)] border-transparent")} style={{ '--accent': agent.color } as React.CSSProperties}>
            <div className="accent-bar absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)]" />
            {status === 'running' && <div className="top-bar absolute top-0 left-0 right-0 h-0.5 bg-[var(--accent)] animate-pulse" />}
            
            <div className="analysis-tile-head flex justify-between items-center mb-3">
              <span className="analysis-name text-[13px] font-bold font-display text-[var(--text-primary)]">{agent.name}</span>
              <span className={cn(
                "status flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider",
                status === 'done' ? "text-[var(--green)]" : status === 'running' ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}>
                {status === 'done' ? <><Check className="h-2.5 w-2.5" strokeWidth={3} /> Listo</> : status === 'running' ? '● Analizando' : 'En cola'}
              </span>
            </div>
            
            <div className="progress-line h-1 w-full bg-[var(--bg-sunken)] rounded-full overflow-hidden mb-2">
              <div className="fill h-full bg-[var(--accent)] transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            
            <div className="meta flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
              <span>{agent.short}</span>
              <span className="score-num font-bold text-[var(--text-primary)]">{score != null ? score.toFixed(1) : '—'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="analysis-summary flex items-center gap-6 p-6 bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[18px] mb-10">
        <ScoreRing value={allDone ? 8.4 : avgScore} size={64} stroke={4} showMax={false} />
        <div className="flex-1">
          <div className="font-display font-bold text-[17px] text-[var(--text-primary)] mb-0.5">
            {allDone ? 'Análisis completo' : `${tiles.filter(t => t.status === 'done').length} de ${tiles.length} agentes listos`}
          </div>
          <div className="analysis-eta text-[12.5px] text-[var(--text-secondary)] font-medium">
            {allDone ? 'Score compuesto global generado' : `ETA ~${Math.max(0, 90 - tick*4)}s · ejecución en paralelo`}
          </div>
        </div>
        {allDone ? (
          <Button onClick={onViewResults} className="h-10 px-5 gap-2 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold text-[13.5px]">
            Ver resultados 
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </Button>
        ) : (
          <Button disabled className="h-10 px-5 gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-bold text-[13.5px]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analizando...
          </Button>
        )}
      </div>

      <div className="wizard-actions flex justify-between pt-8 border-t border-[var(--border-subtle)]">
        <Button variant="ghost" className="text-[14px] text-[var(--text-muted)]" onClick={() => router.push('/dashboard')}>
          Cancelar análisis
        </Button>
      </div>
    </div>
  );
}
