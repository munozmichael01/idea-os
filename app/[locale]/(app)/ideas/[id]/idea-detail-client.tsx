'use client';

import * as React from 'react';
import { IdeaScoreRings } from '@/components/ideas/detail/score-rings';
import { AgentAnalysisCard, ContextAgentCard } from '@/components/ideas/detail/agent-cards';
import { EditableField } from '@/components/ideas/detail/editable-field';
import { HypothesisList } from '@/components/ideas/detail/hypothesis-list';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Volume2, 
  Loader2, 
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Play
} from 'lucide-react';
import { Link } from '@/navigation';
import { toast } from 'sonner';
import { IdeaFull, AgentType, IdeaField, ContextAnswers, Analysis } from '@/lib/types';
import { updateIdea, runAgentForIdea, runAllAgents, runContextAgentForIdea } from '@/lib/actions/ideas';

interface IdeaDetailClientProps {
  initialIdea: IdeaFull;
}

export function IdeaDetailClient({ initialIdea }: IdeaDetailClientProps) {
  const [idea, setIdea] = React.useState<IdeaFull>(initialIdea);
  const [isAnalyzingAll, setIsAnalyzingAll] = React.useState(false);
  const [analyzingAgents, setAnalyzingAgents] = React.useState<Set<AgentType>>(new Set());
  const [isSummarizing, setIsSummarizing] = React.useState(false);

  const handleSaveField = async (fieldName: IdeaField, value: string) => {
    try {
      const { idea: updatedIdea, reanalyzedAgents } = await updateIdea(idea.id, { [fieldName]: value });
      setIdea(updatedIdea as IdeaFull);
      if (reanalyzedAgents.length > 0) {
        toast.success(`Campo actualizado. Re-analizando ${reanalyzedAgents.join(', ')}...`);
      } else {
        toast.success('Campo actualizado');
      }
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Error al actualizar el campo');
    }
  };

  const handleRunAgent = async (agentType: AgentType) => {
    setAnalyzingAgents((prev: Set<AgentType>) => new Set(prev).add(agentType));
    try {
      await runAgentForIdea(idea.id, agentType);
      const updatedIdea = await import('@/lib/actions/ideas').then((m: typeof import('@/lib/actions/ideas')) => m.getIdea(idea.id));
      setIdea(updatedIdea);
      toast.success(`Análisis de ${agentType} completado`);
    } catch (error) {
      console.error(`Error running agent ${agentType}:`, error);
      toast.error(`Error al analizar ${agentType}`);
    } finally {
      setAnalyzingAgents((prev: Set<AgentType>) => {
        const next = new Set(prev);
        next.delete(agentType);
        return next;
      });
    }
  };

  const handleRunAllAgents = async () => {
    setIsAnalyzingAll(true);
    try {
      await runAllAgents(idea.id);
      const updatedIdea = await import('@/lib/actions/ideas').then((m: typeof import('@/lib/actions/ideas')) => m.getIdea(idea.id));
      setIdea(updatedIdea);
      toast.success('Análisis completo finalizado');
    } catch (error) {
      console.error('Error running all agents:', error);
      toast.error('Error al ejecutar todos los agentes');
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      await runContextAgentForIdea(idea.id);
      const updatedIdea = await import('@/lib/actions/ideas').then((m: typeof import('@/lib/actions/ideas')) => m.getIdea(idea.id));
      setIdea(updatedIdea);
      toast.success('Resumen de contexto actualizado');
    } catch (error) {
      console.error('Error summarizing context:', error);
      toast.error('Error al generar resumen');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSynthesize = async () => {
    toast.info('La síntesis de voz estará disponible en la Fase 2');
  };

  const analysisAgents: AgentType[] = ['market', 'competition', 'economics', 'gtm', 'founder_fit'];
  const contextAnswers = idea.contextAnswers as ContextAnswers | null;

  return (
    <div className="container max-w-7xl space-y-8 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <Link 
            href="/dashboard" 
            className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{idea.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Creado el {new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>
            <Separator orientation="vertical" className="h-3" />
            <div className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              <span>{idea.creator?.name || 'Usuario'}</span>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase">{idea.status}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleSynthesize}>
            <Volume2 className="mr-2 h-4 w-4" />
            Escuchar Resumen
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" onClick={handleRunAllAgents} disabled={isAnalyzingAll}>
            {isAnalyzingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Analizar Todo
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-1">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Puntuación Global</CardTitle>
            </CardHeader>
            <CardContent>
              <IdeaScoreRings 
                compositeScore={idea.compositeScore}
                confidenceScore={idea.confidenceScore}
                volatilityScore={idea.volatilityScore}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-xl font-bold">Detalles de la Idea</h2>
            <div className="space-y-4 rounded-xl border p-6 bg-card">
              <EditableField 
                label="Título" 
                fieldName="title" 
                value={idea.title} 
                onSave={(v: string) => handleSaveField('title', v)} 
              />
              <EditableField 
                label="Descripción" 
                fieldName="description" 
                value={idea.description} 
                type="textarea"
                onSave={(v: string) => handleSaveField('description', v)} 
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <EditableField 
                  label="Sector" 
                  fieldName="sector" 
                  value={idea.sector || ''} 
                  onSave={(v: string) => handleSaveField('sector', v)} 
                />
                <EditableField 
                  label="Modelo de Negocio" 
                  fieldName="businessModel" 
                  value={idea.businessModel || ''} 
                  onSave={(v: string) => handleSaveField('businessModel', v)} 
                />
              </div>
              <EditableField 
                label="Mercado Objetivo" 
                fieldName="targetMarket" 
                value={idea.targetMarket || ''} 
                onSave={(v: string) => handleSaveField('targetMarket', v)} 
              />
              <EditableField 
                label="Notas Adicionales" 
                fieldName="notes" 
                value={idea.notes || ''} 
                type="textarea"
                onSave={(v: string) => handleSaveField('notes', v)} 
              />
            </div>
          </div>

          <HypothesisList hypotheses={idea.hypotheses} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Análisis de Agentes</h2>
            <div className="text-xs text-muted-foreground">
              {isAnalyzingAll ? 'Ejecutando análisis completo...' : 'Haz clic en re-analizar para refrescar agentes específicos'}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <ContextAgentCard 
              summary={contextAnswers?.summary || 'Haz clic para resumir el contexto inicial.'}
              isAnalyzing={isSummarizing}
              onAnalyze={handleSummarize}
            />
            {analysisAgents.map((agentType) => (
              <AgentAnalysisCard 
                key={agentType}
                agentType={agentType}
                analysis={idea.analyses.find((a: Analysis) => a.agentType === agentType)}
                isAnalyzing={analyzingAgents.has(agentType)}
                onAnalyze={() => handleRunAgent(agentType)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
