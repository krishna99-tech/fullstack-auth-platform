"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BlogsPage() {
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
          <EmptyState.FileTypeIcon type="file" />
        </EmptyState.Header>
        
        <EmptyState.Content>
          <EmptyState.Title className="flex items-center justify-center gap-2">
            No blog posts yet
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">Beta</span>
          </EmptyState.Title>
          <EmptyState.Description>
            You haven't written any blog posts. Start writing to share your thoughts with the world!
          </EmptyState.Description>
        </EmptyState.Content>
        
        <EmptyState.Footer>
           <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-900 dark:hover:bg-zinc-100 font-medium text-sm transition-colors shadow-sm">
             Write Post
           </button>
        </EmptyState.Footer>
      </EmptyState>
    </div>
  );
}
