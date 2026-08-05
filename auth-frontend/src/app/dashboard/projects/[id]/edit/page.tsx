"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { getProjectById, updateProject, ProjectError } from '@/lib/project-client';

export default function EditProjectPage() {
  useAuthGuard();
  const params = useParams();
  const id = params.id as string;
  const { getAccessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    getProjectById(id, token)
      .then((project) => {
        setTitle(project.title);
        setExcerpt(project.excerpt || '');
        setContent(project.content || '');
        setProjectUrl(project.projectUrl || '');
        setStatus(project.status);
        setSlug(project.slug);
      })
      .catch((err) => setError(err instanceof ProjectError ? err.message : 'Failed to load project'))
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
      await updateProject(id, { title, excerpt, content, projectUrl, status }, token);
      setMessage('Project saved.');
    } catch (err) {
      setError(err instanceof ProjectError ? err.message : 'Failed to save');
    } finally {
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
      <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-6 inline-block">
        ← Back to projects
      </Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Edit project</h1>
        {status === 'published' && slug && (
          <a
            href={`/projects/${slug}`}
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
          <label className="block text-sm font-medium mb-1">Project URL</label>
          <input className="input-field w-full" type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="input-field w-full min-h-[320px] resize-y font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
