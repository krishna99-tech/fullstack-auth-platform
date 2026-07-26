"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RatingBadge } from "@/components/foundations/rating-badge";
import TrueFocus from '@/components/foundations/TrueFocus';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Interactive Cursor Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />
      
      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between p-6 max-w-7xl w-full mx-auto">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
          Platform
        </div>
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-4 py-2 font-medium transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary py-2 px-6 rounded-full">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 mt-20">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium tracking-wide">
          Authentication Perfected
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl text-gray-900 dark:text-white flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 flex-wrap">
          <span>Secure access,</span>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500">
            <TrueFocus 
              sentence="beautifully designed." 
              manualMode={false}
              blurAmount={4}
              borderColor="#8b5cf6"
              glowColor="rgba(139, 92, 246, 0.4)"
              animationDuration={1}
              pauseBetweenAnimations={1.5}
            />
          </div>
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          The ultimate authentication boilerplate. Powered by Next.js and Supabase. 
          Featuring seamless Google OAuth, custom HTML emails, and a stunning UI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mb-10">
          <Link href="/signup" className="btn-primary text-lg w-full rounded-xl py-4 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
            Start Building Free
          </Link>
        </div>

        <RatingBadge rating={5} title="Best Design Tool" subtitle="2,000+ reviews" className="animate-fade-in-up delay-200" />
      </main>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Secure by Default</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Industrial-grade encryption using bcrypt and JWTs to keep your users' data locked down.</p>
          </div>

          <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Custom Emails</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Send fully branded, beautiful Handlebars HTML emails for verifications and password resets.</p>
          </div>

          <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Seamless OAuth</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Integrate Google Sign-In with Passport.js for a frictionless 1-click onboarding experience.</p>
          </div>
        </div>
      </section>
      
      {/* Subtle footer */}
      <footer className="relative z-10 border-t border-zinc-200 dark:border-[#262626] py-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Premium Platform. All rights reserved.
      </footer>
    </div>
  );
}
