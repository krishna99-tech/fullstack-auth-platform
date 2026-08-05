import { AUTHLOG_API, TENANT_SLUG, authlogPath } from './config';
import { tokens } from './token-store';

export class AuthlogError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface AuthlogUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  roles?: string[];
  status?: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt?: string;
}

export interface Userinfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  username?: string;
  tenant_id: string;
  roles: string[];
  mfa_enabled?: boolean;
  google_connected?: boolean;
  github_connected?: boolean;
}

export type LoginResponse =
  | { mfaRequired: true; tempToken: string }
  | {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      user: AuthlogUser;
    };

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  tenantId: string;
  action: string;
  actor: { type: string; id: string; email?: string; ip?: string; user_agent?: string };
  resource?: { type: string; id: string } | null;
  target?: { type: string; id: string } | null;
  outcome: string;
  metadata?: Record<string, unknown>;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tier: string;
  createdAt: string;
}

function buildHeaders(accessToken?: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT_SLUG,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new AuthlogError(data.error || res.statusText || 'Request failed', res.status);
  }
  return data as T;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new AuthlogError(data.error || res.statusText || 'Request failed', res.status);
  }
  if (data.mfaRequired) {
    return { mfaRequired: true as const, tempToken: data.tempToken };
  }
  return data as Exclude<LoginResponse, { mfaRequired: true }>;
}

export async function verifyMfaLogin(tempToken: string, code: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/verify-mfa-login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ temp_token: tempToken, code }),
  });
  return parseResponse<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: AuthlogUser;
  }>(res);
}

export async function checkUsername(username: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/check-username?username=${encodeURIComponent(username)}`, {
    headers: buildHeaders(),
  });
  return parseResponse<{ available: boolean; reason?: string }>(res);
}

export async function register(email: string, password: string, name: string, username: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/register`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password, name, username }),
  });
  return parseResponse<{ user: AuthlogUser }>(res);
}

export async function getPublicProfile(username: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/users/public/${encodeURIComponent(username)}`, {
    headers: buildHeaders(),
  });
  return parseResponse<Record<string, unknown>>(res);
}

export async function setupMfa(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/mfa/setup`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ qrCodeUrl: string; secret: string }>(res);
}

export async function verifyMfa(accessToken: string, code: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/mfa/verify`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ code }),
  });
  return parseResponse<{ message: string }>(res);
}

export async function disableMfa(accessToken: string, code: string, password: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/mfa/disable`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ code, password }),
  });
  return parseResponse<{ message: string }>(res);
}

export async function getSocialStatus() {
  const res = await fetch(authlogPath('/auth/social/status'), {
    headers: buildHeaders(),
  });
  return parseResponse<{ google: boolean; github: boolean }>(res);
}

export function socialAuthUrl(provider: 'google' | 'github', linkToken?: string) {
  const params = new URLSearchParams({ tenant: TENANT_SLUG });
  if (linkToken) params.set('link_token', linkToken);
  return `${authlogPath(`/auth/${provider}`)}?${params.toString()}`;
}

export interface OAuthClient {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  isPublic: boolean;
  createdAt: string;
}

export async function listOAuthClients(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/clients`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ clients: OAuthClient[] }>(res);
}

export async function createOAuthClient(
  accessToken: string,
  payload: { name: string; redirect_uris: string[]; is_public?: boolean }
) {
  const res = await fetch(`${AUTHLOG_API}/v1/clients`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return parseResponse<{ client: OAuthClient & { clientSecret?: string } }>(res);
}

export interface IdPConnection {
  id: string;
  name: string;
  type: 'saml' | 'oidc';
  enabled: boolean;
  createdAt: string;
}

export async function listIdPConnections(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/federation/connections`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ connections: IdPConnection[] }>(res);
}

export async function createIdPConnection(
  accessToken: string,
  payload: { name: string; type: 'saml' | 'oidc'; config?: Record<string, unknown> }
) {
  const res = await fetch(`${AUTHLOG_API}/v1/federation/connections`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return parseResponse<{ connection: IdPConnection }>(res);
}

export async function revokeSession(accessToken: string, sessionId: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ message: string }>(res);
}

export async function revokeOtherSessions(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/sessions/others`, {
    method: 'DELETE',
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ message: string }>(res);
}

export async function listSessions(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/sessions`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ sessions: Array<{ id: string; device: string; ipAddress: string; lastActive: string; isCurrent: boolean }> }>(res);
}

export async function refreshTokens(refreshToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/token`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return parseResponse<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }>(res);
}

export async function logout(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/logout`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ message: string }>(res);
}

export async function getUserinfo(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/auth/userinfo`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<Userinfo>(res);
}

export async function listUsers(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/users`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ users: AuthlogUser[] }>(res);
}

export async function assignRole(accessToken: string, userId: string, role: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/users/${userId}/roles`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ role }),
  });
  return parseResponse<{ user: { id: string; roles: string[] } }>(res);
}

export async function listTenants(accessToken: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/tenants`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ tenants: Tenant[] }>(res);
}

export async function createTenant(accessToken: string, slug: string, name: string, tier?: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/tenants`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ slug, name, tier }),
  });
  return parseResponse<{ tenant: Tenant }>(res);
}

export async function getTenantBySlug(accessToken: string, slug: string) {
  const res = await fetch(`${AUTHLOG_API}/v1/tenants/${slug}`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<Tenant>(res);
}

export async function listAuditEvents(accessToken: string, params?: { action?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.action) query.set('action', params.action);
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  const res = await fetch(`${AUTHLOG_API}/v1/audit/events${qs ? `?${qs}` : ''}`, {
    headers: buildHeaders(accessToken),
  });
  return parseResponse<{ events: AuditEvent[] }>(res);
}

/** Authenticated fetch with auto-refresh on 401 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const access = tokens.getAccess();
  if (!access) throw new AuthlogError('Not authenticated', 401);

  const url = path.startsWith('http') ? path : `${AUTHLOG_API}${path}`;
  const headers = { ...buildHeaders(access), ...(init.headers as Record<string, string>) };

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    const refresh = tokens.getRefresh();
    if (refresh) {
      try {
        const data = await refreshTokens(refresh);
        tokens.set(data.access_token, data.refresh_token);
        const retryHeaders = { ...buildHeaders(data.access_token), ...(init.headers as Record<string, string>) };
        res = await fetch(url, { ...init, headers: retryHeaders });
      } catch {
        tokens.clear();
        throw new AuthlogError('Session expired', 401);
      }
    }
  }

  return res;
}
