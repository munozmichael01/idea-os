'use client';

import * as React from 'react';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { ScoreRing, scoreColor, scoreLabel, scoreBg } from '@/components/ui/score-ring';
import { IdeaWithAnalyses } from '@/lib/types';

interface IdeaCardProps {
  idea: IdeaWithAnalyses;
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

        <div className="flex flex-wrap justify-between items-center gap-2 min-w-0">
          <span className="priority-badge shrink-0" style={{ color, border: '1px solid currentColor', background: `color-mix(in srgb, ${color} 10%, transparent)` }}>
            <span className="pulse" />
            {scoreLabel(idea.compositeScore)}
          </span>

          <div className="agents-progress shrink-0">
            <div className="agent-dots">
              {Array.from({ length: totalAgents }).map((_, i) => (
                <div
                  key={i}
                  className={cn("agent-dot", i < agentsDone ? "done" : "idle")}
                />
              ))}
            </div>
            <span>{agentsDone}/{totalAgents} agentes</span>
          </div>
        </div>

        <div className="idea-stats">
          <div className="idea-stat">
            <div className="idea-stat-label">
              <span>Confianza</span>
              <span className="val">{((idea.confidenceScore || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="bar"><div className="bar-fill" style={{ width: `${(idea.confidenceScore || 0) * 100}%`, background: 'var(--green)' }}/></div>
          </div>
          <div className="idea-stat">
            <div className="idea-stat-label">
              <span>Volatilidad</span>
              <span className="val">{((idea.volatilityScore || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="bar"><div className="bar-fill" style={{ width: `${(idea.volatilityScore || 0) * 100}%`, background: 'var(--orange)' }}/></div>
          </div>
          <div className="idea-stat">
            <div className="idea-stat-label">
              <span>Análisis</span>
              <span className="val">{agentsDone}<span style={{fontSize: 13, color:'var(--text-muted)', fontWeight:400}}>/5</span></span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
