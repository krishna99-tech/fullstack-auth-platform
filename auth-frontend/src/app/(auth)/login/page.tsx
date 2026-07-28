"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SocialButton } from "@/components/base/buttons/social-button";
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  
  // MFA States
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'session_expired') {
      setError('Your session has expired. Please log in again.');
    } else if (err === 'oauth_failed') {
      setError('Social login failed. Please try again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsVerification(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          setNeedsVerification(true);
        }
        throw new Error(data.error || 'Failed to login');
      }

      if (data.mfaRequired) {
        setMfaRequired(true);
        setTempToken(data.tempToken);
        return;
      }

      // Store token (in a real app, prefer HttpOnly cookies or secure storage)
      localStorage.setItem('token', data.token);
      
      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {mfaRequired ? 'Enter your 2FA code to continue' : 'Sign in to your account to continue'}
      </p>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm flex flex-col gap-2">
          <span>{error}</span>
          {needsVerification && (
            <Link 
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Go to verification page &rarr;
            </Link>
          )}
        </div>
      )}
      
      {mfaRequired ? (
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
            onClick={() => { setMfaRequired(false); setMfaCode(''); }} 
            className="w-full mt-4 text-sm text-gray-500 hover:underline"
          >
            Cancel and go back
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <SocialButton href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`} social="google" theme="brand">
                Sign in with Google
              </SocialButton>
              <SocialButton href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`} social="github" theme="brand">
                Sign in with GitHub
              </SocialButton>
            </div>
          </div>
        </>
      )}

      {!mfaRequired && (
        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          Don't have an account? <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      )}
    </>
  );
}
