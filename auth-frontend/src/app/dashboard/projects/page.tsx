"use client";

import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function ProjectsPage() {
  useAuthGuard();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-sm text-zinc-500 mt-2">Project management coming soon.</p>
    </div>
  );
}
