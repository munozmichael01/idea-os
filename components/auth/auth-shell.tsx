'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
  mode: 'login' | 'register';
}

export function AuthShell({ children, mode }: AuthShellProps) {
  const { theme, setTheme } = useTheme();
  const isLogin = mode === 'login';

  return (
    <div className="auth-shell min-h-svh grid grid-cols-1 lg:grid-cols-2 relative z-10 bg-[var(--bg-base)]">
      <div className="theme-floater absolute top-4 right-4 flex gap-1 p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[8px] z-20">
        <button 
          onClick={() => setTheme('dark')}
          className={cn(
            "px-2.5 py-1.5 rounded-[5px] text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5",
            theme === 'dark' ? "bg-[var(--bg-elev)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
        >
          <Moon className="h-3 w-3" />
          <span>Dark</span>
        </button>
        <button 
          onClick={() => setTheme('light')}
          className={cn(
            "px-2.5 py-1.5 rounded-[5px] text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5",
            theme === 'light' ? "bg-[var(--bg-elev)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
        >
          <Sun className="h-3 w-3" />
          <span>Light</span>
        </button>
      </div>

      <div className="auth-form-wrap grid place-items-center p-8">
        <div className="auth-form w-full max-w-[380px] flex flex-col gap-5">
          <div className="auth-brand flex items-center gap-2.5 mb-2">
            <div className="brand-mark h-8 w-8 rounded-[9px] bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6"/>
                <path d="M10 21h4"/>
                <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3Z"/>
                <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none"/>
                <path d="M12 10.5v3"/>
              </svg>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">IdeaOS · v0.4.2</span>
          </div>

          <h1 className="auth-h1 text-[44px] font-extrabold tracking-[-0.03em] leading-[1.05] font-display text-[var(--text-primary)]">
            {isLogin ? (
              <>Bienvenido de vuelta<span className="text-[var(--accent-pri)]">.</span></>
            ) : (
              <>Empieza a validar<span className="text-[var(--accent-pri)]">.</span></>
            )}
          </h1>
          <p className="auth-tagline text-[14px] text-[var(--text-secondary)] leading-relaxed mb-2">
            Valida y prioriza tus ideas de negocio con un equipo de 5 agentes de IA. Análisis en menos de 90 segundos.
          </p>

          <div className="auth-mode-tabs flex p-1 bg-[var(--bg-elev)] rounded-[12px] mb-1.5">
            <Link 
              href="/login" 
              className={cn(
                "flex-1 py-2 text-center text-[12.5px] font-medium rounded-[9px] transition-all",
                isLogin ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Iniciar sesión
            </Link>
            <Link 
              href="/register" 
              className={cn(
                "flex-1 py-2 text-center text-[12.5px] font-medium rounded-[9px] transition-all",
                !isLogin ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Crear cuenta
            </Link>
          </div>

          {children}

          <div className="auth-helper flex justify-between mt-3 text-[12px] text-[var(--text-muted)]">
            <a href="#" className="hover:text-[var(--text-secondary)]">Términos</a>
            <a href="#" className="hover:text-[var(--text-secondary)]">Privacidad</a>
            <a href="#" className="hover:text-[var(--text-secondary)]">Soporte</a>
          </div>
        </div>
      </div>

      <aside className="auth-aside hidden lg:flex relative bg-[var(--bg-card)] border-l border-[var(--border-subtle)] p-14 flex-col gap-7 overflow-hidden">
        <div className="aside-meta font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          5 agentes · Score compuesto · Ranking dinámico
        </div>
        <h2 className="aside-quote font-display font-extrabold text-[36px] leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] max-w-[480px]">
          Captura una idea en 60 segundos. <span className="text-[var(--accent-pri)]">Sabe si vale la pena en 90.</span>
        </h2>

        <div className="aside-preview flex flex-col gap-2.5 mt-auto">
          <div className="aside-meta font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Última semana en IdeaOS
          </div>
          <div className="preview-row flex items-center justify-between p-3.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[14px]">
            <div className="flex items-center gap-4">
              <span className="font-display font-bold text-[26px] tracking-tighter text-[var(--green)]">8.4</span>
              <div className="flex flex-col">
                <div className="font-display font-bold text-[14px] text-[var(--text-primary)]">Inmogrowth</div>
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Real Estate · 5/5 agentes</div>
              </div>
            </div>
            <span className="priority-badge h-fit px-2.5 py-1 rounded-[6px] text-[10.5px] font-mono font-medium uppercase tracking-wider bg-[rgba(198,255,61,0.08)] text-[var(--accent-pri)] border border-[rgba(198,255,61,0.2)]">
              Alta prioridad
            </span>
          </div>
          <div className="preview-row flex items-center justify-between p-3.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[14px]">
            <div className="flex items-center gap-4">
              <span className="font-display font-bold text-[26px] tracking-tighter text-[var(--yellow)]">6.8</span>
              <div className="flex flex-col">
                <div className="font-display font-bold text-[14px] text-[var(--text-primary)]">Real State Pro</div>
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wide">PropTech · 5/5 agentes</div>
              </div>
            </div>
            <span className="priority-badge h-fit px-2.5 py-1 rounded-[6px] text-[10.5px] font-mono font-medium uppercase tracking-wider bg-[var(--bg-elev)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              Prometedora
            </span>
          </div>
          <div className="preview-row flex items-center justify-between p-3.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[14px]">
            <div className="flex items-center gap-4">
              <span className="font-display font-bold text-[26px] tracking-tighter text-[var(--orange)]">5.8</span>
              <div className="flex flex-col">
                <div className="font-display font-bold text-[14px] text-[var(--text-primary)]">Studio.ai</div>
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Creator economy · 5/5</div>
              </div>
            </div>
            <span className="priority-badge h-fit px-2.5 py-1 rounded-[6px] text-[10.5px] font-mono font-medium uppercase tracking-wider bg-[var(--bg-elev)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              A desarrollar
            </span>
          </div>
        </div>

        <div className="aside-stats grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border-subtle)]">
          <div>
            <div className="font-display font-bold text-[32px] tracking-tight text-[var(--text-primary)]">2.4k</div>
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Ideas analizadas</div>
          </div>
          <div>
            <div className="font-display font-bold text-[32px] tracking-tight text-[var(--text-primary)]">87s</div>
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Análisis medio</div>
          </div>
          <div>
            <div className="font-display font-bold text-[32px] tracking-tight text-[var(--text-primary)]">12</div>
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Sectores</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
