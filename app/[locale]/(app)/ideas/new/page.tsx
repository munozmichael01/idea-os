'use client';

import { useState, useEffect } from 'react';
import { NewIdeaForm } from '@/components/ideas/new-idea-form';
import { ContextQuestionsForm } from '@/components/ideas/context-questions-form';
import { toast } from 'sonner';
import { useRouter } from '@/navigation';
import { createIdea, runContextAgentForIdea, answerContextQuestions, runAllAgents } from '@/lib/actions/ideas';
import { getCurrentUser, getDefaultWorkspace } from '@/lib/actions/auth';

export default function NewIdeaPage() {
  const [step, setStep] = useState<'form' | 'questions'>('form');
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ id: string; text: string }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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

  const handleCreateIdea = async (data: { title: string; description: string; sector?: string; targetMarket?: string; businessModel?: string; notes?: string }) => {
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
      
      toast.success('Idea creada. Generando preguntas de contexto...');
      
      const contextOutput = await runContextAgentForIdea(idea.id);
      setQuestions(contextOutput.questions.map(q => ({ id: q.id, text: q.question })));
      setStep('questions');
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error('Error al crear la idea');
    }
  };

  const handleAnswersSubmit = async (answers: Record<string, string>) => {
    if (!ideaId) return;

    try {
      await answerContextQuestions(ideaId, answers);
      toast.success('Respuestas enviadas. Iniciando análisis...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Error al enviar respuestas');
    }
  };

  const handleSkipQuestions = async () => {
    if (!ideaId) return;

    try {
      await runAllAgents(ideaId);
      toast.success('Iniciando análisis...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Error al iniciar análisis');
    }
  };

  return (
    <div className="container py-6">
      {step === 'form' ? (
        <NewIdeaForm onSubmit={handleCreateIdea} />
      ) : (
        <ContextQuestionsForm 
          questions={questions} 
          onSubmit={handleAnswersSubmit} 
          onSkip={handleSkipQuestions} 
        />
      )}
    </div>
  );
}
