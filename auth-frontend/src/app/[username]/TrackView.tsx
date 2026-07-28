"use client";
import { useEffect } from 'react';

export default function TrackView({ username }: { username: string }) {
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    }).catch(console.error);
  }, [username]);
  return null;
}
