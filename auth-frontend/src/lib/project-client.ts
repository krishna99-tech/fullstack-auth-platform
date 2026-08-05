import { API_BASE } from './config';
import { tokens } from './token-store';

export class ProjectError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  projectUrl?: string;
  status?: 'draft' | 'published';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author: { name: string; username?: string };
}

export interface Project extends ProjectSummary {
  content: string;
  status: 'draft' | 'published';
  updatedAt: string;
}

export interface ProjectInput {
  title: string;
  content: string;
  excerpt?: string;
  projectUrl?: string;
  status?: 'draft' | 'published';
}

function projectUrl(path: string) {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}/projects${segment}`;
}

function authHeaders(token?: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ProjectError(data.error || res.statusText || 'Request failed', res.status);
  return data as T;
}

export async function listPublishedProjects(): Promise<ProjectSummary[]> {
  const res = await fetch(projectUrl('/'), { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects || [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const res = await fetch(projectUrl(`/slug/${encodeURIComponent(slug)}`), { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.project || null;
}

export async function listMyProjects(token?: string): Promise<ProjectSummary[]> {
  const access = token || tokens.getAccess();
  if (!access) throw new ProjectError('Not authenticated', 401);
  const res = await fetch(projectUrl('/mine'), { headers: authHeaders(access) });
  const data = await parseJson<{ projects: ProjectSummary[] }>(res);
  return data.projects;
}

export async function getProjectById(id: string, token?: string): Promise<Project> {
  const access = token || tokens.getAccess();
  if (!access) throw new ProjectError('Not authenticated', 401);
  const res = await fetch(projectUrl(`/${id}`), { headers: authHeaders(access) });
  const data = await parseJson<{ project: Project }>(res);
  return data.project;
}

export async function createProject(input: ProjectInput, token?: string): Promise<Project> {
  const access = token || tokens.getAccess();
  if (!access) throw new ProjectError('Not authenticated', 401);
  const res = await fetch(projectUrl('/'), {
    method: 'POST',
    headers: authHeaders(access),
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ project: Project }>(res);
  return data.project;
}

export async function updateProject(id: string, input: Partial<ProjectInput>, token?: string): Promise<Project> {
  const access = token || tokens.getAccess();
  if (!access) throw new ProjectError('Not authenticated', 401);
  const res = await fetch(projectUrl(`/${id}`), {
    method: 'PUT',
    headers: authHeaders(access),
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ project: Project }>(res);
  return data.project;
}

export async function deleteProject(id: string, token?: string): Promise<void> {
  const access = token || tokens.getAccess();
  if (!access) throw new ProjectError('Not authenticated', 401);
  const res = await fetch(projectUrl(`/${id}`), { method: 'DELETE', headers: authHeaders(access) });
  await parseJson(res);
}
