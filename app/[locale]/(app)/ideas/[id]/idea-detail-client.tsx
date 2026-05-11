'use client';

import * as React from 'react';
import { AgentAnalysisCard, ContextAgentCard } from '@/components/ideas/detail/agent-cards';
import { EditableField } from '@/components/ideas/detail/editable-field';
import { HypothesisList } from '@/components/ideas/detail/hypothesis-list';
import { AnalysisProgress } from '@/components/ideas/analysis-progress';
import { ContextQuestionsForm } from '@/components/ideas/context-questions-form';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Volume2, 
  Loader2, 
  Sparkles,
  Search,
  Bell,
  Plus,
  ArrowRight,
  FileText,
  Square
} from 'lucide-react';
import { Link } from '@/navigation';
import { toast } from 'sonner';
import { IdeaFull, AgentType, IdeaField, ContextAnswers, Analysis } from '@/lib/types';
import { updateIdea, runAgentForIdea, runAllAgents, runContextAgentForIdea, runSynthesisAgentForIdea } from '@/lib/actions/ideas';
import { ScoreRing, scoreColor, scoreLabel, scoreBg } from '@/components/ui/score-ring';
import { cn } from '@/lib/utils';

interface IdeaDetailClientProps {
  initialIdea: IdeaFull;
}

