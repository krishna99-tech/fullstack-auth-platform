import { API_BASE } from './config';

import { tokens } from './token-store';



export class ApiError extends Error {

  status: number;

  needsVerification?: boolean;

  constructor(message: string, status = 400, needsVerification?: boolean) {

    super(message);

    this.status = status;

    this.needsVerification = needsVerification;

  }

}



export interface BackendUser {

  id: string;

  email: string;

  username?: string;

  name?: string;

  isVerified?: boolean;

  mfaEnabled?: boolean;

}



export interface UserProfile {

  id: string;

  email: string;

  username: string | null;

  name: string | null;

  phoneNumber: string | null;

  createdAt: string;

  isVerified: boolean;

  mfaEnabled?: boolean;

  googleConnected?: boolean;

  githubConnected?: boolean;

  emailNotifications?: boolean;

  isProfilePublic?: boolean;

  bio?: string;

  location?: string;

  website?: string;

  theme?: string;

  avatarUrl?: string;

  socialLinks?: { github?: string; twitter?: string; linkedin?: string };

  customLinks?: { title: string; url: string }[];

  publishedBlogCount?: number;

}



export interface Userinfo {

  sub: string;

  email: string;

  email_verified: boolean;

  name?: string;

  username?: string;

  roles: string[];

  mfa_enabled?: boolean;

  google_connected?: boolean;

  github_connected?: boolean;

}



export type LoginResponse =

  | { mfaRequired: true; tempToken: string }

  | { token: string; user: BackendUser };



let onUnauthorized: (() => void) | null = null;



export function setUnauthorizedHandler(handler: () => void) {

  onUnauthorized = handler;

}



