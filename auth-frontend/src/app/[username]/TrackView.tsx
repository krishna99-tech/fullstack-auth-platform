"use client";
import { useEffect } from 'react';
import { LEGACY_API } from '@/lib/config';

export default function TrackView({ username }: { username: string }) {
  useEffect(() => {
    if (!LEGACY_API) return;
    fetch(`${LEGACY_API}/auth/analytics/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    }).catch(console.error);
  }, [username]);
  return null;
}
