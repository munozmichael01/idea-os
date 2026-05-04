'use client';

import * as React from 'react';
import { Hypothesis, AgentType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, HelpCircle, XCircle } from 'lucide-react';

interface HypothesisListProps {
  hypotheses: Hypothesis[];
}

const AGENT_SHORT: Record<AgentType, string> = {
  market: 'MKT',
  competition: 'COMP',
  economics: 'ECON',
  gtm: 'GTM',
  founder_fit: 'FIT',
};

const AGENT_COLORS: Record<AgentType, string> = {
  market: 'var(--accent-pri)',
  competition: 'var(--orange)',
  economics: 'var(--yellow)',
  gtm: 'var(--purple)',
  founder_fit: 'var(--blue)',
};

function HypothesisCard({ h }: { h: Hypothesis }) {
  const accent = AGENT_COLORS[h.agentType as AgentType] || 'var(--text-muted)';
  const statusClass = h.status === 'confirmed' ? 'confirmed' : h.status === 'invalidated' ? 'invalidated' : 'pending';
  
  return (
    <div className={cn("hyp flex items-start gap-3 p-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[12px] transition-all hover:border-[var(--border-active)] mb-2")} style={{ '--accent': accent } as React.CSSProperties}>
      <span className="agent-stamp flex-shrink-0 px-1.5 py-0.5 rounded-[4px] bg-[var(--bg-elev)] border border-[var(--border-subtle)] font-mono text-[9px] font-bold text-[var(--accent)]">
        {AGENT_SHORT[h.agentType as AgentType] || '??'}
      </span>
      <p className="text-[13px] text-[var(--text-primary)] leading-relaxed flex-1">{h.description}</p>
      <span className={cn(
        "hyp-status flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-bold shrink-0 mt-0.5",
        statusClass === 'confirmed' ? "bg-[rgba(22,168,110,0.1)] text-[var(--green)]" : 
        statusClass === 'invalidated' ? "bg-[rgba(216,56,56,0.1)] text-[var(--red)]" : 
        "bg-[var(--bg-elev)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
      )}>
        {statusClass === 'confirmed' && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
        {statusClass === 'invalidated' && <XCircle className="h-2.5 w-2.5" strokeWidth={3} />}
        {h.status}
      </span>
    </div>
  );
}

const HypothesesGroup = ({ criticality, color, items }: { criticality: string, color: string, items: Hypothesis[] }) => {
  if (items.length === 0) return null;
  return (
    <div className="hyp-group mb-6">
      <div className="hyp-group-head flex items-center gap-2.5 mb-3 px-1">
        <span className="crit-dot h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Criticidad {criticality.toLowerCase()}</span>
        <span className="crit-count ml-auto px-1.5 py-0.5 rounded-[4px] bg-[var(--bg-elev)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">{items.length}</span>
      </div>
      <div className="flex flex-col">
        {items.map(h => <HypothesisCard key={h.id} h={h} />)}
      </div>
    </div>
  );
};

export function HypothesisList({ hypotheses }: HypothesisListProps) {
  const hypsByCrit = {
    Alta: hypotheses.filter(h => h.criticality === 'high'),
    Media: hypotheses.filter(h => h.criticality === 'medium'),
    Baja: hypotheses.filter(h => h.criticality === 'low'),
  };

  return (
    <div className="hypotheses-section">
      <h2 className="section-title-lg flex items-center gap-3 text-[18px] font-bold font-display text-[var(--text-primary)] mb-6">
        Hipótesis
        <span className="sub font-normal text-[13px] text-[var(--text-muted)] font-sans">
          {hypotheses.length} totales · {hypotheses.filter(h => h.status === 'unvalidated').length} pendientes
        </span>
      </h2>
      
      {hypotheses.length === 0 ? (
        <div className="p-8 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-[16px]">
          <p className="text-[13.5px] text-[var(--text-muted)] italic">No hypotheses generated yet.</p>
        </div>
      ) : (
        <>
          <HypothesesGroup criticality="Alta" color="var(--red)" items={hypsByCrit.Alta} />
          <HypothesesGroup criticality="Media" color="var(--yellow)" items={hypsByCrit.Media} />
          <HypothesesGroup criticality="Baja" color="var(--text-muted)" items={hypsByCrit.Baja} />
        </>
      )}
    </div>
  );
}
