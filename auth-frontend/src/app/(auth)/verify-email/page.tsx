"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [autoVerifying, setAutoVerifying] = useState(false);

  // AUTO-VERIFY: If both email and token come from the email link, verify immediately.
  useEffect(() => {
    if (emailParam && tokenParam) {
      setAutoVerifying(true);
      setLoading(true);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, token: tokenParam }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Verification failed');
          setMessage(data.message || 'Email verified successfully!');
        })
        .catch((err) => {
          setError(err.message);
          setAutoVerifying(false); // Fall back to manual form on error
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-verifying spinner (link clicked from email) ──────────────────────
  if (autoVerifying && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Verifying your email…</h2>
          <p className="text-muted-foreground text-sm">Just a moment, please don't close this page.</p>
        </div>
      </div>
    );
  }

  // ── Success state (auto or manual) ────────────────────────────────────────
  if (message) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-300">
            <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">You're verified!</h2>
          <p className="text-muted-foreground text-sm mb-8">{message}</p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full max-w-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl px-6 py-3 transition-all shadow-lg shadow-purple-500/20"
        >
          Go to Login →
        </Link>
      </div>
    );
  }

  // ── Manual entry form (no token in URL, or auto-verify failed) ────────────
  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Verify Email</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Enter the 6-digit code sent to your email
        {emailParam && <span className="font-medium text-foreground"> ({emailParam})</span>}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm flex gap-2 items-start">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!emailParam && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
            <input
              type="email"
              className="input-field bg-gray-900/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-muted-foreground mb-4 self-start">Verification Code</label>
          <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={token} onChange={setToken}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
              <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
              <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
              <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
              <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-6"
          disabled={loading || token.length !== 6}
        >
          {loading ? 'Verifying…' : 'Verify Account'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Didn't receive an email?{' '}
          <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
            Try signing up again
          </Link>
        </p>
      </form>
    </>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading verification…</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
