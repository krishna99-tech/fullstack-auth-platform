"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tempToken = searchParams.get('token');
  
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tempToken) {
      router.push('/login?error=invalid_mfa_session');
    }
  }, [tempToken, router]);

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-mfa-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: mfaCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid MFA code');
      }

      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Two-Factor Auth</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Enter the 6-digit code from your authenticator app to complete your login.
      </p>
      
      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleVerifyMfa} className="space-y-5 animate-fade-in-up">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">6-Digit Code</label>
          <input
            type="text"
            maxLength={6}
            className="input-field text-center tracking-widest font-mono text-2xl py-4"
            placeholder="000000"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary w-full mt-6" disabled={loading || mfaCode.length !== 6}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
        <button 
          type="button" 
          onClick={() => router.push('/login')} 
          className="w-full mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancel and go back
        </button>
      </form>
    </>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MfaForm />
    </Suspense>
  );
}
