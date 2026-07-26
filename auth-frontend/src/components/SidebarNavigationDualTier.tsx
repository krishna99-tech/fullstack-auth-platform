"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Home,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  PieChart,
  Users,
  Grid,
  Package,
  CircleDollarSign,
  Inbox,
  Sparkles,
  Bell,
  TrendingUp,
  Star,
  Clock,
  UserSquare2,
  Settings,
  User,
  UserPlus,
  Archive,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  ChevronRight,
  PanelLeftClose
} from 'lucide-react';
import { FeaturedCardProgressCircle } from './FeaturedCardProgressCircle';

// Navigation Configuration
const navItems = [
  {
    label: "Home",
    href: "/dashboard/home",
    icon: Home,
    items: [
      { label: "Overview", href: "/dashboard/home/overview", icon: Grid },
      { label: "Products", href: "/dashboard/home/products", icon: Package },
      { label: "Orders", href: "/dashboard/home/orders", icon: CircleDollarSign },
      { label: "Customers", href: "/dashboard/home/customers", icon: Users },
      { label: "Inbox", href: "/dashboard/home/inbox", icon: Inbox, badge: 4 },
      { label: "What's new?", href: "/dashboard/home/whats-new", icon: Sparkles },
    ],
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    items: [
      { label: "Overview", href: "/dashboard", icon: Grid },
      { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: 10 },
      { label: "Saved reports", href: "/dashboard/saved-reports", icon: Star },
      { label: "Scheduled reports", href: "/dashboard/scheduled-reports", icon: Clock },
      { label: "User reports", href: "/dashboard/user-reports", icon: UserSquare2 },
      { label: "Manage notifications", href: "/dashboard/manage-notifications", icon: Settings },
    ],
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    items: [
      { label: "View all", href: "/dashboard/projects/all", icon: FolderKanban },
      { label: "Personal", href: "/dashboard/projects/personal", icon: User },
      { label: "Team", href: "/dashboard/projects/team", icon: Users },
      { label: "Shared with me", href: "/dashboard/projects/shared-with-me", icon: UserPlus },
      { label: "Archive", href: "/dashboard/projects/archive", icon: Archive },
    ],
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    badge: 10,
  },
  {
    label: "Reporting",
    href: "/dashboard/reporting",
    icon: PieChart,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
];

const footerItems = [
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function SidebarNavigationDualTier() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ email: string; id: string } | null>(null);
  
  // Track active primary nav item based on route
  const [activePrimaryId, setActivePrimaryId] = useState<string>("Dashboard");
  
  // Track secondary sidebar open state
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);
  
  // Track if feature card is dismissed
  const [showFeatureCard, setShowFeatureCard] = useState(true);

  useEffect(() => {
    // Initial profile fetch
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

  // Update active primary based on pathname
  useEffect(() => {
    // Basic active state logic
    if (pathname.includes('/settings')) setActivePrimaryId('Settings');
    else if (pathname.includes('/dashboard')) setActivePrimaryId('Dashboard');
    else if (pathname.includes('/projects')) setActivePrimaryId('Projects');
    else if (pathname.includes('/tasks')) setActivePrimaryId('Tasks');
    else if (pathname.includes('/reporting')) setActivePrimaryId('Reporting');
    else if (pathname.includes('/users')) setActivePrimaryId('Users');
    else if (pathname.includes('/support')) setActivePrimaryId('Support');
    else setActivePrimaryId('Home');
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const activePrimaryItem = navItems.find(item => item.label === activePrimaryId) || footerItems.find(item => item.label === activePrimaryId);
  const hasSubItems = activePrimaryItem && 'items' in activePrimaryItem && activePrimaryItem.items && activePrimaryItem.items.length > 0;
  const showSecondary = hasSubItems && isSecondaryOpen;

  return (
    <div className="flex h-screen bg-surface border-r border-surface-border">
      
      {/* PRIMARY TIER (Icons Only) */}
      <div className="w-[80px] flex flex-col items-center py-6 border-r border-surface-border bg-white dark:bg-[#111111] z-20">
        {/* Brand */}
        <div className="w-10 h-10 mb-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>

        {/* Primary Nav */}
        <div className="flex flex-col gap-3 flex-1 w-full px-3">
          {navItems.map((item) => {
            const isActive = activePrimaryId === item.label;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (activePrimaryId === item.label) {
                    if (item.items) setIsSecondaryOpen(!isSecondaryOpen);
                  } else {
                    setActivePrimaryId(item.label);
                    if (item.items) setIsSecondaryOpen(true);
                    else router.push(item.href);
                  }
                }}
                className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={item.label}
              >
                <Icon className={`w-6 h-6 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                
                {/* Badge Dot */}
                {item.badge && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#111111] rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Nav */}
        <div className="flex flex-col gap-3 w-full px-3 pb-4">
          <ThemeToggle />
          <div className="h-px w-8 bg-gray-200 dark:bg-gray-800 mx-auto my-2" />
          
          {footerItems.map((item) => {
            const isActive = activePrimaryId === item.label;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActivePrimaryId(item.label);
                  setIsSecondaryOpen(false); // Footer items typically don't have sub-items
                  router.push(item.href);
                }}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={item.label}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-6 h-6" />
          </button>

        </div>
      </div>

      {/* SECONDARY TIER (Sub-navigation) */}
      <div 
        className={`bg-gray-50 dark:bg-[#161616] flex flex-col transition-all duration-300 overflow-hidden ${
          showSecondary ? 'w-[280px] opacity-100 border-r border-surface-border' : 'w-0 opacity-0'
        }`}
      >
        <div className="px-6 h-20 flex items-center justify-between whitespace-nowrap">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {activePrimaryItem?.label}
          </h2>
          <button 
            onClick={() => setIsSecondaryOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {hasSubItems && 'items' in activePrimaryItem! && activePrimaryItem.items?.map((subItem) => {
            const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
            const SubIcon = subItem.icon;
            
            return (
              <Link
                key={subItem.label}
                href={subItem.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isSubActive
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <SubIcon className={`w-5 h-5 ${isSubActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  {subItem.label}
                </div>
                {subItem.badge && (
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {subItem.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Feature Card Area */}
        {showFeatureCard && hasSubItems && (
          <div className="p-4 mt-auto">
            <FeaturedCardProgressCircle
              title="Used space"
              description="Your team has used 80% of your available space. Need more?"
              confirmLabel="Upgrade plan"
              progress={80}
              onDismiss={() => setShowFeatureCard(false)}
              onConfirm={() => console.log('Upgrade plan clicked')}
            />
          </div>
        )}

        {/* Profile Area */}
        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase flex-shrink-0">
              {profile?.email ? profile.email.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile?.email ? profile.email.split('@')[0] : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile?.email || '...'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      
    </div>
  );
}
