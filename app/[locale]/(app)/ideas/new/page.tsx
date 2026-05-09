'use client';

import * as React from 'react';
import { NewIdeaForm } from '@/components/ideas/new-idea-form';
import { ContextQuestionsForm } from '@/components/ideas/context-questions-form';
import { AnalysisProgress } from '@/components/ideas/analysis-progress';
import { toast } from 'sonner';
import { useRouter } from '@/navigation';
import { createIdea, runContextAgentForIdea, answerContextQuestions, runAllAgents } from '@/lib/actions/ideas';
import { getCurrentUser, getDefaultWorkspace } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';
import { Check, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';

const STEPS = [
  { id: 'input', label: 'Capturar' },
  { id: 'context', label: 'Contexto' },
  { id: 'analyze', label: 'Análisis' },
];

const StepBar = ({ current }: { current: number }) => (
  <div className="steps flex items-center justify-center gap-4 mb-12">
    {STEPS.map((s, i) => {
      const state = i < current ? 'done' : i === current ? 'active' : 'idle';
      return (
        <React.Fragment key={s.id}>
          <div className={cn(
            "step flex items-center gap-3 transition-all",
            state === 'active' ? "opacity-100 scale-105" : state === 'done' ? "opacity-100" : "opacity-40 grayscale"
          )}>
            <div className={cn(
              "num h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-mono font-bold border-2 transition-all",
              state === 'done' ? "bg-[var(--green)] border-[var(--green)] text-white" : 
              state === 'active' ? "bg-[var(--accent-pri)] border-[var(--accent-pri)] text-[var(--accent-pri-ink)]" : 
              "bg-transparent border-[var(--border-strong)] text-[var(--text-muted)]"
            )}>
              {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </div>
            <span className={cn(
              "font-display font-bold text-[14px] tracking-tight",
              state === 'active' ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
            )}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "step-line w-12 h-0.5 rounded-full transition-all",
              i < current ? "bg-[var(--green)]" : "bg-[var(--border-subtle)]"
            )} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default function NewIdeaPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [ideaId, setIdeaId] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<{ id: string; text: string }[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null);
  const [ideaMeta, setIdeaMeta] = React.useState<{ title?: string; sector?: string; targetMarket?: string }>({});
  const router = useRouter();

  React.useEffect(() => {
    async function loadAuth() {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        const workspace = await getDefaultWorkspace(user.id);
        if (workspace) {
          setWorkspaceId(workspace.id);
        }
      }
    }
    loadAuth();
  }, []);

  const handleCreateIdea = async (data: { 
    title: string; 
    description: string; 
    sector?: string | undefined; 
    targetMarket?: string | undefined; 
    businessModel?: string | undefined; 
    notes?: string | undefined;
  }) => {
    if (!userId || !workspaceId) {
      toast.error('Sesión no encontrada. Por favor, recarga la página.');
      return;
    }

    try {
      const idea = await createIdea(userId, {
        ...data,
        workspaceId,
      });
      setIdeaId(idea.id);
      setIdeaMeta({ title: data.title, sector: data.sector, targetMarket: data.targetMarket });
      
      const contextOutput = await runContextAgentForIdea(idea.id);
      setQuestions(contextOutput.questions.map(q => ({ id: q.id, text: q.question })));
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error('Error al crear la idea');
    }
  };

  const handleAnswersSubmit = async (answers: Record<string, string>) => {
    if (!ideaId) return;

    try {
      setCurrentStep(2);
      await answerContextQuestions(ideaId, answers);
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Error al enviar respuestas');
    }
  };

  const handleSkipQuestions = async () => {
    if (!ideaId) return;

    try {
      setCurrentStep(2);
      await runAllAgents(ideaId);
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Error al iniciar análisis');
    }
  };

  return (
    <div className="main min-h-svh">
      {/* Topbar */}
      <div className="topbar">
        <div className="search">
          <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input placeholder="Buscar ideas, sectores, hipótesis…" />
          <span className="kbd">⌘K</span>
        </div>
        <div className="topbar-actions flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Bell className="h-[15px] w-[15px]" />
          </Button>
        </div>
      </div>

      <div className="crumbs flex items-center gap-2 text-[12px] text-[var(--text-muted)] mb-12">
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Panel</Link>
        <span className="sep text-[var(--border-strong)]">/</span>
        <span className="text-[var(--text-primary)] font-medium">Nueva idea</span>
      </div>

      <div className="wizard max-w-4xl mx-auto px-4 sm:px-6">
        <StepBar current={currentStep} />
        
        {currentStep === 0 && (
          <NewIdeaForm onSubmit={handleCreateIdea} />
        )}
        
        {currentStep === 1 && (
          <ContextQuestionsForm 
            questions={questions} 
            onSubmit={handleAnswersSubmit} 
            onSkip={handleSkipQuestions} 
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && ideaId && (
          <AnalysisProgress
            ideaId={ideaId}
            ideaTitle={ideaMeta.title}
            ideaSector={ideaMeta.sector}
            ideaTargetMarket={ideaMeta.targetMarket}
            onViewResults={() => router.push(`/ideas/${ideaId}`)}
          />
        )}
      </div>
    </div>
  );
}
