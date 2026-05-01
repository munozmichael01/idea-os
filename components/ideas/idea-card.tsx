'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    sector: string | null;
    businessModel: string | null;
    compositeScore: number | null;
  };
}

export function IdeaCard({ idea }: IdeaCardProps) {

  const getPriorityInfo = (score: number | null) => {
    if (score === null) return { label: 'Sin score', color: 'bg-muted text-muted-foreground' };
    if (score >= 7.5) return { label: 'Alta prioridad', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    if (score >= 6.5) return { label: 'Prometedora', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    if (score >= 5.0) return { label: 'A desarrollar', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
    return { label: 'Baja prioridad', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  };

  const priority = getPriorityInfo(idea.compositeScore);

  return (
    <Link href={`/ideas/${idea.id}`}>
      <Card className="transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1 text-base font-bold">{idea.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{idea.sector}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/10 bg-primary/5 font-bold text-primary">
            {idea.compositeScore !== null ? idea.compositeScore.toFixed(1) : '-'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-[10px] font-normal">
              {idea.businessModel}
            </Badge>
            <Badge className={cn('text-[10px] font-medium border-none shadow-none', priority.color)}>
              {priority.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