function apiPath(path: string) {

  const segment = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE}${segment}`;

}



function authHeaders(token?: string): HeadersInit {

  return {

    'Content-Type': 'application/json',

    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}



function handleUnauthorized(status: number) {

  if (status === 401 && onUnauthorized) {

    onUnauthorized();

  }

}



async function parseJson<T>(res: Response): Promise<T> {

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {

    handleUnauthorized(res.status);

    throw new ApiError(

      data.error || res.statusText || 'Request failed',

      res.status,

      data.needsVerification

    );

  }

  return data as T;

}



async function authFetch(path: string, init: RequestInit = {}, token?: string): Promise<Response> {

  const accessToken = token ?? tokens.getAccess() ?? undefined;

  const res = await fetch(apiPath(path), {

    ...init,

    headers: { ...authHeaders(accessToken), ...(init.headers as Record<string, string>) },

  });

  if (res.status === 401) {

    handleUnauthorized(401);

  }

  return res;

}



export async function login(email: string, password: string): Promise<LoginResponse> {

  const res = await fetch(apiPath('/auth/login'), {

    method: 'POST',

    headers: authHeaders(),

    body: JSON.stringify({ email, password }),

  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {

    throw new ApiError(data.error || 'Login failed', res.status, data.needsVerification);

  }

  if (data.mfaRequired) {

    return { mfaRequired: true, tempToken: data.tempToken };

  }

  return data as { token: string; user: BackendUser };

}



export async function verifyMfaLogin(tempToken: string, code: string) {

  const res = await fetch(apiPath('/auth/verify-mfa-login'), {

    method: 'POST',

    headers: authHeaders(),

    body: JSON.stringify({ tempToken, code }),

  });

  return parseJson<{ token: string; user: BackendUser }>(res);

}



export async function signup(email: string, password: string, name: string, username: string) {

  const res = await fetch(apiPath('/auth/signup'), {

    method: 'POST',

    headers: authHeaders(),

    body: JSON.stringify({ email, password, name, username }),

  });

  return parseJson<{ message: string }>(res);

}



export async function checkUsername(username: string) {

  const res = await fetch(apiPath(`/auth/check-username?username=${encodeURIComponent(username)}`));

  return parseJson<{ available: boolean; reason?: string }>(res);

}



export async function verifyEmail(email: string, token: string) {

  const res = await fetch(apiPath('/auth/verify'), {

    method: 'POST',

    headers: authHeaders(),

    body: JSON.stringify({ email, token }),

  });

  return parseJson<{ message: string }>(res);

}



export async function resendVerificationPublic(email: string) {

  const res = await fetch(apiPath('/auth/resend-verification-public'), {

    method: 'POST',

    headers: authHeaders(),

    body: JSON.stringify({ email }),

  });

  return parseJson<{ message: string }>(res);

}



export async function forgotPassword(email: string) {

  const res = await fetch(apiPath('/auth/forgot-password'), {

    method: 'POST',

    headers: authHeaders(),

    body: JSON.stringify({ email }),

  });

  return parseJson<{ message: string }>(res);

}



export async function resetPassword(email: string, token: string, newPassword: string) {

  const res = await fetch(apiPath('/auth/reset-password'), {

    method: 'POST',

    headers: authHeaders(),

    body: JSON.stringify({ email, token, newPassword }),

  });

  return parseJson<{ message: string }>(res);

}



export async function getProfile(token?: string): Promise<UserProfile> {

  const res = await authFetch('/auth/me', {}, token);

  const data = await parseJson<UserProfile | { user: UserProfile }>(res);

  return 'user' in data && data.user ? data.user : (data as UserProfile);

}



export async function getMe(token: string) {

  const profile = await getProfile(token);

  return {

    sub: String(profile.id),

    email: String(profile.email),

    email_verified: !!profile.isVerified,

    name: profile.name as string | undefined,

    username: profile.username as string | undefined,

    roles: [] as string[],

    mfa_enabled: !!profile.mfaEnabled,

    google_connected: !!profile.googleConnected,

    github_connected: !!profile.githubConnected,

  } satisfies Userinfo;

}



export async function updateProfile(

  updates: Partial<Pick<UserProfile, 'name' | 'username' | 'email' | 'phoneNumber' | 'bio' | 'location' | 'website' | 'socialLinks' | 'customLinks' | 'theme' | 'avatarUrl'>>,

  token?: string

) {

  const res = await authFetch('/auth/profile', {

    method: 'PUT',

    body: JSON.stringify(updates),

  }, token);

  return parseJson<{ message: string; user: UserProfile }>(res);

}



export async function updatePreferences(

  prefs: { emailNotifications?: boolean; isProfilePublic?: boolean; accentColor?: string },

  token?: string

) {

  const res = await authFetch('/auth/preferences', {

    method: 'PATCH',

    body: JSON.stringify(prefs),

  }, token);

  return parseJson<{ message: string; emailNotifications?: boolean; isProfilePublic?: boolean }>(res);

}



export async function changePassword(currentPassword: string, newPassword: string, token?: string) {

  const res = await authFetch('/auth/change-password', {

    method: 'POST',

    body: JSON.stringify({ currentPassword, newPassword }),

  }, token);

  return parseJson<{ message: string }>(res);

}



export async function resendVerification(token?: string) {

  const res = await authFetch('/auth/resend-verification', { method: 'POST' }, token);

  return parseJson<{ message: string }>(res);

}



export async function disconnectProvider(provider: 'google' | 'github', token?: string) {

  const res = await authFetch(`/auth/providers/${provider}`, { method: 'DELETE' }, token);

  return parseJson<{ message: string }>(res);

}



export async function deleteAccount(token?: string) {

  const res = await authFetch('/auth/me', { method: 'DELETE' }, token);

  return parseJson<{ message: string }>(res);

}



export function socialAuthUrl(provider: 'google' | 'github', linkToken?: string) {

  const params = linkToken ? `?token=${encodeURIComponent(linkToken)}` : '';

  return apiPath(`/auth/${provider}${params}`);

}



export function getSocialStatus() {

  return fetch(apiPath('/auth/social/status'))

    .then((res) => (res.ok ? res.json() : { google: false, github: false }))

    .catch(() => ({ google: false, github: false }));

}



export async function setupMfa(token: string) {

  const res = await authFetch('/auth/mfa/setup', { method: 'POST' }, token);

  return parseJson<{ qrCodeUrl: string; secret: string }>(res);

}



export async function verifyMfa(token: string, code: string) {

  const res = await authFetch('/auth/mfa/verify', {

    method: 'POST',

    body: JSON.stringify({ token: code }),

  }, token);

  return parseJson<{ message: string }>(res);

}



export async function disableMfa(token: string, code: string) {

  const res = await authFetch('/auth/mfa/disable', {

    method: 'POST',

    body: JSON.stringify({ token: code }),

  }, token);

  return parseJson<{ message: string }>(res);

}



export async function listSessions(token: string) {

  const res = await authFetch('/auth/sessions', {}, token);

  const data = await parseJson<{ sessions: Array<{ id: string; device: string; ipAddress: string; lastActive: string; isCurrent: boolean }> } | Array<{ id: string; device: string; ipAddress: string; lastActive: string; isCurrent: boolean }>>(res);

  const sessions = Array.isArray(data) ? data : data.sessions;

  return { sessions: sessions || [] };

}



export async function revokeSession(token: string, sessionId: string) {

  const res = await authFetch(`/auth/sessions/${sessionId}`, { method: 'DELETE' }, token);

  return parseJson<{ message: string }>(res);

}



export async function revokeOtherSessions(token: string) {

  const res = await authFetch('/auth/sessions/others', { method: 'DELETE' }, token);

  return parseJson<{ message: string }>(res);

}



export async function backendFetch(path: string, init: RequestInit = {}) {

  const token = tokens.getAccess();

  if (!token) throw new ApiError('Not authenticated', 401);

  const res = await authFetch(path, init, token);

  if (res.status === 401) {

    throw new ApiError('Session expired', 401);

  }

  return res;

}



/** Map login page ?error= query values to user-facing messages. */

export const LOGIN_ERROR_MESSAGES: Record<string, string> = {

  session_expired: 'Your session has expired. Please log in again.',

  oauth_failed: 'Social sign-in failed. Try again or use email/password.',

  oauth_denied: 'Sign-in was cancelled. You can try again when ready.',

  oauth_link_failed: 'Could not link your social account. Please try again from Settings.',

  invalid_mfa_session: 'Your two-factor session expired. Please sign in again.',

  rate_limited: 'Too many attempts. Please wait a minute and try again.',

};


