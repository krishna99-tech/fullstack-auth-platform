"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { listMyPosts, deletePost, BlogError, type BlogPostSummary } from '@/lib/blog-client';

export default function BlogsPage() {
  useAuthGuard();
  const router = useRouter();
  const { getAccessToken, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await listMyPosts(token);
      setPosts(data);
    } catch (err) {
      setError(err instanceof BlogError ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const token = getAccessToken();
    if (!token) return;
    setDeleting(id);
    try {
      await deletePost(id, token);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof BlogError ? err.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Blogs</h1>
          <p className="text-sm text-zinc-500 mt-1">Create and manage your blog posts.</p>
        </div>
        <Link
          href="/dashboard/blogs/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New post
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <p className="text-zinc-500 mb-4">You haven&apos;t written any posts yet.</p>
          <Link href="/dashboard/blogs/new" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-[#333] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-[#333]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden md:table-cell">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-zinc-100 dark:border-[#222] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px] sm:max-w-xs">{post.excerpt || '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                    {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-500 hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111]"
                          title="View live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/blogs/${post.id}/edit`)}
                        className="p-2 text-zinc-500 hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111]"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="p-2 text-zinc-500 hover:text-red-500 rounded-md hover:bg-red-500/10 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
