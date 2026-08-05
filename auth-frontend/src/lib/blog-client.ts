import { API_BASE } from './config';
import { tokens } from './token-store';

export class BlogError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface BlogAuthor {
  name: string;
  username?: string;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags?: string[];
  status?: 'draft' | 'published';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author: BlogAuthor;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  status: 'draft' | 'published';
  updatedAt: string;
}

export interface BlogPostInput {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string | string[];
  status?: 'draft' | 'published';
}

function blogUrl(path: string) {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}/blog${segment}`;
}

function authHeaders(token?: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BlogError(data.error || res.statusText || 'Request failed', res.status);
  return data as T;
}

/** Public — server-safe */
export async function listPublishedPosts(opts?: { q?: string; tag?: string }): Promise<BlogPostSummary[]> {
  const params = new URLSearchParams();
  if (opts?.q) params.set('q', opts.q);
  if (opts?.tag) params.set('tag', opts.tag);
  const qs = params.toString();
  const res = await fetch(blogUrl(qs ? `/?${qs}` : '/'), { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.posts || [];
}

/** Public — server-safe */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await fetch(blogUrl(`/slug/${encodeURIComponent(slug)}`), { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.post || null;
}

export async function listMyPosts(token?: string): Promise<BlogPostSummary[]> {
  const access = token || tokens.getAccess();
  if (!access) throw new BlogError('Not authenticated', 401);
  const res = await fetch(blogUrl('/mine'), { headers: authHeaders(access) });
  const data = await parseJson<{ posts: BlogPostSummary[] }>(res);
  return data.posts;
}

export async function getPostById(id: string, token?: string): Promise<BlogPost> {
  const access = token || tokens.getAccess();
  if (!access) throw new BlogError('Not authenticated', 401);
  const res = await fetch(blogUrl(`/${id}`), { headers: authHeaders(access) });
  const data = await parseJson<{ post: BlogPost }>(res);
  return data.post;
}

export async function createPost(input: BlogPostInput, token?: string): Promise<BlogPost> {
  const access = token || tokens.getAccess();
  if (!access) throw new BlogError('Not authenticated', 401);
  const res = await fetch(blogUrl('/'), {
    method: 'POST',
    headers: authHeaders(access),
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ post: BlogPost }>(res);
  return data.post;
}

export async function updatePost(id: string, input: Partial<BlogPostInput>, token?: string): Promise<BlogPost> {
  const access = token || tokens.getAccess();
  if (!access) throw new BlogError('Not authenticated', 401);
  const res = await fetch(blogUrl(`/${id}`), {
    method: 'PUT',
    headers: authHeaders(access),
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ post: BlogPost }>(res);
  return data.post;
}

export async function deletePost(id: string, token?: string): Promise<void> {
  const access = token || tokens.getAccess();
  if (!access) throw new BlogError('Not authenticated', 401);
  const res = await fetch(blogUrl(`/${id}`), { method: 'DELETE', headers: authHeaders(access) });
  await parseJson(res);
}

export function formatBlogDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
