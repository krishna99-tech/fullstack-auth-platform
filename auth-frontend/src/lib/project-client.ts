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
  featuredImage?: string | null;
  technologies?: string[];
  projectType?: string | null;
  category?: string | null;
  tags?: string[];
  projectUrl?: string;
  githubUrl?: string;
  visibility?: 'private' | 'public';
  featured?: boolean;
  pinned?: boolean;
  views?: number;
  likes?: number;
  progress?: number;
  status?: 'planning' | 'development' | 'testing' | 'production' | 'maintenance' | 'archived' | 'draft' | 'published';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author: { name: string; username?: string };
}

export interface Project extends ProjectSummary {
  content: string;
  richSections?: Record<string, string>;
  
  logo?: string | null;
  gallery?: string[];
  videoDemo?: string | null;
  thumbnail?: string | null;

  features?: string[];
  screenshots?: string[];
  
  difficulty?: string | null;
  teamSize?: string | null;
  duration?: string | null;
  client?: string | null;
  company?: string | null;
  license?: string | null;
  
  startDate?: string | null;
  endDate?: string | null;
  
  documentationUrl?: string;
  apiDocsUrl?: string;
  downloadUrl?: string;
  
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  
  downloads?: number;
  stars?: number;
  forks?: number;
  comments?: number;
  
  attachments?: string[];
  
  status: 'planning' | 'development' | 'testing' | 'production' | 'maintenance' | 'archived' | 'draft' | 'published';
  updatedAt: string;
}

export interface ProjectInput extends Partial<Project> {
  title: string;
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

export async function getPublicProjectsByUsername(username: string): Promise<ProjectSummary[]> {
  const res = await fetch(projectUrl(`/user/${username}`), { cache: 'no-store' });
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
