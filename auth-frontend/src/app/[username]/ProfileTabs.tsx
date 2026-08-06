'use client';

import React, { useState } from 'react';
import { User, BookOpen, FolderDot } from 'lucide-react';

interface ProfileTabsProps {
  about: React.ReactNode;
  articles: React.ReactNode;
  projects: React.ReactNode;
  articleCount: number;
  projectCount: number;
}

export default function ProfileTabs({ about, articles, projects, articleCount, projectCount }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'articles' | 'projects'>('about');

  return (
    <div className="w-full mt-8">
      <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'about' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
        >
          <User className="w-4 h-4" />
          About
        </button>
        
        {articleCount > 0 && (
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'articles' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            <BookOpen className="w-4 h-4" />
            Articles <span className="bg-zinc-100 dark:bg-zinc-800 text-xs px-1.5 py-0.5 rounded-full">{articleCount}</span>
          </button>
        )}

        {projectCount > 0 && (
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'projects' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            <FolderDot className="w-4 h-4" />
            Projects <span className="bg-zinc-100 dark:bg-zinc-800 text-xs px-1.5 py-0.5 rounded-full">{projectCount}</span>
          </button>
        )}
      </div>

      <div className="mt-6">
        {activeTab === 'about' && about}
        {activeTab === 'articles' && articles}
        {activeTab === 'projects' && projects}
      </div>
    </div>
  );
}
