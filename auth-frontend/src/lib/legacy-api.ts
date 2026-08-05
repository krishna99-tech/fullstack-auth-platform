import { hasLegacyApi, LEGACY_API } from './config';
import { tokens } from './token-store';

export { hasLegacyApi };

/** Optional legacy auth-backend (profiles, MFA, settings). Set NEXT_PUBLIC_LEGACY_API_URL to enable. */
export async function legacyFetch(path: string, init: RequestInit = {}): Promise<Response | null> {
  if (!hasLegacyApi()) return null;

  const token = tokens.getAccess();
  const url = `${LEGACY_API}${path.startsWith('/') ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string>),
    },
  });
}

export async function legacyGetProfile() {
  const res = await legacyFetch('/auth/me');
  if (!res?.ok) return null;
  const data = await res.json();
  return data.user || data;
}

export async function legacyGetSessions() {
  const res = await legacyFetch('/auth/sessions');
  if (!res?.ok) return [];
  const data = await res.json();
  return data.sessions || data || [];
}

export async function legacyGetProfileStats() {
  const res = await legacyFetch('/auth/analytics/profile');
  if (!res?.ok) return null;
  return res.json();
}

export async function legacyGetSecurityLogs(page = 1, limit = 5) {
  const res = await legacyFetch(`/auth/analytics?page=${page}&limit=${limit}`);
  if (!res?.ok) return null;
  return res.json();
}

export async function legacyGetPublicProfile(username: string) {
  if (!hasLegacyApi()) return null;
  const res = await fetch(`${LEGACY_API}/auth/user/${username}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
