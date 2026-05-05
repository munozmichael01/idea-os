'use client';

import * as React from 'react';
import { AgentAnalysisCard, ContextAgentCard } from '@/components/ideas/detail/agent-cards';
import { EditableField } from '@/components/ideas/detail/editable-field';
import { HypothesisList } from '@/components/ideas/detail/hypothesis-list';
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
  FileText
} from 'lucide-react';
import { Link } from '@/navigation';
import { toast } from 'sonner';
import { IdeaFull, AgentType, IdeaField, ContextAnswers, Analysis } from '@/lib/types';
import { updateIdea, runAgentForIdea, runAllAgents, runContextAgentForIdea } from '@/lib/actions/ideas';
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
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

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

  const handleListenSummary = async () => {
    const analyses = idea.analyses ?? [];
    if (analyses.length === 0) {
      toast.error('No hay análisis generados todavía.');
      return;
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

  const agentsDone = idea.analyses?.length || 0;
  const totalAgents = 5;

  if (!mounted) return null;

  return (
    <div className="main">
      <audio ref={audioRef} hidden />
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
          <Button variant="secondary" className="h-9 px-4 gap-2 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]" onClick={handleRunAllAgents} disabled={isAnalyzingAll}>
            {isAnalyzingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-[13px] w-[13px]" />}
            Analizar todo
          </Button>
          <Link href="/ideas/new">
            <Button className="h-9 px-4 gap-2 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold">
              <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} />
              Nueva idea
            </Button>
          </Link>
        </div>
      </div>

      <div className="crumbs flex items-center gap-2 text-[12px] text-[var(--text-muted)] mb-8">
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Panel</Link>
        <span className="sep text-[var(--border-strong)]">/</span>
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Ideas</Link>
        <span className="sep text-[var(--border-strong)]">/</span>
        <span className="text-[var(--text-primary)] font-medium">{idea.title}</span>
      </div>

      {/* Header */}
      <div className="detail-header flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex-1">
          <div className="detail-title-row flex items-center gap-4 mb-3 flex-wrap">
            <h1 className="detail-title text-[48px] font-extrabold font-display leading-[0.95] tracking-tight text-[var(--text-primary)]">
              {idea.title}
            </h1>
            <span 
              className="priority-badge h-fit px-3 py-1 rounded-[7px] text-[12px] font-mono font-bold uppercase tracking-wider" 
              style={{ background: scoreBg(idea.compositeScore, 14), color: scoreColor(idea.compositeScore) }}
            >
              <span className="pulse h-1.5 w-1.5 rounded-full bg-current mr-2 inline-block animate-pulse" />
              {scoreLabel(idea.compositeScore)}
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
              {idea.targetMarket || 'Sin mercado'}
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

          <div className="detail-actions flex flex-wrap gap-2.5">
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
              {isSynthesizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
              Escuchar resumen
            </Button>
            <Button variant="secondary" className="h-10 px-5 gap-2.5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] font-medium">
              <FileText className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Score panel */}
        <div className="score-panel flex flex-col items-center gap-6 p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px] lg:w-[320px]">
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

      {/* Two-column body */}
      <div className="detail-grid grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
        <div className="space-y-16">
          <div className="agents-section">
            <h2 className="section-title-lg flex items-center gap-3 text-[18px] font-bold font-display text-[var(--text-primary)] mb-8">
              Análisis por agente
              <span className="sub font-normal text-[13px] text-[var(--text-muted)] font-sans">{agentsDone} / {totalAgents} completos</span>
            </h2>
            <div className="agents-grid grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <HypothesisList hypotheses={idea.hypotheses} />
        </div>

        {/* Side panel */}
        <aside className="side-panel flex flex-col gap-6">
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
                {idea.analyses?.filter(a => a.nextValidationAction).length || 0}
              </span>
            </h3>
            <div className="flex flex-col gap-5">
              {idea.analyses?.filter(a => a.nextValidationAction).slice(0, 4).map((analysis, i) => {
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
              {idea.analyses?.filter(a => !a.nextValidationAction).length === totalAgents && (
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
        </aside>
      </div>
    </div>
  );
}
