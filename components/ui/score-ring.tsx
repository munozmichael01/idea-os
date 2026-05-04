'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  value: number | null;
  size?: number;
  stroke?: number;
  showMax?: boolean;
  animateDelay?: number;
  className?: string;
}

export const scoreColor = (score: number | null) => {
  if (score === null) return 'var(--text-muted)';
  if (score >= 7.5) return 'var(--green)';
  if (score >= 6.5) return 'var(--yellow)';
  if (score >= 5.0) return 'var(--orange)';
  return 'var(--red)';
};

export const scoreLabel = (score: number | null) => {
  if (score === null) return 'Sin análisis';
  if (score >= 7.5) return 'Alta prioridad';
  if (score >= 6.5) return 'Prometedora';
  if (score >= 5.0) return 'A desarrollar';
  return 'Baja prioridad';
};

export const scoreBg = (score: number | null, alpha = 12) => {
  return `color-mix(in srgb, ${scoreColor(score)} ${alpha}%, transparent)`;
};

export function ScoreRing({ value, size = 56, stroke = 4, showMax = true, animateDelay = 0, className }: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const val = value ?? 0;
    const t = setTimeout(() => setProgress(val / 10), 100 + animateDelay);
    return () => clearTimeout(t);
  }, [value, animateDelay]);

  const offset = c - progress * c;
  const color = scoreColor(value);

  return (
    <div className={cn("score-ring relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={r} 
          className="stroke-[var(--border-subtle)]" 
          strokeWidth={stroke} 
          fill="none"
        />
        <circle
          cx={size/2} 
          cy={size/2} 
          r={r}
          className="transition-[stroke-dashoffset] duration-600 ease-out"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display font-bold leading-none tracking-tighter" style={{ color, fontSize: size * 0.28 }}>
          {value !== null ? value.toFixed(1) : '-'}
        </span>
        {showMax && value !== null && (
          <span className="text-[var(--text-muted)] opacity-70 tracking-tight" style={{ fontSize: size * 0.15 }}>
            / 10
          </span>
        )}
      </div>
    </div>
  );
}
