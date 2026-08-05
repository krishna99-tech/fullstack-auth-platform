"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthlogError, verifyMfaLogin } from '@/lib/authlog-client';
import { SocialAuthSection } from '@/components/auth/social-auth-section';

export default function Login() {
  const router = useRouter();
  const { login, completeLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    const registered = params.get('registered');
    const mfa = params.get('mfa');
    const token = params.get('token');
    if (err === 'session_expired') setError('Your session has expired. Please log in again.');
    if (err === 'oauth_failed') setError('Social sign-in failed. Try again or use email/password.');
    if (registered === '1') setSuccess('Account created. Sign in with your credentials.');
    if (mfa === '1' && token) {
      setMfaRequired(true);
      setTempToken(token);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if ('mfaRequired' in result && result.mfaRequired) {
        setMfaRequired(true);
        setTempToken(result.tempToken);
        return;
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof AuthlogError ? err.message : err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await verifyMfaLogin(tempToken, mfaCode);
      await completeLogin(data.access_token, data.refresh_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof AuthlogError ? err.message : 'Invalid MFA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {mfaRequired ? 'Enter your 2FA code' : 'Sign in to your account to continue'}
      </p>

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-600 dark:text-green-400 p-3 rounded mb-4 text-sm">{success}</div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {mfaRequired ? (
        <form onSubmit={handleMfa} className="space-y-5">
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
          <button type="submit" className="btn-primary w-full" disabled={loading || mfaCode.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button type="button" onClick={() => { setMfaRequired(false); setMfaCode(''); }} className="w-full text-sm text-gray-500 hover:underline">
            Cancel
          </button>
        </form>
      ) : (
        <>
          <SocialAuthSection mode="login" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input-field pr-11" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        Don&apos;t have an account? <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
      </p>
    </>
  );
}
