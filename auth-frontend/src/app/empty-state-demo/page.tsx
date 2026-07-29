"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { FolderPlus } from "lucide-react";

export default function EmptyStateDemoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      
      {/* 
        The root component wraps everything. 
        You can pass size="sm", "md", or "lg" 
      */}
      <EmptyState size="lg">
        
        {/* Header usually contains the icon/illustration */}
        <EmptyState.Header pattern="circle">
          <EmptyState.FeaturedIcon icon={FolderPlus} />
        </EmptyState.Header>
        
        {/* Content contains the text */}
        <EmptyState.Content>
          <EmptyState.Title>No projects found</EmptyState.Title>
          <EmptyState.Description>
            Your workspace is currently empty. Get started by creating a new project or importing an existing one.
          </EmptyState.Description>
        </EmptyState.Content>
        
        {/* Footer contains call-to-action buttons */}
        <EmptyState.Footer>
           <button className="px-4 py-2 bg-white dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium text-sm transition-colors shadow-sm">
             Learn more
           </button>
           <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-900 dark:hover:bg-zinc-100 font-medium text-sm transition-colors shadow-sm">
             Create Project
           </button>
        </EmptyState.Footer>

      </EmptyState>

    </div>
  );
}
