"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { getProjectById, updateProject, ProjectError, type Project, type ProjectInput } from '@/lib/project-client';
import { ProjectForm } from '@/components/project/project-form';

export default function EditProjectPage() {
  useAuthGuard();
  const params = useParams();
  const id = params.id as string;
  const { getAccessToken } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    getProjectById(id, token)
      .then(setProject)
      .catch((err) => setError(err instanceof ProjectError ? err.message : 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id, getAccessToken]);

  const handleSubmit = async (data: ProjectInput) => {
    const token = getAccessToken();
    if (!token) return;
    setError('');
    setMessage('');
    try {
      await updateProject(id, data, token);
      setMessage('Project saved successfully.');
    } catch (err) {
      setError(err instanceof ProjectError ? err.message : 'Failed to save');
      throw err;
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
    <div className="max-w-4xl">
      <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-6 inline-block">
        ← Back to projects
      </Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Edit project</h1>
        {project?.status === 'published' && project?.slug && (
          <a
            href={`/projects/${project.slug}`}
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

      {project && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <ProjectForm initialData={project} onSubmit={handleSubmit} isEditing={true} />
        </div>
      )}
    </div>
  );
}
