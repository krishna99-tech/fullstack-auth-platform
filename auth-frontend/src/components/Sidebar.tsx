"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  ShieldCheck,
  LogOut,
  Loader2,
  FolderPlus,
  Users,
  FileText,
  Webhook,
  Building2,
  ScrollText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: Users, adminOnly: true },
  { label: "Audit Log", href: "/dashboard/audit", icon: ScrollText },
  { label: "Projects", href: "/dashboard/projects", icon: FolderPlus },
  { label: "Organization", href: "/dashboard/organization", icon: Building2, adminOnly: true },
  { label: "Blogs", href: "/dashboard/blogs", icon: FileText },
  { label: "APIs", href: "/dashboard/apis", icon: Webhook },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
];

const footerItems = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => logout(), 300);
  };

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex items-center justify-center py-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton isActive={isActive} render={<Link href={item.href} />}>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton render={<Link href={item.href} />}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {mounted && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <span className="text-xs">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>{user?.email || 'Sign out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
