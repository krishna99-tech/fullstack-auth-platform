"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { getPostById, updatePost, BlogError } from '@/lib/blog-client';
import { uploadImage } from '@/lib/upload-client';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function EditBlogPage() {
  useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getAccessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getAccessToken();
    if (!token) return;
    
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, token);
      setFeaturedImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    getPostById(id, token)
      .then((post) => {
        setTitle(post.title);
        setExcerpt(post.excerpt || '');
        setContent(post.content || '');
        setTags((post.tags || []).join(', '));
        setFeaturedImage(post.featuredImage || '');
        setCategory(post.category || '');
        setStatus(post.status);
        setSlug(post.slug);
      })
      .catch((err) => setError(err instanceof BlogError ? err.message : 'Failed to load post'))
      .finally(() => setLoading(false));
  }, [id, getAccessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updatePost(id, { title, excerpt, content, featuredImage, category, tags, status }, token);
      router.push('/dashboard/blogs');
    } catch (err) {
      setError(err instanceof BlogError ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/blogs" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-6 inline-block">
        ← Back to blogs
      </Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Edit post</h1>
        {status === 'published' && slug && (
          <a
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline shrink-0"
          >
            View live →
          </a>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>
      )}

      <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800 flex gap-4">
        <button
          onClick={() => setActiveTab('write')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'write' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
        >
          Write
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
        >
          Preview
        </button>
      </div>

      {activeTab === 'write' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
          <input className="input-field w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <input className="input-field w-full" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            className="input-field w-full min-h-[320px] resize-y font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Featured Image URL</label>
            <div className="flex gap-2">
              <input
                className="input-field w-full"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
              />
              <label className={`flex items-center justify-center shrink-0 px-3 border border-zinc-200 dark:border-[#333] rounded-lg bg-zinc-50 dark:bg-[#111] hover:bg-zinc-100 dark:hover:bg-[#222] transition-colors cursor-pointer ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : <ImageIcon className="w-4 h-4 text-zinc-500" />}
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              className="input-field w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Technology"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            className="input-field w-full"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="auth, tutorial, product (comma-separated)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="input-field w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      ) : (
        <div className="prose prose-zinc dark:prose-invert max-w-none bg-white dark:bg-[#0a0a0a] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-[400px]">
          {title ? <h1 className="text-3xl font-bold tracking-tight mb-4">{title}</h1> : <h1 className="text-3xl font-bold tracking-tight mb-4 text-zinc-300 dark:text-zinc-700">Post Title</h1>}
          {excerpt && <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-0 mb-6">{excerpt}</p>}
          
          {featuredImage && (
            <div className="mb-10 w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-[#333] bg-zinc-50 dark:bg-[#111]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt={title} className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          )}
          
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <p className="text-zinc-400 italic">No content yet...</p>
          )}
        </div>
      )}
    </div>
  );
}
