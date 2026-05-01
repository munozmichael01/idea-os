'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Play, CheckCircle2, AlertTriangle, TrendingUp, Search, LucideIcon } from 'lucide-react';
import { Analysis, AgentType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AgentAnalysisCardProps {
  agentType: AgentType;
  analysis?: Analysis;
  isAnalyzing?: boolean;
  onAnalyze: () => void;
}

export function AgentAnalysisCard({ agentType, analysis, isAnalyzing, onAnalyze }: AgentAnalysisCardProps) {
  const agentLabels: Record<AgentType, string> = {
    market: 'Market Analysis',
    competition: 'Competition',
    economics: 'Economics',
    gtm: 'Go-To-Market',
    founder_fit: 'Founder Fit',
  };

  const agentIcons: Record<AgentType, LucideIcon> = {
    market: TrendingUp,
    competition: Search,
    economics: TrendingUp, // Placeholder
    gtm: Play, // Placeholder
    founder_fit: CheckCircle2, // Placeholder
  };

  const Icon = agentIcons[agentType] || TrendingUp;

  return (
    <Card className={cn('overflow-hidden border-t-4', {
      'border-t-green-500': (analysis?.score || 0) >= 7.5,
      'border-t-yellow-500': (analysis?.score || 0) >= 6.5 && (analysis?.score || 0) < 7.5,
      'border-t-orange-500': (analysis?.score || 0) >= 5.0 && (analysis?.score || 0) < 6.5,
      'border-t-red-500': (analysis?.score || 0) < 5.0 && analysis,
      'border-t-muted': !analysis,
    })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-bold">{agentLabels[agentType]}</CardTitle>
        </div>
        {analysis && (
          <div className="text-xl font-bold">{analysis.score.toFixed(1)}</div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {analysis ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold leading-tight">{analysis.headline}</p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strengths</p>
                <ul className="space-y-1">
                  {analysis.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Risks</p>
                <ul className="space-y-1">
                  {analysis.risks.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next Action</p>
              <p className="text-xs italic text-primary">{analysis.nextValidationAction}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center space-y-2 text-muted-foreground">
            <p className="text-xs">No analysis yet</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 border-t py-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto h-8 text-xs gap-2" 
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          {analysis ? 'Re-analyze' : 'Analyze'}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ContextAgentCardProps {
  summary?: string;
  isAnalyzing?: boolean;
  onAnalyze: () => void;
}

export function ContextAgentCard({ summary, isAnalyzing, onAnalyze }: ContextAgentCardProps) {
  return (
    <Card className="border-t-4 border-t-indigo-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-500">
            <Search className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-bold">Context Agent</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {summary ? (
          <p className="text-sm line-clamp-4">{summary}</p>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center space-y-2 text-muted-foreground">
            <p className="text-xs">Initial context not yet summarized</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 border-t py-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto h-8 text-xs gap-2" 
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Summarize
        </Button>
      </CardFooter>
    </Card>
  );
}
