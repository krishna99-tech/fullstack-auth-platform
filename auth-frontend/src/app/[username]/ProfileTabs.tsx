'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, BookOpen, FolderDot } from 'lucide-react';

interface ProfileTabsProps {
  about: React.ReactNode;
  articles: React.ReactNode;
  projects: React.ReactNode;
  articleCount: number;
  projectCount: number;
}

type Tab = 'about' | 'articles' | 'projects';

export default function ProfileTabs({
  about,
  articles,
  projects,
  articleCount,
  projectCount,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [contentKey, setContentKey] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const tabs = useMemo(() => [
    { id: 'about'    as Tab, label: 'About',    icon: <User className="w-3.5 h-3.5" />, count: undefined,      show: true },
    { id: 'articles' as Tab, label: 'Articles', icon: <BookOpen className="w-3.5 h-3.5" />, count: articleCount, show: articleCount > 0 },
    { id: 'projects' as Tab, label: 'Projects', icon: <FolderDot className="w-3.5 h-3.5" />, count: projectCount, show: projectCount > 0 },
  ].filter((t) => t.show), [articleCount, projectCount]);

  // Measure and reposition the sliding indicator whenever active tab or tab list changes
  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[activeIndex];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    }
  }, [activeTab, tabs]);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setContentKey((k) => k + 1);
  };

  return (
    <div className="w-full mt-8">
      {/* Sliding pill tab bar */}
      <div
        className="relative flex items-center gap-0.5 p-1 bg-zinc-100 dark:bg-[#111] rounded-xl w-fit border border-zinc-200/80 dark:border-[#222]"
        style={{ isolation: 'isolate' }}
      >
        {/* Sliding background pill */}
        {indicator.ready && (
          <span
            aria-hidden
            className="absolute top-1 bottom-1 rounded-[10px] bg-white dark:bg-[#1c1c1c] shadow-sm border border-zinc-200 dark:border-[#2a2a2a] pointer-events-none z-0"
            style={{
              left: indicator.left,
              width: indicator.width,
              transition: 'left 220ms cubic-bezier(0.4,0,0.2,1), width 220ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        )}

        {tabs.map((tab, i) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => handleTabChange(tab.id)}
              className={[
                'relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-colors duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20',
                isActive
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300',
              ].join(' ')}
            >
              <span className={[
                'transition-colors duration-150',
                isActive ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500',
              ].join(' ')}>
                {tab.icon}
              </span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={[
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums transition-colors duration-150',
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    : 'bg-zinc-200/80 dark:bg-[#222] text-zinc-400 dark:text-zinc-500',
                ].join(' ')}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="mt-5 h-px bg-zinc-100 dark:bg-[#1a1a1a]" />

      {/* Content panel — slide up + fade in on tab change */}
      <div
        key={contentKey}
        className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {activeTab === 'about'    && about}
        {activeTab === 'articles' && articles}
        {activeTab === 'projects' && projects}
      </div>
    </div>
  );
}
