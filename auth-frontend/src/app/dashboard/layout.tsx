"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  Search, 
  ChevronsUpDown,
  Command,
  ShieldAlert,
  Bell,
  Code,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('user@acme.com');
  const [userName, setUserName] = useState<string>('User');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const user = data.user || data;
            setUserEmail(user.email || 'user@acme.com');
            setUserName(user.name || user.username || 'User');
          }
        } catch(e) {}
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    window.location.href = '/login';
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-white dark:bg-[#000000]">
      {/* Project Switcher */}
      <div className="px-4 py-4 md:py-6 flex items-center justify-between">
        <button className="flex-1 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-[#111] p-2 rounded-lg transition-colors border border-transparent">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 bg-white dark:bg-black text-black dark:text-white">
              <Code className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start truncate">
              <span className="text-sm font-semibold text-black dark:text-white truncate">Platform Inc</span>
              <span className="text-xs text-zinc-500 dark:text-[#888] truncate font-medium">Developer</span>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-zinc-400 shrink-0" />
        </button>
        {isMobile ? (
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="lg:hidden p-2 ml-2 text-zinc-500 hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        ) : (
          <button 
            onClick={() => setDesktopSidebarOpen(false)} 
            className="hidden lg:flex p-2 ml-2 text-zinc-500 hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors"
            title="Collapse Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-[14px] rounded-md transition-all duration-200 group",
                  isActive 
                    ? "bg-zinc-100/80 dark:bg-[#111] text-black dark:text-white font-medium" 
                    : "text-zinc-600 dark:text-[#888] hover:bg-zinc-100/50 dark:hover:bg-[#111]/50 hover:text-black dark:hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 mr-3 shrink-0 stroke-[1.5]",
                  isActive ? "text-black dark:text-white" : "text-zinc-400 dark:text-[#666] group-hover:text-black dark:group-hover:text-white"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>


    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-black dark:text-white flex font-sans selection:bg-cyan-300 selection:text-cyan-900 dark:selection:bg-cyan-900 dark:selection:text-cyan-50">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#000] border-r border-zinc-200 dark:border-zinc-800/50 z-50 flex flex-col"
            >
              <SidebarContent isMobile={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          width: desktopSidebarOpen ? 260 : 0, 
          opacity: desktopSidebarOpen ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-zinc-200 dark:border-[#333] shrink-0 bg-white dark:bg-[#000] overflow-hidden"
      >
        <div className="w-[260px] h-full flex flex-col">
          <SidebarContent isMobile={false} />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFAFA] dark:bg-[#000]">
        
        {/* Header - Shared between mobile & desktop for consistency */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1 -ml-1 text-zinc-500 hover:text-black dark:hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            {!desktopSidebarOpen && (
              <button 
                onClick={() => setDesktopSidebarOpen(true)} 
                className="hidden lg:flex p-1 -ml-2 text-zinc-500 hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors"
                title="Expand Sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
              </button>
            )}
            <nav className="flex text-sm font-medium text-zinc-500 dark:text-[#888] items-center">
              <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">Platform Inc</span>
              <span className="mx-2 text-zinc-300 dark:text-[#333]">/</span>
              <span className="text-black dark:text-white">
                {pathname.split('/').pop() === 'dashboard' ? 'Overview' : (pathname.split('/').pop() || '').charAt(0).toUpperCase() + (pathname.split('/').pop() || '').slice(1)}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex relative group items-center">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
                <input
                  type="text"
                  className="w-64 pl-9 pr-12 py-1.5 bg-zinc-100 dark:bg-[#111] border border-transparent dark:border-[#333] rounded-md text-sm text-black dark:text-white placeholder-zinc-500 dark:placeholder-[#666] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="Search..."
                />
                <div className="absolute right-2 flex items-center gap-1 border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded px-1.5 py-0.5">
                  <Command className="w-3 h-3 text-zinc-400 dark:text-[#666]" />
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-[#666]">K</span>
                </div>
             </div>
             {mounted && (
                <button 
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 text-zinc-500 dark:text-[#888] hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors border border-transparent"
                  title="Toggle Theme"
                >
                  {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
             <button className="p-1.5 text-zinc-500 dark:text-[#888] hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors border border-transparent">
              <Bell className="w-4 h-4" />
             </button>
             <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none ml-2">
                <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-gradient-to-tr from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center text-sm font-semibold text-black dark:text-white shrink-0 hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-[#333]">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-black dark:text-white">{userName}</p>
                      <p className="text-xs leading-none text-zinc-500 dark:text-[#888]">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-[#333]" />
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'} className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#111] focus:bg-zinc-100 dark:focus:bg-[#111]">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#111] focus:bg-zinc-100 dark:focus:bg-[#111] text-red-600 dark:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
             </DropdownMenu>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
}