export function IdeaDetailClient({ initialIdea }: IdeaDetailClientProps) {
  const [mounted, setMounted] = React.useState(false);
  const [idea, setIdea] = React.useState<IdeaFull>(initialIdea);
  const [isAnalyzingAll, setIsAnalyzingAll] = React.useState(false);
  const [analyzingAgents, setAnalyzingAgents] = React.useState<Set<AgentType>>(new Set());
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isSynthesizing, setIsSynthesizing] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [pendingDiscard, setPendingDiscard] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isLg, setIsLg] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsLg(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [isContextMode, setIsContextMode] = React.useState(false);
  const [contextQuestions, setContextQuestions] = React.useState<{id: string, text: string}[]>([]);
  const [isGeneratingContext, setIsGeneratingContext] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleRunAllAgents = () => {
    setIsAnalyzingAll(true);
    runAllAgents(idea.id).catch((error) => {
      console.error('Error running all agents:', error);
      toast.error('Error al ejecutar todos los agentes');
      setIsAnalyzingAll(false);
    });
  };

  const handleGenerateContext = async () => {
    setIsGeneratingContext(true);
    try {
      const out = await runContextAgentForIdea(idea.id);
      setContextQuestions(out.questions.map(q => ({ id: q.id, text: q.question })));
      setIsContextMode(true);
    } catch (error) {
      console.error('Error generating context:', error);
      toast.error('Error al generar preguntas de contexto');
    } finally {
      setIsGeneratingContext(false);
    }
  };

  const handleAnswersSubmit = async (answers: Record<string, string>) => {
    setIsContextMode(false);
    setIsAnalyzingAll(true);
    toast.info('Contexto guardado — re-lanzando análisis completo…');

    import('@/lib/actions/ideas')
      .then(m => m.answerContextQuestions(idea.id, answers))
      .catch((error) => {
        console.error('Error submitting context:', error);
        toast.error('Error al enviar respuestas');
        setIsAnalyzingAll(false);
      });
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      await runSynthesisAgentForIdea(idea.id);
      const updatedIdea = await import('@/lib/actions/ideas').then((m: typeof import('@/lib/actions/ideas')) => m.getIdea(idea.id));
      setIdea(updatedIdea);
      toast.success('Resumen ejecutivo generado');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Error al generar el resumen');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleListenSummary = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const analyses = idea.analyses ?? [];
    if (analyses.length === 0) {
      toast.error('No hay análisis generados todavía.');
      return;
    }

    // Workaround para iOS/Safari: desbloquear el elemento de audio sincrónicamente
    if (audioRef.current) {
      // Un src vacío o un play vacío en el call stack del onClick desbloquea el elemento
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.catch(() => {}); // ignoramos el error de que no hay src todavía
      }
    }

    setIsSynthesizing(true);
    try {
      const agentNames: Record<AgentType, string> = {
        market: 'Mercado',
        competition: 'Competencia',
        economics: 'Economía unitaria',
        gtm: 'Go-to-market',
        founder_fit: 'Fit con el fundador',
      };
      
      const parts = analyses.map((a: Analysis) => {
        const name = agentNames[a.agentType as AgentType] ?? a.agentType;
        const strengths = a.strengths?.slice(0, 2).join('. ') ?? '';
        const risks = a.risks?.slice(0, 1).join('. ') ?? '';
        return `${name}: puntuación ${a.score.toFixed(1)}. ${a.headline}. Fortalezas: ${strengths}. Riesgo principal: ${risks}.`;
      });
      
      const textToSpeak = `Análisis de ${idea.title}. ${parts.join(' ')}`;

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/audio/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, idea_id: idea.id }),
      });

      if (!response.ok) {
        throw new Error('Error al sintetizar audio');
      }

      const { audio_url } = await response.json();
      
      if (audioRef.current) {
        audioRef.current.src = audio_url;
        audioRef.current.play();
        toast.info('Reproduciendo análisis...');
      }
    } catch (error) {
      console.error('Error in handleListenSummary:', error);
      toast.error('Error al generar el audio del resumen');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const analysisAgents: AgentType[] = ['market', 'competition', 'economics', 'gtm', 'founder_fit'];
  const contextAnswers = idea.contextAnswers as ContextAnswers | null;

  // Deduplicate by agentType — analyses are ordered desc so first match = latest
  const latestAnalysesByAgent = analysisAgents.reduce<Analysis[]>((acc, agentType) => {
    const a = idea.analyses.find((x: Analysis) => x.agentType === agentType);
    if (a) acc.push(a);
    return acc;
  }, []);
  const agentsDone = new Set(idea.analyses?.map((a: Analysis) => a.agentType) ?? []).size;
  const totalAgents = 5;

  if (!mounted) return null;

  if (isAnalyzingAll) {
    return (
      <div className="main min-h-svh flex items-center justify-center p-4">
        <AnalysisProgress
          ideaId={idea.id}
          ideaTitle={idea.title}
          ideaSector={idea.sector ?? undefined}
          ideaTargetMarket={idea.targetMarket ?? undefined}
          onViewResults={async () => {
            setIsAnalyzingAll(false);
            const updatedIdea = await import('@/lib/actions/ideas').then((m) => m.getIdea(idea.id));
            setIdea(updatedIdea);
            toast.success('Análisis completo finalizado');
          }}
          onBack={() => setIsAnalyzingAll(false)}
        />
      </div>
    );
  }

  return (
    <div className="main">
      <audio 
        ref={audioRef} 
        hidden 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      {/* Topbar */}
      <div className="topbar">
        <div className="search">
          <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input placeholder="Buscar ideas, sectores, hipótesis…" />
          <span className="kbd">⌘K</span>
        </div>
        <div className="topbar-actions flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-11 w-11 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Bell className="h-[15px] w-[15px]" />
          </Button>
          <Button variant="secondary" className="flex h-9 px-3 sm:px-4 gap-2 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]" onClick={handleRunAllAgents} disabled={isAnalyzingAll}>
            {isAnalyzingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-[13px] w-[13px]" />}
            <span className="sm:hidden">Analizar</span>
            <span className="hidden sm:inline">Analizar todo</span>
          </Button>
          <Link href="/ideas/new">
            <Button className="h-9 px-3 sm:px-4 gap-2 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold">
              <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} />
              <span className="sm:hidden">Nueva</span>
              <span className="hidden sm:inline">Nueva idea</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="crumbs flex items-center gap-2 text-[12px] text-[var(--text-muted)] mb-8 min-w-0">
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors shrink-0">Panel</Link>
        <span className="sep text-[var(--border-strong)] shrink-0">/</span>
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors shrink-0 hidden sm:inline">Ideas</Link>
        <span className="sep text-[var(--border-strong)] shrink-0 hidden sm:inline">/</span>
        <span className="text-[var(--text-primary)] font-medium truncate">{idea.title}</span>
      </div>

      {/* Header */}
      <div className="detail-header flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex-1">
          <div className="detail-title-row flex items-center gap-4 mb-3 flex-wrap">
            <h1 className="detail-title font-extrabold font-display leading-[0.95] tracking-tight text-[var(--text-primary)]" style={{ fontSize: 'clamp(22px, 5vw, 48px)' }}>
              {idea.title}
            </h1>
            <span
              className="priority-badge"
              style={{ color: scoreColor(idea.compositeScore), border: '1px solid currentColor', background: `color-mix(in srgb, ${scoreColor(idea.compositeScore)} 10%, transparent)` }}
            >
              <span className="pulse" />
              {scoreLabel(idea.compositeScore)}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border",
              idea.status === 'ANALYZING'    && "border-[var(--accent-pri)] text-[var(--accent-pri)] bg-[color-mix(in_srgb,var(--accent-pri)_10%,transparent)]",
              idea.status === 'IMPLEMENTING' && "border-[var(--green)] text-[var(--green)] bg-[color-mix(in_srgb,var(--green)_10%,transparent)]",
              idea.status === 'DISCARDED'    && "border-[var(--text-muted)] text-[var(--text-muted)] bg-[color-mix(in_srgb,var(--text-muted)_10%,transparent)]",
            )}>
              <span className="h-1.5 w-1.5 rounded-full" style={{
                background: idea.status === 'ANALYZING' ? 'var(--accent-pri)' : idea.status === 'IMPLEMENTING' ? 'var(--green)' : 'var(--text-muted)'
              }} />
              {idea.status === 'ANALYZING' ? 'Analizando' : idea.status === 'IMPLEMENTING' ? 'Implementando' : 'Descartada'}
            </span>
          </div>

          <div className="detail-tags flex flex-wrap items-center gap-1.5 mb-5">
            <span className="tag flex items-center gap-2 px-2.5 py-1 rounded-[7px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11.5px] font-medium text-[var(--text-secondary)]">
              <span className="tag-dot h-1.5 w-1.5 rounded-full bg-[var(--purple)]" />
              {idea.sector || 'Sin sector'}
            </span>
            <span className="tag flex items-center gap-2 px-2.5 py-1 rounded-[7px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11.5px] font-medium text-[var(--text-secondary)]">
              <span className="tag-dot h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />
              {idea.businessModel || 'Sin modelo'}
            </span>
            <span className="tag flex items-center gap-2 px-2.5 py-1 rounded-[7px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11.5px] font-medium text-[var(--text-secondary)]">
              <span className="tag-dot h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              {idea.targetMarket || 'Mercado no especificado'}
            </span>
            <span className="tag flex items-center gap-2 px-2.5 py-1 rounded-[7px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11.5px] font-medium text-[var(--text-muted)]">
              v{idea.analyses?.length || 0} · {agentsDone}/{totalAgents} agentes
            </span>
          </div>

          <div className="detail-meta flex flex-wrap gap-4 text-[12px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-8">
            <span className="detail-meta-item">📅 Creado {new Date(idea.createdAt).toLocaleDateString()}</span>
            <span className="detail-meta-item">🔄 Re-analizado hace unos momentos</span>
            <span className="detail-meta-item">👤 {idea.creator?.name || 'Usuario'}</span>
          </div>

          <div className="detail-actions flex flex-col sm:flex-row flex-wrap gap-2.5">
            <Button className="h-10 px-5 gap-2.5 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold text-[13.5px]" onClick={handleRunAllAgents} disabled={isAnalyzingAll}>
              {isAnalyzingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analizar todo
            </Button>
            <Button 
              variant="secondary" 
              className="h-10 px-5 gap-2.5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] font-medium"
              onClick={handleListenSummary}
              disabled={isSynthesizing}
            >
              {isSynthesizing ? <Loader2 className="h-4 w-4 animate-spin" /> : (isPlaying ? <Square className="h-4 w-4 text-[var(--red)]" /> : <Volume2 className="h-4 w-4" />)}
              {isPlaying ? 'Detener resumen' : 'Escuchar resumen'}
            </Button>
            <Button variant="secondary" className="h-10 px-5 gap-2.5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] font-medium">
              <FileText className="h-4 w-4" />
              Exportar
            </Button>
            {idea.status !== 'IMPLEMENTING' && (
              <Button 
                variant="secondary" 
                className="h-10 px-5 gap-2.5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--green)] hover:border-[var(--green)] hover:text-[var(--green)] font-medium"
                onClick={async () => {
                  try {
                    await import('@/lib/actions/ideas').then(m => m.updateIdea(idea.id, { status: 'IMPLEMENTING' }));
                    const updatedIdea = await import('@/lib/actions/ideas').then(m => m.getIdea(idea.id));
                    setIdea(updatedIdea);
                    toast.success('Movida a Implementando');
                  } catch (e) { toast.error('Error al actualizar estado'); }
                }}
              >
                Apostar por la idea
              </Button>
            )}
            {idea.status !== 'DISCARDED' && !pendingDiscard && (
              <Button
                variant="secondary"
                className="h-10 px-5 gap-2.5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--red)] hover:text-[var(--red)] font-medium"
                onClick={() => setPendingDiscard(true)}
              >
                Descartar
              </Button>
            )}
            {pendingDiscard && (
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-[var(--red)] bg-[color-mix(in_srgb,var(--red)_8%,transparent)]">
                <span className="text-[12.5px] text-[var(--red)] font-medium w-full sm:w-auto">¿Descartar esta idea?</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-11 sm:h-7 px-4 sm:px-3 text-[12px] text-[var(--red)] hover:bg-[color-mix(in_srgb,var(--red)_15%,transparent)] font-bold flex-1 sm:flex-none"
                  onClick={async () => {
                    try {
                      await import('@/lib/actions/ideas').then(m => m.updateIdea(idea.id, { status: 'DISCARDED' }));
                      const updatedIdea = await import('@/lib/actions/ideas').then(m => m.getIdea(idea.id));
                      setIdea(updatedIdea);
                      setPendingDiscard(false);
                      toast.success('Idea descartada');
                    } catch (e) { toast.error('Error al actualizar estado'); }
                  }}
                >Confirmar</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-11 sm:h-7 px-4 sm:px-3 text-[12px] text-[var(--text-muted)] font-medium flex-1 sm:flex-none"
                  onClick={() => setPendingDiscard(false)}
                >Cancelar</Button>
              </div>
            )}
            {idea.status !== 'ANALYZING' && (
              <Button 
                variant="ghost" 
                className="h-10 px-5 gap-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"
                onClick={async () => {
                  try {
                    await import('@/lib/actions/ideas').then(m => m.updateIdea(idea.id, { status: 'ANALYZING' }));
                    const updatedIdea = await import('@/lib/actions/ideas').then(m => m.getIdea(idea.id));
                    setIdea(updatedIdea);
                    toast.success('Movida a Analizando');
                  } catch (e) { toast.error('Error al actualizar estado'); }
                }}
              >
                Volver a Analizando
              </Button>
            )}
          </div>
        </div>

        {/* Score panel */}
        <div
          className="score-panel flex flex-col items-center gap-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]"
          style={isLg
            ? { width: '320px', padding: '2rem', borderRadius: '24px' }
            : { width: '100%', maxWidth: '100%', padding: '1.5rem', borderRadius: '20px' }
          }
        >
          <ScoreRing value={idea.compositeScore} size={110} stroke={8} />
          <div className="score-panel-meta w-full">
            <div className="score-meta-label text-center text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Score compuesto</div>
            <div className="kpi-row space-y-3">
              <div className="flex flex-col gap-1.5">
                <div className="kpi-head flex justify-between items-center text-[12px] font-medium">
                  <span className="name text-[var(--text-secondary)]">Confianza</span>
                  <span className="val font-mono text-[var(--text-primary)] tracking-tighter">{((idea.confidenceScore || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="bar h-1 w-full bg-[var(--bg-elev)] rounded-full overflow-hidden">
                  <div className="bar-fill h-full bg-[var(--green)] transition-all" style={{ width: `${(idea.confidenceScore || 0) * 100}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="kpi-head flex justify-between items-center text-[12px] font-medium">
                  <span className="name text-[var(--text-secondary)]">Volatilidad</span>
                  <span className="val font-mono text-[var(--text-primary)] tracking-tighter">{((idea.volatilityScore || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="bar h-1 w-full bg-[var(--bg-elev)] rounded-full overflow-hidden">
                  <div className="bar-fill h-full bg-[var(--orange)] transition-all" style={{ width: `${(idea.volatilityScore || 0) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Banner */}
      {!isContextMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 mb-8 bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-xl">
          <div>
            {contextAnswers && Object.keys(contextAnswers).length > 0 ? (
              <>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Contexto del fundador completado</h3>
                <p className="text-xs text-[var(--text-secondary)]">Puedes actualizar tus respuestas y re-lanzar el análisis completo.</p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Falta contexto adicional</h3>
                <p className="text-xs text-[var(--text-secondary)]">El análisis de Economics y Founder Fit requiere más información para ser preciso.</p>
              </>
            )}
          </div>
          <Button onClick={handleGenerateContext} disabled={isGeneratingContext} className="bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold px-5 shrink-0">
            {isGeneratingContext ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {contextAnswers && Object.keys(contextAnswers).length > 0 ? 'Editar contexto' : 'Completar contexto'}
          </Button>
        </div>
      )}

      {isContextMode && (
        <div className="mb-10">
           <ContextQuestionsForm 
             questions={contextQuestions} 
             onSubmit={handleAnswersSubmit}
             onSkip={async () => setIsContextMode(false)}
             onBack={() => setIsContextMode(false)}
           />
        </div>
      )}

      {/* Two-column body */}
      <div
        className="detail-grid gap-12 overflow-x-hidden"
        style={isLg
          ? { display: 'grid', gridTemplateColumns: '1fr 340px' }
          : { display: 'grid', gridTemplateColumns: '1fr' }
        }
      >
        <div className="space-y-16">
          <div className="agents-section">
            <h2 className="section-title-lg flex items-center gap-3 text-[18px] font-bold font-display text-[var(--text-primary)] mb-8">
              Análisis por agente
              <span className="sub font-normal text-[13px] text-[var(--text-muted)] font-sans">{agentsDone} / {totalAgents} completos</span>
            </h2>
            <div className="agents-grid grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0 overflow-hidden">
              <ContextAgentCard
                summary={
                  idea.executiveSummary ??
                  (contextAnswers && Object.keys(contextAnswers).length > 0
                    ? Object.values(contextAnswers as Record<string, string>).join('\n\n')
                    : undefined)
                }
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

          <HypothesisList hypotheses={idea.hypotheses} />
        </div>

        {/* Side panel — collapsible on mobile */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Mobile toggle — only visible below lg */}
          {!isLg && (
            <button
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}
              onClick={() => setSidebarOpen(o => !o)}
            >
              <span>Brief · Acciones · Scores</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 'normal' }}>{sidebarOpen ? 'Ocultar ↑' : 'Mostrar ↓'}</span>
            </button>
          )}
          <div style={{ display: isLg || sidebarOpen ? 'flex' : 'none', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="side-card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[18px]">
            <h3 className="text-[14px] font-bold font-display flex items-center gap-2 mb-6">
              Brief editable 
              <span className="pill px-2 py-0.5 rounded-[5px] bg-[rgba(198,255,61,0.08)] text-[9px] font-mono text-[var(--green)] uppercase tracking-wider">auto-save</span>
            </h3>
            <div className="space-y-6">
              <EditableField 
                label="Descripción" 
                fieldName="description" 
                value={idea.description} 
                type="textarea"
                onSave={(v: string) => handleSaveField('description', v)} 
              />
              <EditableField 
                label="Sector" 
                fieldName="sector" 
                value={idea.sector || ''} 
                onSave={(v: string) => handleSaveField('sector', v)} 
              />
              <EditableField 
                label="Mercado objetivo" 
                fieldName="targetMarket" 
                value={idea.targetMarket || ''} 
                onSave={(v: string) => handleSaveField('targetMarket', v)} 
              />
              <EditableField 
                label="Modelo de negocio" 
                fieldName="businessModel" 
                value={idea.businessModel || ''} 
                onSave={(v: string) => handleSaveField('businessModel', v)} 
              />
              <EditableField 
                label="Notas del fundador" 
                fieldName="notes" 
                value={idea.notes || ''} 
                type="textarea"
                onSave={(v: string) => handleSaveField('notes', v)} 
              />
              <Button 
                className="w-full h-10 gap-2 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold mt-2"
                onClick={handleRunAllAgents}
                disabled={isAnalyzingAll}
              >
                {isAnalyzingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Guardar y re-analizar
              </Button>
            </div>
          </div>

          <div className="side-card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[18px]">
            <h3 className="text-[14px] font-bold font-display flex items-center justify-between mb-6">
              Próximas acciones 
              <span className="pill px-2 py-0.5 rounded-[5px] bg-[var(--bg-elev)] border border-[var(--border-subtle)] text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                {latestAnalysesByAgent.filter(a => a.nextValidationAction).length || 0}
              </span>
            </h3>
            <div className="flex flex-col gap-5">
              {latestAnalysesByAgent.filter(a => a.nextValidationAction).slice(0, 4).map((analysis) => {
                const color = scoreColor(analysis.score);
                return (
                  <div key={analysis.id} className="flex gap-3 items-start">
                    <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                    <div className="flex-1">
                      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] mb-1" style={{ color }}>{analysis.agentType}</div>
                      <div className="text-[12.5px] leading-relaxed text-[var(--text-primary)]">{analysis.nextValidationAction}</div>
                    </div>
                  </div>
                );
              })}
              {latestAnalysesByAgent.every(a => !a.nextValidationAction) && latestAnalysesByAgent.length === totalAgents && (
                <p className="text-[12.5px] text-[var(--text-muted)] italic">No hay acciones pendientes.</p>
              )}
            </div>
          </div>

          <div className="side-card p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[18px]">
            <h3 className="text-[14px] font-bold font-display mb-6">Score por agente</h3>
            <div className="flex flex-col gap-5">
              {analysisAgents.map((agentType) => {
                const analysis = idea.analyses.find(a => a.agentType === agentType);
                const color = scoreColor(analysis?.score || null);
                return (
                  <div key={agentType}>
                    <div className="flex justify-between items-center text-[12px] mb-2">
                      <span className="text-[var(--text-secondary)] capitalize">{agentType.replace('_', ' ')}</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">{analysis?.score.toFixed(1) || '-'}</span>
                    </div>
                    <div className="bar h-1 w-full bg-[var(--bg-elev)] rounded-full overflow-hidden">
                      <div className="bar-fill h-full transition-all" style={{ width: `${(analysis?.score || 0) * 10}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>{/* end collapsible wrapper */}
        </aside>
      </div>
    </div>
  );
}
