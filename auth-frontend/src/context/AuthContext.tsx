"use client";



import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import * as api from '@/lib/auth-backend-client';

import type { LoginResponse, Userinfo } from '@/lib/auth-backend-client';

import { tokens } from '@/lib/token-store';



interface AuthContextValue {

  user: Userinfo | null;

  loading: boolean;

  isAdmin: boolean;

  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<LoginResponse>;

  completeLogin: (token: string) => Promise<void>;

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



  const handleSessionExpired = useCallback(() => {

    tokens.clear();

    setUser(null);

    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {

      router.push('/login?error=session_expired');

    }

  }, [router]);



  useEffect(() => {

    api.setUnauthorizedHandler(handleSessionExpired);

    return () => api.setUnauthorizedHandler(() => {});

  }, [handleSessionExpired]);



  const refreshUser = useCallback(async () => {

    const access = tokens.getAccess();

    if (!access) {

      setUser(null);

      return;

    }

    try {

      const info = await api.getMe(access);

      setUser(info);

    } catch (err) {

      tokens.clear();

      setUser(null);

      if (err instanceof api.ApiError && err.status === 401) {

        handleSessionExpired();

      }

    }

  }, [handleSessionExpired]);



  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const urlToken = params.get('token') || params.get('access_token');

    if (urlToken) {

      tokens.set(urlToken, '');

      window.history.replaceState({}, document.title, window.location.pathname);

    }

    refreshUser().finally(() => setLoading(false));

  }, [refreshUser]);



  const completeLogin = useCallback(async (token: string) => {

    tokens.set(token, '');

    const info = await api.getMe(token);

    setUser(info);

  }, []);



  const login = useCallback(async (email: string, password: string) => {

    const data = await api.login(email, password);

    if ('mfaRequired' in data && data.mfaRequired) {

      return data;

    }

    await completeLogin((data as { token: string }).token);

    return data;

  }, [completeLogin]);



  const register = useCallback(async (email: string, password: string, name: string, username: string) => {

    await api.signup(email, password, name, username);

  }, []);



  const logout = useCallback(async () => {

    tokens.clear();

    setUser(null);

    router.push('/login');

  }, [router]);



  const value = useMemo<AuthContextValue>(

    () => ({

      user,

      loading,

      isAdmin: false,

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


