'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Analysis, AgentType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScoreRing } from '@/components/ui/score-ring';

interface AgentAnalysisCardProps {
  agentType: AgentType;
  analysis?: Analysis;
  isAnalyzing?: boolean;
  onAnalyze: () => void;
}

const AGENT_METADATA: Record<AgentType, { name: string, short: string, role: string, color: string }> = {
  market: { 
    name: 'Market Intelligence', 
    short: 'MKT', 
    role: 'Analista de mercado y tendencias', 
    color: 'var(--accent-pri)' 
  },
  competition: { 
    name: 'Competitive Strategy', 
    short: 'COMP', 
    role: 'Estratega de competición', 
    color: 'var(--orange)' 
  },
  economics: { 
    name: 'Unit Economics', 
    short: 'ECON', 
    role: 'Modelador financiero', 
    color: 'var(--yellow)' 
  },
  gtm: { 
    name: 'Go-To-Market', 
    short: 'GTM', 
    role: 'Especialista en crecimiento', 
    color: 'var(--purple)' 
  },
  founder_fit: { 
    name: 'Founder Fit', 
    short: 'FIT', 
    role: 'Psicólogo de producto', 
    color: 'var(--blue)' 
  },
};

export function AgentAnalysisCard({ agentType, analysis, isAnalyzing, onAnalyze }: AgentAnalysisCardProps) {
  const [isMobile, setIsMobile] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsMobile(!mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  const metadata = AGENT_METADATA[agentType];
  const isLoading = isAnalyzing;
  const isEmpty = !analysis && !isLoading;
  const accent = metadata.color;

  if (isEmpty) {
    return (
      <article className="agent-card empty-agent group w-full" style={{ '--accent': accent, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', ...(isMobile && { padding: '16px' }) } as React.CSSProperties}>
        <div className="accent-bar" />
        <div className="agent-empty-icon flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elev)] border border-[var(--border-subtle)] text-[var(--text-muted)] group-hover:text-[var(--accent-pri)] transition-colors">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="agent-tag flex items-center gap-2 mt-4 mb-1">
          <span className="agent-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{metadata.short}</span>
        </div>
        <div className="agent-name font-display font-bold text-[16px] text-[var(--text-primary)] mb-2">{metadata.name}</div>
        <p className="text-[12.5px] text-[var(--text-muted)] leading-relaxed max-w-[240px] mb-4">
          Este agente aún no ha analizado la idea. Ejecuta el análisis para obtener insights competitivos.
        </p>
        <Button 
          variant="secondary" 
          onClick={onAnalyze}
          className="h-8 gap-2 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)]"
        >
          <Sparkles className="h-3 w-3" />
          Analizar ahora
        </Button>
      </article>
    );
  }

  return (
    <article className={cn("agent-card relative w-full", isLoading && "loading")} style={{ '--accent': accent, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', ...(isMobile && { padding: '16px' }) } as React.CSSProperties}>
      <div className="accent-bar" />
      {isLoading && <div className="top-bar absolute top-0 left-0 right-0 h-0.5 bg-[var(--accent)] animate-pulse" />}

      <div className="agent-head flex justify-between items-start mb-4">
        <div className="agent-meta">
          <div className="agent-tag flex items-center gap-2 mb-1">
            <span className="agent-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">{metadata.short}</span>
          </div>
          <div className="agent-name font-display font-bold text-[18px] text-[var(--text-primary)] leading-none mb-1">{metadata.name}</div>
          <div className="agent-role text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wide">{metadata.role}</div>
        </div>
        {analysis && (
          <ScoreRing value={analysis.score} size={48} stroke={3.5} showMax={false} />
        )}
      </div>

      <p className="agent-headline text-[15px] font-bold text-[var(--text-primary)] leading-snug mb-5">
        {isLoading ? "Analizando propuesta de valor..." : analysis?.headline}
      </p>

      {!isLoading && analysis && (
        <div className="flex flex-col gap-5">
          {analysis.strengths?.length > 0 && (
            <div className="agent-list flex flex-col gap-2">
              <div className="agent-list-title font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">Fortalezas</div>
              <div className="flex flex-col gap-1.5">
                {analysis.strengths.slice(0, 3).map((s, i) => (
                  <div key={i} className="agent-li check flex items-start gap-2 text-[14px] text-[var(--text-secondary)]">
                    <span className="marker mt-1 flex-shrink-0">
                      <Check className="h-3 w-3 text-[var(--green)]" strokeWidth={3} />
                    </span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.risks?.length > 0 && (
            <div className="agent-list flex flex-col gap-2">
              <div className="agent-list-title font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">Riesgos</div>
              <div className="flex flex-col gap-1.5">
                {analysis.risks.slice(0, 3).map((r, i) => (
                  <div key={i} className="agent-li flex items-start gap-2 text-[14px] text-[var(--orange)]">
                    <span className="marker h-1 w-1 rounded-full bg-[var(--orange)] mt-2 flex-shrink-0" />
                    <span className="text-[var(--text-secondary)]">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendation && (
            <div className="agent-rec p-3 rounded-[10px] bg-[var(--bg-elev)] border border-[var(--border-subtle)]">
              <div className="agent-rec-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Recomendación</div>
              <div className="agent-rec-text text-[13px] leading-relaxed text-[var(--text-primary)]">{analysis.recommendation}</div>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="h-20 w-full bg-[var(--bg-elev)] rounded-[10px] animate-pulse" />
          <div className="h-12 w-full bg-[var(--bg-elev)] rounded-[10px] animate-pulse" />
        </div>
      )}

      <div className="agent-actions flex items-center justify-between gap-4 mt-auto pt-5 border-t border-[var(--border-subtle)]">
        <Button 
          variant="secondary" 
          onClick={onAnalyze}
          disabled={isLoading}
          className="h-8 gap-2 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)]"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Re-analizar
        </Button>
        {analysis?.nextValidationAction && !isLoading && (
          <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[150px]" title={analysis.nextValidationAction}>
            Next: {analysis.nextValidationAction}
          </span>
        )}
      </div>
    </article>
  );
}

interface ContextAgentCardProps {
  summary?: string;
  isAnalyzing?: boolean;
  onAnalyze: () => void;
}

export function ContextAgentCard({ summary, isAnalyzing, onAnalyze }: ContextAgentCardProps) {
  const [isMobile, setIsMobile] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsMobile(!mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return (
    <article className={cn("agent-card relative w-full", isAnalyzing && "loading")} style={{ '--accent': 'var(--purple)', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', ...(isMobile && { padding: '16px' }) } as React.CSSProperties}>
      <div className="accent-bar" />
      <div className="agent-head flex justify-between items-start mb-4">
        <div className="agent-meta">
          <div className="agent-tag flex items-center gap-2 mb-1">
            <span className="agent-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">CTX</span>
          </div>
          <div className="agent-name font-display font-bold text-[18px] text-[var(--text-primary)] leading-none mb-1">Context Summary</div>
          <div className="agent-role text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide">Sintetizador de contexto</div>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {summary ? (
          <div className="overflow-y-auto max-h-[260px] pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-subtle) transparent' }}>
            <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center space-y-2 text-muted-foreground bg-[var(--bg-elev)] rounded-[10px] border border-dashed border-[var(--border-subtle)]">
            <p className="text-xs">Context not yet summarized</p>
          </div>
        )}
      </div>

      <div className="agent-actions flex items-center justify-end gap-4 mt-auto pt-5 border-t border-[var(--border-subtle)]">
        <Button 
          variant="secondary" 
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="h-8 gap-2 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)]"
        >
          {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Summarize
        </Button>
      </div>
    </article>
  );
}
