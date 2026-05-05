'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, Lightbulb, List, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from '@/navigation';

const ideaSchema = z.object({
  title: z.string().min(5, { message: 'Título demasiado corto (mín. 5)' }),
  description: z.string().min(20, { message: 'Descripción demasiado corta (mín. 20)' }),
  sector: z.string().optional(),
  targetMarket: z.string().optional(),
  businessModel: z.string().optional(),
  notes: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

interface NewIdeaFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    sector?: string | undefined;
    targetMarket?: string | undefined;
    businessModel?: string | undefined;
    notes?: string | undefined;
  }) => Promise<void>;
}

export function NewIdeaForm({ onSubmit }: NewIdeaFormProps) {
  const t = useTranslations('Ideas');
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('free');
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: '',
      description: '',
      sector: 'B2B SaaS',
      targetMarket: '',
      businessModel: 'Subscription',
      notes: '',
    },
  });

  const descriptionValue = watch('description');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('Received audio chunk:', e.data.size);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('Audio blob created, size:', audioBlob.size);
        if (audioBlob.size > 0) {
          await handleTranscribe(audioBlob);
        } else {
          toast.error('No se capturó audio. Intenta de nuevo.');
        }
      };

      mediaRecorder.start(1000); // Send data every second
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      console.log('Starting transcription...');
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      const result = data.transcript;
      console.log('Transcription result received:', result);
      
      if (result) {
        setValue('description', result, { shouldValidate: true });
        setTranscript(result);
        toast.success('Audio transcrito correctamente');
        // Let user see the transcript for a moment before switching
        setTimeout(() => {
          setActiveTab('free');
        }, 1500);
      } else {
        toast.error('No se pudo obtener texto del audio.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      toast.error('Error al transcribir audio: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsTranscribing(false);
    }
  };

  const MODES = [
    { id: 'free', title: 'Texto libre', desc: 'Escribe sin estructura', icon: Lightbulb },
    { id: 'structured', title: 'Estructurado', desc: 'Brief con campos', icon: List },
    { id: 'audio', title: 'Voz', desc: 'Graba 60-90s', icon: Mic },
  ];

  return (
    <div className="wizard-card w-full max-w-[680px] mx-auto p-5 sm:p-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[16px] sm:rounded-[24px]">
      <h2 className="wizard-h1 text-[28px] font-bold font-display tracking-tight text-[var(--text-primary)] mb-2">¿Qué idea quieres validar?</h2>
      <p className="wizard-sub text-[14.5px] text-[var(--text-secondary)] leading-relaxed mb-8">Cuanto más contexto des, mejor el análisis. Empieza por el formato que te resulte natural.</p>

      <div className="mode-tabs grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {MODES.map(mode => {
          const Icon = mode.icon;
          return (
            <button 
              key={mode.id} 
              type="button"
              className={cn(
                "mode-tab flex flex-col items-start gap-1 p-4 rounded-[14px] border transition-all text-left",
                activeTab === mode.id 
                  ? "bg-[var(--bg-elev)] border-[var(--accent-pri)] ring-1 ring-[var(--accent-pri)]" 
                  : "bg-transparent border-[var(--border-subtle)] hover:border-[var(--border-active)]"
              )}
              onClick={() => setActiveTab(mode.id)}
            >
              <span className={cn(
                "mode-title flex items-center gap-2 text-[13.5px] font-bold font-display tracking-tight transition-colors",
                activeTab === mode.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
              )}>
                <Icon className="h-3.5 w-3.5" />
                {mode.title}
              </span>
              <span className="mode-desc text-[11px] text-[var(--text-muted)] font-medium leading-none">{mode.desc}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="field flex flex-col gap-2">
          <label className="field-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Título de la idea</label>
          <input 
            className="input-large w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3.5 text-[15px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] focus:ring-4 focus:ring-[rgba(198,255,61,0.08)] transition-all font-display font-bold" 
            placeholder="Ej. CRM minimalista para microportfolios inmobiliarios" 
            {...register('title')}
          />
          {errors.title && <p className="text-[11px] text-[var(--red)] font-medium mt-1">{errors.title.message}</p>}
        </div>

        {activeTab === 'free' && (
          <div className="field flex flex-col gap-2">
            <label className="field-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Describe tu idea</label>
            <textarea 
              className="textarea-large w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3.5 text-[15px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] focus:ring-4 focus:ring-[rgba(198,255,61,0.08)] transition-all min-h-[200px] resize-none" 
              placeholder="¿Qué problema resuelves? ¿Para quién? ¿Por qué tú? Sin filtros, escribe como pensarías en voz alta." 
              {...register('description')}
            />
            <div className="helper flex justify-between text-[11px] text-[var(--text-muted)] mt-1 font-mono">
              <span>Markdown soportado</span>
              <span>{descriptionValue.length} / 4000</span>
            </div>
            {errors.description && <p className="text-[11px] text-[var(--red)] font-medium">{errors.description.message}</p>}
          </div>
        )}

        {activeTab === 'structured' && (
          <div className="flex flex-col gap-6">
            <div className="field flex flex-col gap-2">
              <label className="field-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Descripción del problema y solución</label>
              <textarea 
                className="textarea-large w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3.5 text-[15px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] focus:ring-4 focus:ring-[rgba(198,255,61,0.08)] transition-all min-h-[100px] resize-none" 
                {...register('description')}
              />
              {errors.description && <p className="text-[11px] text-[var(--red)] font-medium">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field flex flex-col gap-2">
                <label className="field-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Sector</label>
                <select 
                  className="field-select w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] transition-all"
                  {...register('sector')}
                >
                  <option value="Real Estate">Real Estate</option>
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="PropTech">PropTech</option>
                  <option value="Creator economy">Creator economy</option>
                </select>
              </div>
              <div className="field flex flex-col gap-2">
                <label className="field-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Modelo de negocio</label>
                <select 
                  className="field-select w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] transition-all"
                  {...register('businessModel')}
                >
                  <option value="Subscription">Subscription</option>
                  <option value="Marketplace · SaaS">Marketplace · SaaS</option>
                  <option value="Comisión">Comisión</option>
                  <option value="Freemium">Freemium</option>
                </select>
              </div>
            </div>
            <div className="field flex flex-col gap-2">
              <label className="field-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Mercado objetivo</label>
              <input 
                className="input-large w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] transition-all" 
                placeholder="Ej. ES · LatAm" 
                {...register('targetMarket')}
              />
            </div>
            <div className="field flex flex-col gap-2">
              <label className="field-label font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Notas del fundador (opcional)</label>
              <textarea 
                className="textarea-large w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] transition-all min-h-[80px] resize-none" 
                placeholder="Ventajas únicas, red, contexto que un agente no podría inferir." 
                {...register('notes')}
              />
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="audio-zone flex flex-col items-center gap-6 py-8 border-2 border-dashed border-[var(--border-subtle)] rounded-[16px] bg-[var(--bg-elev)]/30">
            <button 
              type="button"
              className={cn(
                "mic-button h-20 w-20 rounded-full flex items-center justify-center transition-all",
                isRecording ? "bg-[var(--red)] animate-pulse" : "bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-active)]"
              )}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
            >
              {isRecording ? <Square className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-[var(--text-secondary)]" />}
            </button>
            {isRecording ? (
              <div className="text-center">
                <div className="audio-meter flex items-center gap-0.5 h-4 mb-2">
                  {Array.from({length: 12}).map((_, i) => (
                    <span key={i} className="w-1 bg-[var(--red)] rounded-full animate-bounce" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <div className="font-mono text-[12px] text-[var(--red)] uppercase tracking-[0.1em]">● Grabando...</div>
              </div>
            ) : (
              <p className="text-[13.5px] text-[var(--text-secondary)] max-w-[360px] text-center">Pulsa para grabar. Ideal: 60-90 segundos describiendo problema, audiencia y por qué tú.</p>
            )}
            
            <div className="transcript w-full max-w-[480px] p-4 bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] min-h-[60px] text-[13px] italic">
              {isTranscribing ? (
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Transcribiendo audio...
                </div>
              ) : (
                transcript || <span className="text-[var(--text-muted)]">El transcript aparecerá aquí en tiempo real…</span>
              )}
            </div>
          </div>
        )}

        <div className="wizard-actions flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="ghost" className="order-2 sm:order-1 text-[14px] text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => router.push('/dashboard')}>
            Cancelar
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
            <Button type="button" variant="secondary" className="w-full sm:w-auto h-10 px-5 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
              Guardar borrador
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-10 px-6 gap-2 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold text-[14px]"
              disabled={isSubmitting || isRecording || isTranscribing}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continuar
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
