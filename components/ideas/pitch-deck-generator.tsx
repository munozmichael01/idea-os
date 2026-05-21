'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { runPitchAgentForIdea } from '@/lib/actions/ideas'
import { Button } from '@/components/ui/button'
import { 
  Presentation, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PitchDeckGeneratorProps {
  ideaId: string
  ideaTitle: string
}

export function PitchDeckGenerator({ ideaId, ideaTitle }: PitchDeckGeneratorProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const router = useRouter()

  const steps = [
    "Analizando propuesta de valor...",
    "Estructurando narrativa de negocio...",
    "Calculando dimensionamiento de mercado...",
    "Mapeando panorama competitivo...",
    "Diseñando modelo de monetización...",
    "Finalizando pitch deck profesional..."
  ]

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGenerating) {
      interval = setInterval(() => {
        setStep(s => (s + 1) % steps.length)
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isGenerating, steps.length])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await runPitchAgentForIdea(ideaId)
      toast.success('Pitch deck generado con éxito')
      router.refresh()
    } catch (error) {
      console.error('Error generating pitch deck:', error)
      toast.error('Error al generar el pitch deck')
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto p-8 text-center">
      {!isGenerating ? (
        <>
          <div className="w-20 h-20 rounded-2xl bg-[var(--accent-pri)]/10 flex items-center justify-center mb-8">
            <Presentation className="w-10 h-10 text-[var(--accent-pri)]" />
          </div>
          <h1 className="text-4xl font-extrabold font-display text-[var(--text-primary)] mb-4 tracking-tight">
            Crea tu Pitch Deck
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-10 leading-relaxed">
            Transforma el análisis de <span className="text-[var(--text-primary)] font-semibold">{ideaTitle}</span> en una presentación profesional lista para inversores.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10 text-left">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex gap-4">
              <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-[var(--green)]" /></div>
              <div>
                <h4 className="font-bold text-[14px]">Estructura Estándar</h4>
                <p className="text-xs text-[var(--text-muted)]">9 slides que cubren desde el problema hasta el Ask.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex gap-4">
              <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-[var(--green)]" /></div>
              <div>
                <h4 className="font-bold text-[14px]">Datos de Mercado</h4>
                <p className="text-xs text-[var(--text-muted)]">Dimensionamiento TAM/SAM/SOM basado en análisis.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex gap-4">
              <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-[var(--green)]" /></div>
              <div>
                <h4 className="font-bold text-[14px]">Diseño Premium</h4>
                <p className="text-xs text-[var(--text-muted)]">Estética minimalista y profesional optimizada para lectura.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex gap-4">
              <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-[var(--green)]" /></div>
              <div>
                <h4 className="font-bold text-[14px]">Listo para Exportar</h4>
                <p className="text-xs text-[var(--text-muted)]">Comparte el link o genera un PDF en un clic.</p>
              </div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="h-14 px-10 gap-3 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold text-lg rounded-full"
            onClick={handleGenerate}
          >
            <Sparkles className="w-5 h-5" />
            Generar Pitch Deck
          </Button>
          <p className="mt-6 text-sm text-[var(--text-muted)] flex items-center gap-2 justify-center">
            <Loader2 className="w-3 h-3 animate-spin" /> Esto tomará unos 20 segundos
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-12">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-pri)]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[var(--accent-pri)] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[var(--accent-pri)] animate-pulse" />
            </div>
          </div>
          
          <div className="h-24 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 key={step}">
              {steps[step]}
            </h2>
            <p className="text-[var(--text-muted)] font-mono text-sm tracking-wider uppercase">
              Procesando con Claude 3.5 Sonnet
            </p>
          </div>

          <div className="mt-12 w-64 h-1.5 bg-[var(--bg-elev)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent-pri)] transition-all duration-[3000ms] ease-linear"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
