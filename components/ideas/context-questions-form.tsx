'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentType } from '@/lib/types';

interface Question {
  id: string;
  text: string;
  agentType?: AgentType;
}

interface ContextQuestionsFormProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onSkip: () => Promise<void>;
  onBack: () => void;
}

const AGENT_SHORT: Record<string, string> = {
  market: 'MKT',
  competition: 'COMP',
  economics: 'ECON',
  gtm: 'GTM',
  founder_fit: 'FIT',
};

const AGENT_COLORS: Record<string, string> = {
  market: 'var(--accent-pri)',
  competition: 'var(--orange)',
  economics: 'var(--yellow)',
  gtm: 'var(--purple)',
  founder_fit: 'var(--blue)',
};

export function ContextQuestionsForm({ questions, onSubmit, onSkip, onBack }: ContextQuestionsFormProps) {
  const t = useTranslations('Ideas');
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSkipping, setIsSkipping] = React.useState(false);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await onSkip();
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="wizard-card w-full max-w-[680px] mx-auto p-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px]">
      <h2 className="wizard-h1 text-[28px] font-bold font-display tracking-tight text-[var(--text-primary)] mb-2">Antes de analizar tu idea…</h2>
      <p className="wizard-sub text-[14.5px] text-[var(--text-secondary)] leading-relaxed mb-8">5 preguntas del agente de contexto. Las respuestas son opcionales pero suben la calidad del análisis ~40%.</p>

      <div className="context-banner flex items-center gap-4 p-4 bg-[rgba(198,255,61,0.08)] border border-[rgba(198,255,61,0.2)] rounded-[14px] mb-10">
        <div className="context-banner-icon h-10 w-10 rounded-[10px] bg-[var(--bg-card)] flex items-center justify-center text-[var(--green)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[13.5px] font-medium text-[var(--text-primary)]">Las respuestas mejoran la calidad del análisis.</p>
          <p className="text-[11px] text-[var(--text-muted)]">Generadas por el agente de contexto en tiempo real</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 mb-12">
        {questions.map((item, i) => {
          const agentType = item.agentType || (['market', 'competition', 'economics', 'gtm', 'founder_fit'][i % 5] as AgentType);
          const color = AGENT_COLORS[agentType];
          
          return (
            <div key={item.id} className="question flex flex-col gap-3" style={{ '--accent': color } as React.CSSProperties}>
              <div className="q-head flex items-center gap-3">
                <span className="q-num h-6 w-6 rounded-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-mono font-bold text-[var(--text-muted)]">
                  {i + 1}
                </span>
                <span className="q-text text-[14.5px] font-bold text-[var(--text-primary)] flex-1">{item.text}</span>
                <span className="q-agent font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] px-2 py-0.5 rounded-[4px] bg-[var(--bg-elev)]">
                  {AGENT_SHORT[agentType]}
                </span>
              </div>
              <input 
                className="input-large w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(198,255,61,0.04)] transition-all" 
                placeholder="Tu respuesta (opcional)…"
                value={answers[item.id] || ''}
                onChange={(e) => handleAnswerChange(item.id, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="wizard-actions flex items-center justify-between pt-8 border-t border-[var(--border-subtle)]">
        <Button variant="ghost" className="h-10 gap-2 text-[var(--text-muted)]" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="h-10 px-5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
            onClick={handleSkip}
            disabled={isSubmitting || isSkipping}
          >
            {isSkipping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Saltar y analizar
          </Button>
          <Button 
            className="h-10 px-6 gap-2 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold"
            onClick={handleSubmit}
            disabled={isSubmitting || isSkipping}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Responder y analizar
          </Button>
        </div>
      </div>
    </div>
  );
}
