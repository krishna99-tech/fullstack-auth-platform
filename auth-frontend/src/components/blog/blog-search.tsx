"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function BlogSearch({ tags }: { tags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    const tag = searchParams.get('tag');
    if (tag) params.set('tag', tag);
    router.push(`/blog${params.toString() ? `?${params}` : ''}`);
  };

  const setTag = (tag: string | null) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (tag) params.set('tag', tag);
    router.push(`/blog${params.toString() ? `?${params}` : ''}`);
  };

  const activeTag = searchParams.get('tag');

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={submit} className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Search posts..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="btn-primary px-4">Search</button>
      </form>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag(null)}
            className={`px-3 py-1 rounded-full text-xs border ${!activeTag ? 'bg-purple-600 text-white border-purple-600' : 'border-zinc-300 dark:border-zinc-700'}`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTag(tag)}
              className={`px-3 py-1 rounded-full text-xs border ${activeTag === tag ? 'bg-purple-600 text-white border-purple-600' : 'border-zinc-300 dark:border-zinc-700'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
