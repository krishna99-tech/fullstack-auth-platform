"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as authlog from '@/lib/authlog-client';
import type { LoginResponse, Userinfo } from '@/lib/authlog-client';
import { tokens } from '@/lib/token-store';

interface AuthContextValue {
  user: Userinfo | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  completeLogin: (access: string, refresh: string) => Promise<void>;
  register: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Userinfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const access = tokens.getAccess();
    if (!access) {
      setUser(null);
      return;
    }
    try {
      const info = await authlog.getUserinfo(access);
      setUser(info);
    } catch {
      const refresh = tokens.getRefresh();
      if (refresh) {
        try {
          const data = await authlog.refreshTokens(refresh);
          tokens.set(data.access_token, data.refresh_token);
          const info = await authlog.getUserinfo(data.access_token);
          setUser(info);
          return;
        } catch {
          tokens.clear();
        }
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access =
      params.get('access_token') || params.get('token');
    const refresh = params.get('refresh_token') || '';
    if (access) {
      tokens.set(access, refresh);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const completeLogin = useCallback(async (access: string, refresh: string) => {
    tokens.set(access, refresh);
    const info = await authlog.getUserinfo(access);
    setUser(info);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authlog.login(email, password);
    if ('mfaRequired' in data && data.mfaRequired) {
      return data;
    }
    const tokens = data as Exclude<LoginResponse, { mfaRequired: true }>;
    await completeLogin(tokens.access_token, tokens.refresh_token);
    return data;
  }, [completeLogin]);

  const register = useCallback(async (email: string, password: string, name: string, username: string) => {
    await authlog.register(email, password, name, username);
  }, []);

  const logout = useCallback(async () => {
    const access = tokens.getAccess();
    if (access) {
      try {
        await authlog.logout(access);
      } catch {
        /* ignore */
      }
    }
    tokens.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.roles?.includes('admin') ?? false,
      isAuthenticated: !!user,
      login,
      completeLogin,
      register,
      logout,
      refreshUser,
      getAccessToken: () => tokens.getAccess(),
    }),
    [user, loading, login, completeLogin, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated && !tokens.hasSession()) {
      router.push('/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return auth;
}
