"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { LayoutDashboard, TrendingUp, Settings, LogOut, Moon, Sun } from 'lucide-react';
import Dock from '@/components/foundations/Dock';

export default function NavigationDock() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const items = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', onClick: () => router.push('/dashboard') },
    { icon: <TrendingUp size={22} />, label: 'Analytics', onClick: () => router.push('/dashboard/analytics') },
    { icon: <Settings size={22} />, label: 'Settings', onClick: () => router.push('/dashboard/settings') },
    { 
      icon: mounted && theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />, 
      label: 'Toggle Theme', 
      onClick: () => setTheme(theme === "dark" ? "light" : "dark") 
    },
    { icon: <LogOut size={22} className="text-red-400" />, label: 'Sign Out', onClick: handleLogout },
  ];

  return (
    <Dock 
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
    />
  );
}
