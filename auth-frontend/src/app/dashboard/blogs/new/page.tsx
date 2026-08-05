"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { createPost, BlogError } from '@/lib/blog-client';

export default function NewBlogPage() {
  useAuthGuard();
  const router = useRouter();
  const { getAccessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const post = await createPost({ title, excerpt, content, status }, token);
      router.push(`/dashboard/blogs/${post.id}/edit`);
    } catch (err) {
      setError(err instanceof BlogError ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/blogs" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-6 inline-block">
        ← Back to blogs
      </Link>
      <h1 className="text-2xl font-semibold mb-6">New post</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="input-field w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Post title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <input
            className="input-field w-full"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary (optional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            className="input-field w-full min-h-[240px] resize-y font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="input-field w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
          {loading ? 'Creating...' : 'Create post'}
        </button>
      </form>
    </div>
  );
}
