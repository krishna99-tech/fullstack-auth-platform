"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tokens } from '@/lib/token-store';

export function useAuthGuard() {
  const { loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !tokens.hasSession()) {
      router.push('/login');
      return;
    }
    if (!isAuthenticated && tokens.hasSession()) {
      refreshUser();
    }
  }, [loading, isAuthenticated, router, refreshUser]);

  return { loading, isAuthenticated };
}
