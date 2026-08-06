"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const filteredPosts = posts.filter((post) => {
    if (filterStatus && post.status !== filterStatus) return false;
    if (filterCategory && (post.category || '').toLowerCase() !== filterCategory.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!post.title.toLowerCase().includes(q) && !(post.excerpt || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / limit));

  const load = useCallback(async () => {
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
  }, [getAccessToken]);

  useEffect(() => {
    if (!authLoading) {
      setTimeout(() => load(), 0);
    }
  }, [authLoading, load]);

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
          <p className="text-sm text-zinc-500 mt-1">Create and manage your blog posts. Published posts appear on the public blog.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 dark:border-[#333] text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-[#111]"
          >
            View public blog →
          </a>
          <Link
            href="/dashboard/blogs/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New post
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
          <p className="mt-2 text-xs opacity-80">Tip: ensure NEXT_PUBLIC_API_URL ends with /Prod/api and you are logged in.</p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <p className="text-zinc-500 mb-4">You haven&apos;t written any posts yet.</p>
          <Link href="/dashboard/blogs/new" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full sm:w-64 border border-zinc-200 dark:border-[#333] rounded-lg px-3 py-2 text-sm bg-transparent"
            />
            <input
              type="text"
              placeholder="Filter by category..."
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field w-full sm:w-48 border border-zinc-200 dark:border-[#333] rounded-lg px-3 py-2 text-sm bg-transparent"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-full sm:w-40 border border-zinc-200 dark:border-[#333] rounded-lg px-3 py-2 text-sm bg-transparent"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="border border-zinc-200 dark:border-[#333] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-[#333]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden lg:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden md:table-cell">Updated</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody>
              {filteredPosts.slice((currentPage - 1) * limit, currentPage * limit).map((post) => (
                <tr key={post.id} className="border-b border-zinc-100 dark:border-[#222] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px] sm:max-w-xs">{post.excerpt || '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-zinc-600 dark:text-zinc-400">
                    {post.category || '—'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : post.status === 'archived' 
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {post.tags && post.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-[#111] text-zinc-500 whitespace-nowrap">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-[#111] text-zinc-400 whitespace-nowrap">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
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
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-200 dark:border-[#333] flex items-center justify-between bg-zinc-50/30 dark:bg-[#0a0a0a]/50">
              <p className="text-sm text-[#666]">
                Page <span className="font-medium text-black dark:text-white">{currentPage}</span> of <span className="font-medium text-black dark:text-white">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
