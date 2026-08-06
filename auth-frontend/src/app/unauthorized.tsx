"use client";

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#000000] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-900/20">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          401 - Unauthorized
        </h1>
        
        <p className="text-zinc-500 dark:text-[#888] text-sm mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. Please log in with an authorized account to continue or contact your administrator.
        </p>
        
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <Link 
            href="/login"
            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 rounded-lg font-medium text-[14px] bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Go to Login
          </Link>
          <Link 
            href="/"
            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 rounded-lg font-medium text-[14px] border border-zinc-200 dark:border-[#333] text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors bg-white dark:bg-[#000]"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
