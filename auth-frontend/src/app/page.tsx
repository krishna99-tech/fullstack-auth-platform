"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RatingBadge } from "@/components/foundations/rating-badge";
import TrueFocus from '@/components/foundations/TrueFocus';
import { FooterLarge01 } from '@/components/landing/footer';
import { NewsletterIPhoneMockup01 } from '@/components/landing/newsletter-mockup';
import { FeaturesAlternatingLayout01 } from '@/components/landing/features';

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

      <FeaturesAlternatingLayout01 />
      <NewsletterIPhoneMockup01 />
      
      <FooterLarge01 />
    </div>
  );
}
