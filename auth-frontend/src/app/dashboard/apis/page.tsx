"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Webhook } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApisPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <EmptyState size="lg">
        <EmptyState.Header pattern="circle">
          <EmptyState.FeaturedIcon icon={Webhook} />
        </EmptyState.Header>
        
        <EmptyState.Content>
          <EmptyState.Title className="flex items-center justify-center gap-2">
            No APIs found
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">Beta</span>
          </EmptyState.Title>
          <EmptyState.Description>
            You haven't generated any API keys or connected any external services yet. Create your first API connection to get started.
          </EmptyState.Description>
        </EmptyState.Content>
        
        <EmptyState.Footer>
           <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-900 dark:hover:bg-zinc-100 font-medium text-sm transition-colors shadow-sm">
             Generate API Key
           </button>
        </EmptyState.Footer>
      </EmptyState>
    </div>
  );
}
