'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';

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
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const t = useTranslations('Common');
  const pathname = usePathname();

  const items = [
    {
      title: t('dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('ideas'),
      url: '/dashboard', // Adjust as needed
      icon: Lightbulb,
    },
    {
      title: t('newIdea'),
      url: '/ideas/new',
      icon: PlusCircle,
    },
    {
      title: t('settings'),
      url: '/settings',
      icon: Settings,
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Lightbulb className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('title')}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          {/* User profile / Logout could go here */}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
