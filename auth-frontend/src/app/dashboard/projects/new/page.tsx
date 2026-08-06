"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { createProject, ProjectError, type ProjectInput } from '@/lib/project-client';
import { ProjectForm } from '@/components/project/project-form';

export default function NewProjectPage() {
  useAuthGuard();
  const router = useRouter();
  const { getAccessToken } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (data: ProjectInput) => {
    const token = getAccessToken();
    if (!token) return;
    setError('');
    try {
      const project = await createProject(data, token);
      router.push(`/dashboard/projects/${project.id}/edit`);
    } catch (err) {
      setError(err instanceof ProjectError ? err.message : 'Failed to create project');
      throw err;
    }
  };

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-6 inline-block">
        ← Back to projects
      </Link>
      <h1 className="text-2xl font-semibold mb-6">New project</h1>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <ProjectForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
