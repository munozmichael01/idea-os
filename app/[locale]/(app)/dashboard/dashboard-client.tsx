'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IdeaCard } from '@/components/ideas/idea-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Idea } from '@/lib/types';

interface DashboardClientProps {
  initialIdeas: Idea[];
}

export function DashboardClient({ initialIdeas }: DashboardClientProps) {
  const t = useTranslations('Ideas');
  const commonT = useTranslations('Common');
  const [rankingMode, setRankingMode] = useState('best_opportunity');

  const sortedIdeas = [...initialIdeas].sort((a, b) => {
    switch (rankingMode) {
      case 'best_opportunity':
        return (b.compositeScore || 0) - (a.compositeScore || 0);
      case 'most_viable':
        return (b.compositeScore || 0) - (a.compositeScore || 0);
      case 'competitive_advantage':
        return (b.compositeScore || 0) - (a.compositeScore || 0);
      case 'value_effort':
        return (b.compositeScore || 0) - (a.compositeScore || 0);
      case 'most_uncertain':
        return (b.volatilityScore || 0) - (a.volatilityScore || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{commonT('dashboard')}</h1>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{t('rankingMode')}:</span>
          <Select value={rankingMode} onValueChange={setRankingMode}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best_opportunity">{t('bestOpportunity')}</SelectItem>
              <SelectItem value="most_viable">{t('mostViable')}</SelectItem>
              <SelectItem value="competitive_advantage">{t('competitiveAdvantage')}</SelectItem>
              <SelectItem value="value_effort">{t('valueEffort')}</SelectItem>
              <SelectItem value="most_uncertain">{t('mostUncertain')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground">Aún no has creado ninguna idea.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
