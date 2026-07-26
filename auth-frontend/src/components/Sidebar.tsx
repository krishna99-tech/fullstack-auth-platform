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
  User,
  Moon,
  Sun,
  Loader2
} from 'lucide-react';

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
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
];

const footerItems = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ email: string; id: string } | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setProfile(data);
        })
        .catch(console.error);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      router.push('/login');
    }, 600);
  };

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
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <Link href={item.href} className="w-full block">
                      <SidebarMenuButton render={<div />} isActive={isActive} tooltip={item.label} className="w-full cursor-pointer">
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {mounted && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                tooltip="Toggle Theme"
              >
                {theme === "dark" ? <Sun /> : <Moon />}
                <span>Toggle Theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {footerItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} className="w-full block">
                  <SidebarMenuButton render={<div />} isActive={isActive} tooltip={item.label} className="w-full cursor-pointer">
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
              {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
              <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {profile && (
            <SidebarMenuItem className="mt-4 border-t pt-4">
              <SidebarMenuButton tooltip={profile.email}>
                <User />
                <span className="truncate">{profile.email.split('@')[0]}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
