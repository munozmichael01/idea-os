'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/auth-shell';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Sesión iniciada correctamente');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell mode="login">
      <form className="auth-card flex flex-col gap-4" onSubmit={handleLogin}>
        <div className="auth-input-group flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Email</label>
          <input 
            className="auth-input w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[8px] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--green)] focus:ring-4 focus:ring-[rgba(198,255,61,0.08)] transition-all" 
            type="email" 
            placeholder="tu@empresa.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-input-group flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Contraseña</label>
            <a href="#" className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--green)]">¿Olvidaste?</a>
          </div>
          <input 
            className="auth-input w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[8px] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--green)] focus:ring-4 focus:ring-[rgba(198,255,61,0.08)] transition-all" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="btn btn-primary auth-cta w-full py-3 h-auto bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)] font-bold text-[13.5px] mt-2" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Procesando…</>
          ) : 'Iniciar sesión'}
        </Button>

        <div className="auth-divider flex items-center gap-3 font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest my-1 before:flex-1 before:h-px before:bg-[var(--border-subtle)] after:flex-1 after:h-px after:bg-[var(--border-subtle)]">
          o continúa con
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" className="h-10 gap-2 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-active)]">
            Google
          </Button>
          <Button type="button" variant="secondary" className="h-10 gap-2 border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-active)]">
            GitHub
          </Button>
        </div>

        <div className="auth-foot text-center text-[12px] text-[var(--text-muted)] mt-2">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[var(--green)] hover:underline">
            Crear cuenta
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
