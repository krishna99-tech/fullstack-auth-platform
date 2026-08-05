/** auth-backend API base — must end with /api */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

/** Optional authlog stack for admin features */
export const AUTHLOG_API = (process.env.NEXT_PUBLIC_AUTHLOG_URL || '').replace(/\/$/, '');
export const LEGACY_API = API_BASE;
export const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'default';

export function authlogPath(path: string) {
  const segment = path.startsWith('/') ? path : `/${path}`;
  if (!AUTHLOG_API) return segment;
  if (segment.startsWith('/v1/')) return `${AUTHLOG_API}${segment}`;
  return `${AUTHLOG_API}/v1${segment}`;
}

export function hasLegacyApi() {
  return true;
}

export function hasAuthlog() {
  return AUTHLOG_API.length > 0;
}
