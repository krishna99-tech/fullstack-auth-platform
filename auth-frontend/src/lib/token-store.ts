const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const LEGACY_KEY = 'token';

export const tokens = {
  getAccess(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY) || localStorage.getItem(LEGACY_KEY);
  },

  getRefresh(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.removeItem(LEGACY_KEY);
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(LEGACY_KEY);
  },

  hasSession(): boolean {
    return !!this.getAccess();
  },
};
