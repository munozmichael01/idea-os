'use client';

import * as React from 'react';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { ScoreRing, scoreColor, scoreLabel, scoreBg } from '@/components/ui/score-ring';
import { Idea } from '@/lib/types';

interface IdeaCardProps {
  idea: Idea;
  delay?: number;
}

export function IdeaCard({ idea, delay = 0 }: IdeaCardProps) {
  const color = scoreColor(idea.compositeScore);
  
  // Count agents done (mock logic based on available analyses)
  const agentsDone = idea.analyses?.length || 0;
  const totalAgents = 5;

  return (
    <Link href={`/ideas/${idea.id}`}>
      <article className="idea-card">
        <div className="idea-head">
          <div className="idea-meta">
            <h3 className="idea-title">{idea.title}</h3>
            <div className="idea-tags">
              <span>{idea.sector || 'Sin sector'}</span>
              {idea.businessModel && (
                <>
                  <span className="sep">·</span>
                  <span>{idea.businessModel}</span>
                </>
              )}
              {idea.targetMarket && (
                <>
                  <span className="sep">·</span>
                  <span>{idea.targetMarket}</span>
                </>
              )}
            </div>
          </div>
          <ScoreRing value={idea.compositeScore} size={64} stroke={4} animateDelay={delay} />
        </div>

        <div className="flex justify-between items-center gap-10">
          <span className="priority-badge" style={{ background: scoreBg(idea.compositeScore), color }}>
            <span className="pulse" />
            {scoreLabel(idea.compositeScore)}
          </span>
          
          <div className="agents-progress flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            <div className="agent-dots flex gap-0.5">
              {Array.from({ length: totalAgents }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 w-4 rounded-[2px]", 
                    i < agentsDone ? "bg-[var(--accent-pri)]" : "bg-[var(--border-subtle)]"
                  )} 
                />
              ))}
            </div>
            <span>{agentsDone}/{totalAgents}</span>
          </div>
        </div>

        <div className="idea-stats grid grid-cols-3 gap-0 pt-3.5 border-t border-[var(--border-subtle)]">
          <div className="idea-stat flex flex-col gap-1.5 px-3 first:pl-0 border-r border-[var(--border-subtle)]">
            <div className="idea-stat-label flex flex-col gap-1">
              <span className="text-[9.5px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Confianza</span>
              <span className="text-[20px] font-display font-bold tracking-tight text-[var(--text-primary)]">
                {((idea.confidenceScore || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="idea-stat flex flex-col gap-1.5 px-3 border-r border-[var(--border-subtle)]">
            <div className="idea-stat-label flex flex-col gap-1">
              <span className="text-[9.5px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Volatilidad</span>
              <span className="text-[20px] font-display font-bold tracking-tight text-[var(--text-primary)]">
                {((idea.volatilityScore || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="idea-stat flex flex-col gap-1.5 px-3 last:pr-0">
            <div className="idea-stat-label flex flex-col gap-1">
              <span className="text-[9.5px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Análisis</span>
              <span className="text-[20px] font-display font-bold tracking-tight text-[var(--text-primary)]">
                {agentsDone}<span className="text-[13px] text-[var(--text-muted)] font-normal">/5</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
