'use client';

import * as React from 'react';
import { X, Send, Paperclip, MessageSquare, Loader2, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Message, ContextPatch, AgentType } from '@/lib/types';
import { applyContextPatch } from '@/lib/actions/ideas';
import { toast } from 'sonner';

interface IdeaChatPanelProps {
  ideaId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage extends Partial<Message> {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: any;
  isStreaming?: boolean;
}

export function IdeaChatPanel({ ideaId, isOpen, onClose }: IdeaChatPanelProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isSending, setIsSubmitting] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);
  const [activePatch, setActivePatch] = React.useState<ContextPatch | null>(null);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load history
  React.useEffect(() => {
    if (isOpen) {
      fetch(`/api/ideas/${ideaId}/chat`)
        .then(res => res.json())
        .then(data => {
          setMessages(data);
          setIsLoadingHistory(false);
        })
        .catch(err => {
          console.error('Error loading chat history:', err);
          setIsLoadingHistory(false);
        });
    }
  }, [ideaId, isOpen]);

  // Scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activePatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleApplyPatch = async () => {
    if (!activePatch) return;
    const patch = activePatch;
    setActivePatch(null);
    
    toast.promise(applyContextPatch(ideaId, patch.newInfo, patch.agents), {
      loading: `Re-analizando ${patch.agents.join(', ')}...`,
      success: 'Análisis actualizado con la nueva información',
      error: 'Error al actualizar el análisis',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && selectedFiles.length === 0) || isSending) return;

    const text = inputValue;
    const files = selectedFiles;
    setInputValue('');
    setSelectedFiles([]);
    setIsSubmitting(true);
    setActivePatch(null);

    // Add user message locally
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      attachments: files.map(f => ({ name: f.name }))
    };
    setMessages(prev => [...prev, userMsg]);

    // Prepare assistant message
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }]);

    try {
      const body = new FormData();
      body.append('message', text);
      files.forEach(f => body.append('file', f));

      const response = await fetch(`/api/ideas/${ideaId}/chat`, {
        method: 'POST',
        body
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === 'delta') {
            assistantContent += data.content;
            setMessages(prev => prev.map(m => 
              m.id === assistantMsgId ? { ...m, content: assistantContent } : m
            ));
          } else if (data.type === 'patch') {
            setActivePatch(data.patch);
          } else if (data.type === 'done') {
            setMessages(prev => prev.map(m => 
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            ));
          } else if (data.type === 'error') {
            toast.error(data.message);
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Error en el chat');
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside 
        className={cn(
          "fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[var(--bg-card)] border-l border-[var(--border-subtle)] z-[100] flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-bottom border-[var(--border-subtle)] bg-[var(--bg-elev)]/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--accent-pri)]/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-[var(--accent-pri)]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Asesor IA</h3>
              <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Consultoría estratégica</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elev)] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-subtle) transparent' }}
        >
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-3">
              <Loader2 className="h-6 w-6 animate-spin opacity-50" />
              <p className="text-xs font-medium uppercase tracking-widest">Cargando historial...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="h-12 w-12 rounded-2xl bg-[var(--bg-elev)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-[var(--accent-pri)]" />
              </div>
              <h4 className="text-[15px] font-bold text-[var(--text-primary)] mb-2">Pregúntale a tu Asesor</h4>
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                Analiza riesgos específicos, busca competidores o profundiza en tu modelo de negocio.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div 
                key={m.id || i}
                className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed",
                  m.role === 'user' 
                    ? "bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] rounded-tr-none shadow-lg shadow-[var(--accent-pri)]/10" 
                    : "bg-[var(--bg-elev)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-none"
                )}>
                  {m.content || (m.isStreaming && <span className="inline-block w-1.5 h-4 bg-current animate-pulse align-middle" />)}
                  
                  {m.attachments && (m.attachments as any[]).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(m.attachments as any[]).map((a, ai) => (
                        <div key={ai} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/10 text-[11px] font-medium">
                          <Paperclip className="h-3 w-3 opacity-60" />
                          <span className="truncate max-w-[120px]">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Patch Suggestion */}
          {activePatch && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 rounded-xl bg-[var(--bg-elev)] border border-[var(--accent-pri)] shadow-lg shadow-[var(--accent-pri)]/5">
                <div className="flex items-center gap-2 mb-2 text-[var(--accent-pri)] font-bold text-[12px] uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  Sugerencia de actualización
                </div>
                <p className="text-[13px] text-[var(--text-primary)] mb-4 leading-relaxed">
                  {activePatch.summary}
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleApplyPatch}
                    className="h-8 flex-1 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold text-[12px] gap-2"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    Aplicar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setActivePatch(null)}
                    className="h-8 flex-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[12px] font-bold"
                  >
                    Ignorar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 pt-0 shrink-0 bg-[var(--bg-card)]">
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2">
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-elev)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)]">
                  <span className="truncate max-w-[100px]">{f.name}</span>
                  <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3 hover:text-[var(--red)]" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-2xl p-2 focus-within:border-[var(--accent-pri)] transition-all"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept="image/*,application/pdf,audio/*"
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregunta algo sobre tu idea..."
              rows={1}
              className="flex-1 max-h-32 py-2.5 bg-transparent border-none outline-none text-[14.5px] text-[var(--text-primary)] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={(!inputValue.trim() && selectedFiles.length === 0) || isSending}
              className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] disabled:opacity-50 disabled:grayscale transition-all"
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
          <p className="mt-3 text-center text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-[0.1em]">
            Claude 3.5 Sonnet · Análisis en tiempo real
          </p>
        </div>
      </aside>
    </>
  );
}
