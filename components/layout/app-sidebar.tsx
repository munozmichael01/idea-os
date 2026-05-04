'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  Settings,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { useTheme } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/actions/auth';

export function AppSidebar() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    async function loadUser() {
      const u = await getCurrentUser();
      if (u) {
        setUser({ 
          name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'User', 
          email: u.email || '' 
        });
      }
    }
    loadUser();
  }, []);

  const navItems = [
    {
      id: 'dashboard',
      title: t('dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'ideas',
      title: t('ideas'),
      url: '/dashboard', // Adjust as needed
      icon: Lightbulb,
    },
    {
      id: 'new',
      title: t('newIdea'),
      url: '/ideas/new',
      icon: PlusCircle,
    },
    {
      id: 'settings',
      title: t('settings'),
      url: '/settings',
      icon: Settings,
    },
  ];

  const recentIdeas = [
    { id: '1', title: 'Inmogrowth', color: 'var(--green)' },
    { id: '2', title: 'Real State Pro', color: 'var(--yellow)' },
    { id: '3', title: 'Cold-DM Loop', color: 'var(--orange)' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <SidebarHeader className="p-0">
        <div className="relative flex items-center gap-3 px-4 py-6 border-b border-[var(--border-subtle)] mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] flex-shrink-0 transition-transform hover:-rotate-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6"/>
              <path d="M10 21h4"/>
              <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3Z"/>
              <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none"/>
              <path d="M12 10.5v3"/>
            </svg>
          </div>
          {!isCollapsed && (
            <span className="text-[17px] font-extrabold tracking-tight font-display">
              Idea<span className="text-[var(--green)]">OS</span>
            </span>
          )}
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elev)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] z-10"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-2">
        <SidebarGroup className="p-0">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-2 py-4 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={cn(
                      "h-10 rounded-[10px] px-3 font-medium transition-all hover:bg-[var(--bg-hover)]",
                      pathname === item.url ? "bg-[var(--bg-elev)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="text-[13.5px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="p-0 mt-4">
            <SidebarGroupLabel className="px-2 py-2 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Recientes
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {recentIdeas.map((idea) => (
                  <SidebarMenuItem key={idea.id}>
                    <SidebarMenuButton className="h-10 rounded-[10px] px-3 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: idea.color }}
                        />
                        <span className="text-[13.5px]">{idea.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 mt-auto border-t border-[var(--border-subtle)] gap-4">
        {!isCollapsed && (
          <div className="flex flex-col gap-2">
            <div className="flex bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[8px] p-1 gap-1">
              <button 
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[5px] text-[10px] font-mono uppercase tracking-wider transition-all",
                  theme === 'dark' ? "bg-[var(--bg-base)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Moon className="h-3 w-3" />
                <span>Dark</span>
              </button>
              <button 
                onClick={() => setTheme('light')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[5px] text-[10px] font-mono uppercase tracking-wider transition-all",
                  theme === 'light' ? "bg-[var(--bg-base)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Sun className="h-3 w-3" />
                <span>Light</span>
              </button>
            </div>

            <div className="flex bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[8px] p-1 gap-1">
              <Link 
                href={pathname} 
                locale="es"
                className={cn(
                  "flex-1 flex items-center justify-center py-1.5 rounded-[5px] text-[10px] font-mono uppercase tracking-wider transition-all",
                  locale === 'es' ? "bg-[var(--bg-base)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                ES
              </Link>
              <Link 
                href={pathname} 
                locale="en"
                className={cn(
                  "flex-1 flex items-center justify-center py-1.5 rounded-[5px] text-[10px] font-mono uppercase tracking-wider transition-all",
                  locale === 'en' ? "bg-[var(--bg-base)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >
                EN
              </Link>
            </div>
          </div>
        )}

        <div className={cn(
          "flex items-center gap-3 p-2 rounded-[10px] transition-all hover:bg-[var(--bg-elev)] cursor-pointer",
          isCollapsed && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2a2a4a] to-[#1e1e3a] flex items-center justify-center text-[11px] font-mono font-medium text-[var(--text-primary)] flex-shrink-0">
            {user?.name?.substring(0, 2).toUpperCase() || '??'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-medium text-[var(--text-primary)] truncate">
                {user?.name}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                {user?.email}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
