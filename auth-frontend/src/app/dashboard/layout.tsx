"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import NavigationDock from '@/components/NavigationDock';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPanelContent = () => {
    switch (pathname) {
      case '/dashboard/settings':
        return {
          title: 'Account Control.',
          subtitle: 'Manage your preferences, security, and sessions with ease.',
          iconColor: 'text-purple-400',
          iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        };
      case '/dashboard/analytics':
        return {
          title: 'Data Insights.',
          subtitle: 'Visualize your progress and understand your account activity at a glance.',
          iconColor: 'text-blue-400',
          iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        };
      case '/dashboard':
      default:
        return {
          title: 'Command Center.',
          subtitle: 'Welcome to your dashboard. Stay on top of your sessions and security status.',
          iconColor: 'text-emerald-400',
          iconPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
        };
    }
  };

  const content = getPanelContent();

  return (
    <div className="min-h-screen flex w-full relative">
      
      {/* Left Side: Main Content */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto pb-24">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </div>

      {/* Right Side: Branding/Graphic (Hidden on Mobile) - Always Dark */}
      <div className="dark hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-zinc-950 text-white border-l border-zinc-900">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgo8L3N2Zz4=')] opacity-50" />

        {/* Content */}
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-block p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-2xl">
            <svg className={`w-16 h-16 ${content.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={content.iconPath} />
            </svg>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
            {content.title.split(', ').length > 1 ? (
              <>
                {content.title.split(', ')[0]}, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {content.title.split(', ')[1]}
                </span>
              </>
            ) : (
              content.title
            )}
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            {content.subtitle}
          </p>
        </div>
      </div>
      
      <NavigationDock />
    </div>
  );
}
