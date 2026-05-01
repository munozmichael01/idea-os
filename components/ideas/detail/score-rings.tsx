'use client';

import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number | null;
  max: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreRing({ score, max, label, size = 'md', className }: ScoreRingProps) {
  const percentage = score !== null ? (score / max) * 100 : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizes = {
    sm: 'h-16 w-16 text-xs',
    md: 'h-24 w-24 text-sm',
    lg: 'h-32 w-32 text-base',
  };

  const strokeWidths = {
    sm: 4,
    md: 6,
    lg: 8,
  };

  const getScoreColor = (s: number | null) => {
    if (s === null) return 'stroke-muted';
    if (max === 10) {
      if (s >= 7.5) return 'stroke-green-500';
      if (s >= 6.5) return 'stroke-yellow-500';
      if (s >= 5.0) return 'stroke-orange-500';
      return 'stroke-red-500';
    }
    // For 0-1 scores (confidence, volatility)
    if (s >= 0.7) return 'stroke-blue-500';
    if (s >= 0.4) return 'stroke-indigo-400';
    return 'stroke-slate-400';
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('relative flex items-center justify-center', sizes[size])}>
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            className="stroke-muted/20"
            strokeWidth={strokeWidths[size]}
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
          <circle
            className={cn('transition-all duration-500 ease-in-out', getScoreColor(score))}
            strokeWidth={strokeWidths[size]}
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-bold">
            {score !== null ? (max === 10 ? score.toFixed(1) : `${Math.round(score * 100)}%`) : '-'}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

interface IdeaScoreRingsProps {
  compositeScore: number | null;
  confidenceScore: number | null;
  volatilityScore: number | null;
}

export function IdeaScoreRings({ compositeScore, confidenceScore, volatilityScore }: IdeaScoreRingsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-8 py-4">
      <ScoreRing score={compositeScore} max={10} label="Composite" size="lg" />
      <ScoreRing score={confidenceScore} max={1} label="Confidence" size="md" />
      <ScoreRing score={volatilityScore} max={1} label="Volatility" size="md" />
    </div>
  );
}
