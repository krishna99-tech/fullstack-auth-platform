"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define dynamic content for the right panel based on the current route
  const getPanelContent = () => {
    switch (pathname) {
      case '/signup':
        return {
          title: 'Join the Future.',
          subtitle: 'Create your account today and unlock a world of seamless, secure access tailored just for you.',
          iconColor: 'text-purple-400',
          iconPath: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
        };
      case '/forgot-password':
      case '/reset-password':
        return {
          title: 'Secure Recovery.',
          subtitle: 'We employ enterprise-grade encryption to ensure you can safely regain access to your account in seconds.',
          iconColor: 'text-orange-400',
          iconPath: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
        };
      case '/verify-email':
        return {
          title: 'Verification.',
          subtitle: 'Check your inbox for the 6-digit code. We ensure your identity is protected from the very first step.',
          iconColor: 'text-green-400',
          iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        };
      case '/login':
      default:
        return {
          title: 'Authentication, Perfected.',
          subtitle: 'Welcome to the future of secure access. Enjoy lightning-fast logins, robust encryption, and a seamless user experience.',
          iconColor: 'text-blue-400',
          iconPath: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4',
        };
    }
  };

  const content = getPanelContent();

  return (
    <div className="min-h-screen flex w-full">
      
      {/* Left Side: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up">
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

    </div>
  );
}
