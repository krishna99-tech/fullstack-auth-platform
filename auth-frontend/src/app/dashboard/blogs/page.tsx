"use client";

import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function BlogsPage() {
  useAuthGuard();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Blogs</h1>
      <p className="text-sm text-zinc-500 mt-2">Blog management coming soon.</p>
    </div>
  );
}
