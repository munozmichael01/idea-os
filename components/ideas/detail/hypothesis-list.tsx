'use client';

import { Hypothesis } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface HypothesisListProps {
  hypotheses: Hypothesis[];
}

export function HypothesisList({ hypotheses }: HypothesisListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'invalidated':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'high':
        return <Badge variant="destructive" className="text-[10px] py-0">Critical</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-[10px] py-0">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] py-0">Low</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Hypotheses & Assumptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hypotheses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No hypotheses generated yet.</p>
          ) : (
            hypotheses.map((h) => (
              <div key={h.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="mt-0.5 shrink-0">
                  {getStatusIcon(h.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{h.description}</p>
                    {getCriticalityBadge(h.criticality)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter opacity-70">
                      {h.agentType}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground italic">
                      Status: {h.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
