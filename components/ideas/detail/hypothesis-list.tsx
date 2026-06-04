'use client';

import * as React from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsMobile(!mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return isMobile;
}
import { Hypothesis, AgentType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, XCircle } from 'lucide-react';

interface HypothesisListProps {
  hypotheses: Hypothesis[];
}

const AGENT_SHORT: Record<AgentType, string> = {
  problem: 'PROB',
  market: 'MKT',
  competition: 'COMP',
  economics: 'ECON',
  gtm: 'GTM',
  founder_fit: 'FIT',
};

const AGENT_COLORS: Record<AgentType, string> = {
  problem: 'var(--red)',
  market: 'var(--accent-pri)',
  competition: 'var(--orange)',
  economics: 'var(--yellow)',
  gtm: 'var(--purple)',
  founder_fit: 'var(--blue)',
};

const STATUS_LABELS: Record<string, string> = {
  unvalidated: 'Sin validar',
  confirmed: 'Confirmada',
  invalidated: 'Descartada',
};

function HypothesisCard({ h }: { h: Hypothesis }) {
  const isMobile = useIsMobile();
  const accent = AGENT_COLORS[h.agentType as AgentType] || 'var(--text-muted)';
  const statusClass = h.status === 'confirmed' ? 'confirmed' : h.status === 'invalidated' ? 'invalidated' : 'pending';

  return (
    <div
      className="hyp bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] transition-all hover:border-[var(--border-active)] mb-2"
      style={{
        '--accent': accent,
        padding: '12px 14px',
        ...(isMobile && { display: 'flex', flexDirection: 'column', gap: '8px' }),
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="agent-stamp flex-shrink-0 px-1.5 py-0.5 rounded-[4px] bg-[var(--bg-elev)] border border-[var(--border-subtle)] font-mono text-[9px] font-bold text-[var(--accent)]">
          {AGENT_SHORT[h.agentType as AgentType] || '??'}
        </span>
        <span className={cn(
          "hyp-status flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-bold",
          statusClass === 'confirmed' ? "bg-[rgba(22,168,110,0.1)] text-[var(--green)]" :
          statusClass === 'invalidated' ? "bg-[rgba(216,56,56,0.1)] text-[var(--red)]" :
          "bg-[var(--bg-elev)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
        )}>
          {statusClass === 'confirmed' && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          {statusClass === 'invalidated' && <XCircle className="h-2.5 w-2.5" strokeWidth={3} />}
          {STATUS_LABELS[h.status] || h.status}
        </span>
      </div>
      <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">{h.description}</p>
    </div>
  );
}

export function HypothesisList({ hypotheses }: HypothesisListProps) {
  const sortedHypotheses = React.useMemo(() => {
    return [...hypotheses].sort((a, b) => 
      (a.agentType || '').localeCompare(b.agentType || '')
    );
  }, [hypotheses]);

  const pendingCount = hypotheses.filter(h => h.status === 'unvalidated').length;

  return (
    <div className="hypotheses-section">
      <h2 className="section-title-lg flex items-center gap-3 text-[18px] font-bold font-display text-[var(--text-primary)] mb-6">
        Hipótesis a validar
        <span className="sub font-normal text-[13px] text-[var(--text-muted)] font-sans">
          {pendingCount} pendientes de {hypotheses.length} totales
        </span>
      </h2>
      
      {hypotheses.length === 0 ? (
        <div className="p-8 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-[16px]">
          <p className="text-[13.5px] text-[var(--text-muted)] italic">Aún no hay hipótesis generadas. Ejecuta el análisis para identificar los supuestos críticos de tu idea.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {sortedHypotheses.map(h => <HypothesisCard key={h.id} h={h} />)}
        </div>
      )}
    </div>
  );
}
