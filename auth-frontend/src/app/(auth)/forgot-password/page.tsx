"use client";

import { useState } from 'react';
import Link from 'next/link';
import { LEGACY_API } from '@/lib/config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!LEGACY_API) {
      setError('Password reset is not yet available on authlog. Coming in Phase 1.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${LEGACY_API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setMessage(data.message);
      setEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Enter your email and we&apos;ll send you a reset link
      </p>

      {!LEGACY_API && (
        <div className="bg-amber-500/10 border border-amber-500 text-amber-700 dark:text-amber-400 p-3 rounded mb-4 text-sm">
          Password reset via authlog is planned for Phase 1. Configure NEXT_PUBLIC_LEGACY_API_URL for the legacy backend.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded mb-4 text-sm">
          {message}
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        Remembered your password? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
      </p>
    </>
  );
}
