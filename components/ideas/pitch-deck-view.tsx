'use client'

import * as React from 'react'
import { PitchDeck, PitchSlideKey } from '@/lib/types'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import { cn } from '@/lib/utils'
import { 
  Share2, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
})

interface PitchDeckViewProps {
  deck: PitchDeck
  ideaId: string
}

export function PitchDeckView({ deck }: PitchDeckViewProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [scale, setScale] = React.useState(1)
  const [offsetX, setOffsetX] = React.useState(0)
  const [offsetY, setOffsetY] = React.useState(0)
  const deckRef = React.useRef<HTMLDivElement>(null)

  const SLIDE_W = 1920
  const SLIDE_H = 1080
  const CHROME_H = 74

  // Filter enabled slides
  const enabledSlides = React.useMemo(() => {
    // Portada is always first
    const slides: { key: string; data: any }[] = [{ key: 'cover', data: deck.meta }]
    
    deck.enabledSlides.forEach(key => {
      if (deck.slides[key]) {
        slides.push({ key, data: deck.slides[key] })
      }
    })
    
    return slides
  }, [deck])

  const total = enabledSlides.length

  const go = React.useCallback((i: number) => {
    const next = Math.max(0, Math.min(total - 1, i))
    setCurrentSlide(next)
    window.location.hash = `#${next + 1}`
  }, [total])

  const next = React.useCallback(() => go(currentSlide + 1), [currentSlide, go])
  const prev = React.useCallback(() => go(currentSlide - 1), [currentSlide, go])

  // Initial hash read
  React.useEffect(() => {
    const hash = window.location.hash
    const m = /^#(\d+)$/.exec(hash)
    if (m) {
      const i = parseInt(m[1], 10) - 1
      setCurrentSlide(Math.max(0, Math.min(total - 1, i)))
    }
  }, [total])

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          go(0)
          break
        case 'End':
          e.preventDefault()
          go(total - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, prev, go, total])

  // Resize logic
  React.useEffect(() => {
    const rescale = () => {
      const vw = window.innerWidth
      const vh = Math.max(1, window.innerHeight - CHROME_H)
      const s = Math.min(vw / SLIDE_W, vh / SLIDE_H)
      
      const renderedW = SLIDE_W * s
      const renderedH = SLIDE_H * s
      
      setScale(s)
      setOffsetX(Math.max(0, (vw - renderedW) / 2))
      setOffsetY(Math.max(0, (vh - renderedH) / 2))
    }

    rescale()
    window.addEventListener('resize', rescale)
    return () => window.removeEventListener('resize', rescale)
  }, [])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('URL copiada al portapapeles')
    } catch (err) {
      toast.error('Error al copiar URL')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={cn("pitch-deck-container", manrope.className)}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #0a0a0c;
          --bg-elev: #131316;
          --bg-card: #17171b;
          --line: #25252b;
          --line-soft: #1c1c21;
          --fg: #f4f3ee;
          --fg-muted: #a3a39a;
          --fg-dim: #6b6b66;
          --accent: oklch(0.78 0.15 165);
          --accent-2: oklch(0.78 0.15 70);
          --accent-dim: oklch(0.78 0.15 165 / 0.18);
          --slide-w: 1920px;
          --slide-h: 1080px;
          --pad-x: 120px;
          --pad-top: 110px;
          --pad-bottom: 100px;
        }

        .pitch-deck-container {
          background: #000;
          color: var(--fg);
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .stage {
          position: fixed; inset: 0 0 ${CHROME_H}px 0;
          background: #000;
          overflow: hidden;
        }

        .deck {
          position: absolute;
          top: 0; left: 0;
          width: var(--slide-w);
          height: var(--slide-h);
          transform-origin: top left;
          background: var(--bg);
        }

        .slide {
          position: absolute; inset: 0;
          width: var(--slide-w); height: var(--slide-h);
          padding: var(--pad-top) var(--pad-x) var(--pad-bottom);
          background: var(--bg);
          opacity: 0;
          visibility: hidden;
          transition: opacity 320ms ease, transform 320ms ease;
          transform: translateY(8px);
          display: flex; flex-direction: column;
        }

        .slide.is-active {
          opacity: 1; visibility: visible; transform: none;
        }

        .chrome {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 50;
          height: ${CHROME_H}px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px;
          background: linear-gradient(to top, #000 60%, rgba(0,0,0,0));
          font-family: ${jetbrainsMono.style.fontFamily};
          font-size: 12px;
          color: #8a8a82;
        }

        .group { display: flex; align-items: center; gap: 10px; }

        .btn-deck {
          appearance: none; border: 1px solid #2a2a30;
          background: rgba(20,20,24,0.85);
          backdrop-filter: blur(8px);
          color: #d9d9d2;
          font: 500 12px/1 ${jetbrainsMono.style.fontFamily};
          letter-spacing: 0.04em;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color .15s, color .15s, background .15s;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 6px;
        }
        .btn-deck:hover { border-color: #4a4a52; color: #fff; }

        .btn-arrow { width: 38px; height: 38px; padding: 0; display: grid; place-items: center; font-size: 14px; }

        .counter {
          font-family: ${jetbrainsMono.style.fontFamily};
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #8a8a82;
          min-width: 60px; text-align: center;
        }
        .counter b { color: #f4f3ee; font-weight: 500; }

        .progress {
          position: fixed; top: 0; left: 0; right: 0; height: 2px;
          z-index: 60; background: transparent;
        }
        .progress-bar {
          display: block; height: 100%;
          background: var(--accent);
          transition: width .35s ease;
        }

        /* Atoms */
        .eyebrow {
          font: 500 18px/1 ${jetbrainsMono.style.fontFamily};
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--fg-dim);
          display: flex; align-items: center; gap: 14px;
        }
        .eyebrow::before {
          content: ''; display: inline-block;
          width: 28px; height: 1px; background: var(--accent);
        }
        .eyebrow.amber::before { background: var(--accent-2); }

        .slide-title {
          font-size: 76px;
          font-weight: 600;
          line-height: 1.02;
          letter-spacing: -0.025em;
          color: var(--fg);
          max-width: 1500px;
          text-wrap: balance;
        }

        .head {
          display: flex; flex-direction: column;
          gap: 28px;
          margin-bottom: 56px;
        }

        .foot {
          margin-top: auto;
          display: flex; align-items: flex-end; justify-content: space-between;
          font: 500 18px/1 ${jetbrainsMono.style.fontFamily};
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--fg-dim);
        }
        .foot .brand-mark { display: flex; align-items: center; gap: 12px; }
        .foot .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }

        .logo-deck {
          display: inline-flex; align-items: center; gap: 14px;
          font: 600 22px/1 ${manrope.style.fontFamily};
          letter-spacing: -0.02em;
          color: var(--fg);
        }
        .logo-deck .sq {
          width: 22px; height: 22px;
          background: var(--accent);
          border-radius: 5px;
          position: relative;
        }
        .logo-deck .sq::after {
          content: '';
          position: absolute; inset: 6px 4px;
          background: var(--bg);
          clip-path: polygon(40% 0, 60% 0, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0 60%, 0 40%, 40% 40%);
        }

        /* Slide specific styles */
        .cover-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 800px 600px at 75% 45%, oklch(0.78 0.15 165 / 0.10), transparent 70%),
            radial-gradient(ellipse 600px 500px at 15% 80%, oklch(0.78 0.15 70 / 0.05), transparent 70%);
        }
        .cover-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(to right, var(--line-soft) 1px, transparent 1px),
            linear-gradient(to bottom, var(--line-soft) 1px, transparent 1px);
          background-size: 120px 120px;
          mask-image: radial-gradient(ellipse 1100px 700px at 50% 50%, #000 30%, transparent 80%);
          opacity: 0.6;
        }
        .cover-inner {
          position: relative;
          height: 100%;
          display: grid;
          grid-template-rows: auto 1fr auto;
          padding: 80px var(--pad-x) 70px;
        }
        .cover-top { display: flex; justify-content: space-between; align-items: center; }
        .cover-meta {
          font: 500 18px/1 ${jetbrainsMono.style.fontFamily};
          letter-spacing: 0.18em; text-transform: uppercase; color: var(--fg-dim);
          display: flex; gap: 32px;
        }
        .cover-meta span b { color: var(--fg-muted); font-weight: 500; }
        .cover-center { display: flex; flex-direction: column; justify-content: center; gap: 40px; }
        .cover-name {
          font-size: 132px; font-weight: 700; line-height: 0.92; letter-spacing: -0.045em;
        }
        .cover-name em { font-style: normal; color: var(--accent); }
        .cover-tag {
          font-size: 42px; line-height: 1.18; font-weight: 400; color: var(--fg-muted); max-width: 1300px; letter-spacing: -0.01em;
        }
        .cover-bottom {
          display: flex; justify-content: space-between; align-items: flex-end;
          font: 500 18px/1.4 ${jetbrainsMono.style.fontFamily};
          letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-dim);
        }

        .problem-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 100px; flex: 1; }
        .big-stat { display: flex; flex-direction: column; justify-content: center; border-left: 1px solid var(--line); padding-left: 60px; }
        .big-stat .num { font-size: 320px; font-weight: 700; line-height: 0.88; letter-spacing: -0.06em; color: var(--fg); }
        .big-stat .num em { color: var(--accent); font-style: normal; }
        .big-stat .lbl { margin-top: 18px; font: 500 24px/1.3 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.04em; color: var(--fg-muted); max-width: 480px; }
        .facts { margin-top: 60px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .fact { border-top: 1px solid var(--line); padding-top: 22px; }
        .fact .v { font-size: 56px; font-weight: 600; line-height: 1; letter-spacing: -0.02em; }
        .fact .k { margin-top: 14px; font-size: 22px; color: var(--fg-muted); line-height: 1.35; }

        .solution-stack { display: grid; grid-template-columns: 1fr 1.1fr; gap: 90px; flex: 1; }
        .steps { display: flex; flex-direction: column; justify-content: center; }
        .step { display: grid; grid-template-columns: 90px 1fr; gap: 30px; align-items: flex-start; padding: 36px 0; border-top: 1px solid var(--line); }
        .step:last-child { border-bottom: 1px solid var(--line); }
        .step .n { font: 500 24px/1 ${jetbrainsMono.style.fontFamily}; color: var(--accent); letter-spacing: 0.04em; padding-top: 8px; }
        .step .h { font-size: 38px; font-weight: 600; letter-spacing: -0.015em; line-height: 1.15; margin-bottom: 8px; }
        .step .d { font-size: 22px; color: var(--fg-muted); line-height: 1.4; max-width: 540px; }
        .benefits-grid { display: flex; flex-direction: column; gap: 24px; justify-content: center; }
        .benefit-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 16px; padding: 40px; display: flex; gap: 32px; align-items: flex-start; }
        .benefit-num { font: 600 32px/1 ${jetbrainsMono.style.fontFamily}; color: var(--accent); }
        .benefit-title { font-size: 32px; font-weight: 600; margin-bottom: 12px; color: var(--fg); }
        .benefit-desc { font-size: 22px; color: var(--fg-muted); line-height: 1.4; }

        .market-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 80px; align-items: center; flex: 1; }
        .rings { position: relative; width: 720px; height: 720px; margin: 0 auto; }
        .ring { position: absolute; border-radius: 50%; border: 1px solid var(--line); display: flex; align-items: flex-start; justify-content: center; padding-top: 30px; }
        .ring.r1 { inset: 0; background: oklch(0.78 0.15 165 / 0.03); }
        .ring.r2 { inset: 140px; background: oklch(0.78 0.15 165 / 0.06); border-color: oklch(0.78 0.15 165 / 0.35); }
        .ring.r3 { inset: 270px; background: oklch(0.78 0.15 165 / 0.14); border-color: var(--accent); }
        .ring .lbl { font: 500 14px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.16em; text-transform: uppercase; color: var(--fg-dim); }
        .ring .val { position: absolute; font-size: 38px; font-weight: 600; letter-spacing: -0.02em; }
        .ring.r1 .val { top: 70px; }
        .ring.r2 .val { top: 70px; }
        .ring.r3 .val { top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 64px; color: var(--accent); }
        .market-side { display: flex; flex-direction: column; gap: 36px; }
        .market-row { display: grid; grid-template-columns: 70px 1fr auto; gap: 24px; align-items: baseline; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
        .market-row .tag { font: 600 16px/1 ${jetbrainsMono.style.fontFamily}; color: var(--accent); }
        .market-row .name { font-size: 26px; color: var(--fg-muted); line-height: 1.3; }
        .market-row .name b { color: var(--fg); font-weight: 600; display: block; font-size: 22px; margin-bottom: 4px; }
        .market-row .v { font-size: 42px; font-weight: 600; letter-spacing: -0.02em; font-family: ${jetbrainsMono.style.fontFamily}; }

        .comp-table { display: flex; flex-direction: column; width: 100%; }
        .ct-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 18px; align-items: center; padding: 22px 0; border-bottom: 1px solid var(--line); font-size: 19px; }
        .ct-row.head { font: 500 14px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-dim); padding-top: 0; }
        .ct-row.us { background: linear-gradient(90deg, var(--accent-dim), transparent); padding-left: 12px; margin-left: -12px; padding-right: 12px; margin-right: -12px; border-radius: 6px; border-bottom-color: transparent; }
        .ct-row b { font-weight: 600; color: var(--fg); }
        .ct-row .check { color: var(--accent); font-weight: 600; }
        .ct-row .x { color: var(--fg-dim); }

        .model-grid { display: grid; grid-template-columns: 0.95fr 1.4fr; gap: 80px; flex: 1; }
        .price-card { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 16px; padding: 48px 44px; display: flex; flex-direction: column; gap: 36px; align-self: center; }
        .price-card .tier { font: 500 14px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); }
        .price-card .price { font-size: 120px; font-weight: 700; line-height: 0.95; letter-spacing: -0.04em; display: flex; align-items: flex-start; gap: 8px; }
        .price-card .price small { font-size: 26px; font-weight: 400; color: var(--fg-muted); letter-spacing: 0; margin-top: 20px; }
        .price-card ul { list-style: none; display: flex; flex-direction: column; gap: 14px; border-top: 1px solid var(--line); padding-top: 28px; }
        .price-card li { display: flex; align-items: center; gap: 14px; font-size: 18px; color: var(--fg); }
        .price-card li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        .unit-econ { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .ue { border: 1px solid var(--line); border-radius: 14px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; background: var(--bg-elev); min-height: 230px; }
        .ue .k { font: 500 14px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-dim); }
        .ue .v { font-size: 72px; font-weight: 600; line-height: 1; letter-spacing: -0.03em; }
        .ue .d { font-size: 17px; color: var(--fg-muted); line-height: 1.4; }
        .ue.accent .v { color: var(--accent); }
        .ue.ratio .v::after { content: '×'; color: var(--fg-muted); font-size: 42px; vertical-align: top; margin-left: 6px; }

        .gtm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; flex: 1; }
        .phase { border: 1px solid var(--line); border-radius: 14px; padding: 36px 32px; display: flex; flex-direction: column; background: var(--bg-elev); }
        .phase .ph { font: 500 14px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-dim); margin-bottom: 12px; }
        .phase .ph b { color: var(--accent); }
        .phase .ph-title { font-size: 30px; font-weight: 600; letter-spacing: -0.015em; line-height: 1.15; margin-bottom: 20px; }
        .phase .ph-time { font: 500 16px/1 ${jetbrainsMono.style.fontFamily}; color: var(--fg-muted); padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; align-self: flex-start; margin-bottom: 24px; }
        .phase .ph-list { list-style: none; display: flex; flex-direction: column; gap: 14px; font-size: 18px; line-height: 1.4; color: var(--fg-muted); flex: 1; }
        .phase .ph-list li { display: grid; grid-template-columns: 22px 1fr; gap: 10px; align-items: baseline; }
        .phase .ph-list li::before { content: '→'; color: var(--accent); font-family: ${jetbrainsMono.style.fontFamily}; }
        .phase .ph-kpi { margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--line); }
        .phase .ph-kpi .k { font: 500 12px/1 ${jetbrainsMono.style.fontFamily}; color: var(--fg-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .phase .ph-kpi .v { font-size: 30px; font-weight: 600; color: var(--fg); letter-spacing: -0.02em; }

        .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; flex: 1; }
        .member { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 16px; padding: 44px; display: grid; grid-template-rows: auto auto 1fr auto; gap: 24px; }
        .member .avatar { width: 120px; height: 120px; border-radius: 50%; background: repeating-linear-gradient(45deg, #1c1c21 0 8px, #131316 8px 16px); border: 1px solid var(--line); display: grid; place-items: center; font: 600 12px/1 ${jetbrainsMono.style.fontFamily}; color: var(--fg-dim); letter-spacing: 0.1em; }
        .member .who { display: flex; flex-direction: column; gap: 6px; }
        .member .name { font-size: 40px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; }
        .member .role { font: 500 16px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
        .member .bio { font-size: 19px; line-height: 1.5; color: var(--fg-muted); }
        .member .creds { display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--line); padding-top: 20px; }
        .member .creds li { list-style: none; display: grid; grid-template-columns: 90px 1fr; gap: 16px; font-size: 16px; align-items: baseline; }
        .member .creds .yr { font: 500 13px/1 ${jetbrainsMono.style.fontFamily}; color: var(--fg-dim); letter-spacing: 0.06em; }
        .member .creds .what { color: var(--fg); }

        .ask-grid { display: grid; grid-template-columns: 0.95fr 1fr; gap: 100px; flex: 1; align-items: center; }
        .ask-num .label { font: 500 18px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.18em; text-transform: uppercase; color: var(--fg-dim); margin-bottom: 32px; }
        .ask-num .big { font-size: 280px; font-weight: 700; line-height: 0.9; letter-spacing: -0.05em; display: flex; align-items: flex-start; }
        .ask-num .big em { color: var(--accent); font-style: normal; }
        .ask-num .big small { font-size: 60px; font-weight: 500; color: var(--fg-muted); letter-spacing: -0.02em; margin-top: 30px; margin-left: 14px; }
        .ask-num .sub { font-size: 28px; color: var(--fg-muted); line-height: 1.4; max-width: 600px; }
        .uof-section .head-lbl { font: 500 14px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-dim); margin-bottom: 28px; }
        .uof-row { display: grid; grid-template-columns: 70px 1fr 90px; gap: 24px; align-items: center; margin-bottom: 28px; }
        .uof-row .pct { font: 600 24px/1 ${jetbrainsMono.style.fontFamily}; color: var(--accent); text-align: right; }
        .uof-row .bar { height: 10px; background: var(--bg-elev); border-radius: 5px; position: relative; overflow: hidden; }
        .uof-row .bar > i { display: block; height: 100%; background: var(--accent); border-radius: 5px; }
        .uof-row .lbl { font-size: 18px; color: var(--fg); }
        .milestone { margin-top: 40px; padding-top: 28px; border-top: 1px solid var(--line); }
        .milestone .ml-k { font: 500 14px/1 ${jetbrainsMono.style.fontFamily}; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-dim); margin-bottom: 16px; }
        .milestone .ml-v { font-size: 28px; font-weight: 500; line-height: 1.3; color: var(--fg); letter-spacing: -0.01em; max-width: 640px; }

        @media print {
          @page { size: 1920px 1080px; margin: 0; }
          .pitch-deck-container { background: #0a0a0c; height: auto; overflow: visible; }
          .stage { position: static; display: block; height: auto; }
          .deck { transform: none !important; width: var(--slide-w); height: auto; }
          .slide {
            position: relative !important;
            opacity: 1 !important; visibility: visible !important;
            transform: none !important;
            page-break-after: always;
            page-break-inside: avoid;
            inset: auto;
          }
          .chrome, .progress { display: none !important; }
        }
      ` }} />

      <div className="progress" aria-hidden="true">
        <i className="progress-bar" style={{ width: `${((currentSlide + 1) / total) * 100}%` }}></i>
      </div>

      <main className="stage">
        <div 
          className="deck" 
          ref={deckRef}
          style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('.chrome, .btn-deck, a, button')) return
            const x = e.clientX
            if (x > window.innerWidth / 2) next()
            else prev()
          }}
        >
          {enabledSlides.map((slide, idx) => {
            const isActive = currentSlide === idx
            
            if (slide.key === 'cover') {
              const meta = slide.data as PitchDeck['meta']
              return (
                <section key="cover" className={cn("slide slide--cover", isActive && "is-active")}>
                  <div className="cover-bg"></div>
                  <div className="cover-grid"></div>
                  <div className="cover-inner">
                    <header className="cover-top">
                      <div className="logo-deck"><span className="sq"></span><span>{meta.ideaName}</span></div>
                      <div className="cover-meta">
                        <span><b>{meta.stage}</b> · {new Date().getFullYear()}</span>
                        <span><b>{meta.sector}</b></span>
                        {meta.geography && <span><b>{meta.geography}</b></span>}
                      </div>
                    </header>
                    <div className="cover-center">
                      <h1 className="cover-name" dangerouslySetInnerHTML={{ __html: meta.ideaName.replace(/([A-Z][a-z]+)$/, '<em>$1</em>') }}></h1>
                      <p className="cover-tag">{meta.tagline}</p>
                    </div>
                    <footer className="cover-bottom">
                      <div className="col">
                        <span>Pitch deck</span>
                        <span style={{ color: 'var(--fg-dim)' }}>Confidencial · v1.0</span>
                      </div>
                      <div className="col" style={{ textAlign: 'right' }}>
                        <span>presentado por el equipo fundador</span>
                        {meta.contactEmail && <span style={{ color: 'var(--fg-dim)' }}>{meta.contactEmail}</span>}
                      </div>
                    </footer>
                  </div>
                </section>
              )
            }

            const data = slide.data
            let content = null

            switch (slide.key) {
              case 'problem':
                content = (
                  <>
                    <div className="problem-grid">
                      <div>
                        <p className="body" style={{ marginBottom: '28px', fontSize: '30px', lineHeight: '1.45', color: 'var(--fg-muted)' }}>
                          {data.body}
                        </p>
                        <div className="facts">
                          {data.facts.map((f: any, i: number) => (
                            <div key={i} className="fact">
                              <div className="v">{f.value}</div>
                              <div className="k">{f.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="big-stat">
                        <div className="num">
                          {data.headlineStat.value.replace(/(\d+)/, '<em>$1</em>')}
                        </div>
                        <div className="lbl">{data.headlineStat.label}</div>
                      </div>
                    </div>
                  </>
                )
                break
              case 'solution':
                content = (
                  <div className="solution-stack">
                    <div className="steps">
                      {data.steps.map((s: any, i: number) => (
                        <div key={i} className="step">
                          <div className="n mono">{String(i+1).padStart(2, '0')}</div>
                          <div>
                            <div className="h">{s.title}</div>
                            <div className="d">{s.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="benefits-grid">
                      {data.benefits.map((b: any, i: number) => (
                        <div key={i} className="benefit-card">
                          <div className="benefit-num mono">{String(i+1).padStart(2, '0')}</div>
                          <div className="benefit-content">
                            <h3 className="benefit-title">{b.title}</h3>
                            <p className="benefit-desc">{b.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
                break
              case 'market':
                content = (
                  <div className="market-grid">
                    <div className="rings">
                      <div className="ring r1">
                        <div className="lbl">TAM</div>
                        <div className="val">{data.tam.value}</div>
                      </div>
                      <div className="ring r2">
                        <div className="lbl">SAM</div>
                        <div className="val">{data.sam.value}</div>
                      </div>
                      <div className="ring r3">
                        <div className="lbl">SOM</div>
                        <div className="val">{data.som.value}</div>
                      </div>
                    </div>
                    <div className="market-side">
                      <div className="market-row">
                        <div className="tag mono">TAM</div>
                        <div className="name"><b>Mercado total direccionable</b>{data.tam.description}</div>
                        <div className="v">{data.tam.value}</div>
                      </div>
                      <div className="market-row">
                        <div className="tag mono">SAM</div>
                        <div className="name"><b>Mercado servible</b>{data.sam.description}</div>
                        <div className="v">{data.sam.value}</div>
                      </div>
                      <div className="market-row">
                        <div className="tag mono">SOM</div>
                        <div className="name"><b>Mercado obtenible</b>{data.som.description}</div>
                        <div className="v">{data.som.value}</div>
                      </div>
                      <p className="body" style={{ fontSize: '20px', marginTop: '8px' }}>
                        {data.growthNote}
                      </p>
                    </div>
                  </div>
                )
                break
              case 'competition':
                content = (
                  <div className="matrix-wrap">
                    <div className="comp-table">
                      <div className="ct-row head">
                        <div>Capacidad</div>
                        {data.table.headers.map((h: string, i: number) => <div key={i}>{h}</div>)}
                      </div>
                      {data.table.rows.map((row: any, i: number) => (
                        <div key={i} className={cn("ct-row", row.highlightLast && "us")}>
                          <div>{row.highlightLast ? <b>{row.feature}</b> : row.feature}</div>
                          {row.values.map((v: string, vi: number) => (
                            <div key={vi} className={cn(v.toLowerCase() === 'sí' ? "check" : "x")}>
                              {row.highlightLast && vi === row.values.length - 1 ? <b>{v}</b> : v}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )
                break
              case 'businessModel':
                content = (
                  <div className="model-grid">
                    <div className="price-card">
                      <div className="tier">{data.pricing.tier}</div>
                      <div className="price">{data.pricing.amount}<small>{data.pricing.unit}</small></div>
                      <div className="desc">{data.pricing.description}</div>
                      <ul>
                        {data.pricing.features.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="unit-econ">
                      {data.unitEconomics.cac && (
                        <div className="ue">
                          <div className="k">CAC</div>
                          <div className="v">{data.unitEconomics.cac}</div>
                          <div className="d">Coste de adquisición de clientes.</div>
                        </div>
                      )}
                      {data.unitEconomics.ltv && (
                        <div className="ue accent">
                          <div className="k">LTV</div>
                          <div className="v">{data.unitEconomics.ltv}</div>
                          <div className="d">Valor de vida del cliente estimado.</div>
                        </div>
                      )}
                      {data.unitEconomics.ltvCacRatio && (
                        <div className="ue ratio">
                          <div className="k">LTV : CAC</div>
                          <div className="v">{data.unitEconomics.ltvCacRatio}</div>
                          <div className="d">Relación de rentabilidad por cliente.</div>
                        </div>
                      )}
                      {data.unitEconomics.grossMargin && (
                        <div className="ue">
                          <div className="k">Margen Bruto</div>
                          <div className="v">{data.unitEconomics.grossMargin}</div>
                          <div className="d">Eficiencia operativa del modelo.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
                break
              case 'gtm':
                content = (
                  <div className="gtm-grid">
                    {data.phases.map((ph: any, i: number) => (
                      <article key={i} className="phase">
                        <div className="ph">Fase <b>{String(i+1).padStart(2, '0')}</b></div>
                        <div className="ph-title">{ph.title}</div>
                        <div className="ph-time mono">{ph.timeframe}</div>
                        <ul className="ph-list">
                          {ph.actions.map((a: string, ai: number) => (
                            <li key={ai}>{a}</li>
                          ))}
                        </ul>
                        <div className="ph-kpi">
                          <div className="k">{ph.kpiLabel}</div>
                          <div className="v">{ph.kpiValue}</div>
                        </div>
                      </article>
                    ))}
                  </div>
                )
                break
              case 'team':
                content = (
                  <div className="team-grid">
                    {data.members.map((m: any, i: number) => (
                      <article key={i} className="member">
                        <div className="avatar">{m.initials}</div>
                        <div className="who">
                          <div className="name">{m.name}</div>
                          <div className="role">{m.role}</div>
                        </div>
                        <p className="bio">{m.bio}</p>
                        <ul className="creds">
                          {m.credentials.map((c: any, ci: number) => (
                            <li key={ci}>
                              <span className="yr">{c.year}</span>
                              <span className="what">{c.what}{c.where ? ` · <em>${c.where}</em>` : ''}</span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                )
                break
              case 'ask':
                content = (
                  <div className="ask-grid">
                    <div className="ask-num">
                      <div className="label">Ronda de inversión</div>
                      <div className="big"><em>{data.amount}</em><small>{data.currency}</small></div>
                      <div className="sub">{data.description}</div>
                    </div>
                    <div className="uof-section">
                      <div className="head-lbl">Uso de fondos</div>
                      <div className="use-of-funds">
                        {data.useOfFunds.map((u: any, i: number) => (
                          <div key={i} className="uof-row">
                            <div className="lbl">{u.label}</div>
                            <div className="bar"><i style={{ width: `${u.percentage}%` }}></i></div>
                            <div className="pct">{u.percentage}%</div>
                          </div>
                        ))}
                      </div>
                      <div className="milestone">
                        <div className="ml-k">Próximo hito</div>
                        <div className="ml-v">{data.nextMilestone}</div>
                      </div>
                    </div>
                  </div>
                )
                break
            }

            return (
              <section key={slide.key} className={cn("slide", isActive && "is-active")}>
                <header className="head">
                  <div className="eyebrow">{String(idx + 1).padStart(2, '0')} · {data.title}</div>
                  <h2 className="slide-title">{data.title}</h2>
                </header>
                {content}
                <footer className="foot">
                  <div className="brand-mark"><span className="dot"></span>{deck.meta.ideaName}</div>
                  <span>{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
                </footer>
              </section>
            )
          })}
        </div>
      </main>

      <div className="chrome">
        <div className="group">
          <button className="btn-deck" onClick={handleShare}>
            <Share2 className="w-4 h-4" /> Compartir
          </button>
          <button className="btn-deck" onClick={handlePrint}>
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>

        <div className="group">
          <button className="btn-deck btn-arrow" onClick={prev}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="counter"><b>{currentSlide + 1}</b> / <span>{total}</span></div>
          <button className="btn-deck btn-arrow" onClick={next}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
