"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, AtSign, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError, checkUsername } from '@/lib/auth-backend-client';
import { SocialAuthSection } from '@/components/auth/social-auth-section';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function Signup() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  const suggestUsername = (fullName: string) =>
    fullName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  const runUsernameCheck = useCallback(async (value: string) => {
    const clean = value.trim().toLowerCase();
    if (!clean) return setUsernameStatus('idle');
    if (clean.length < 3 || clean.length > 20 || !/^[a-z0-9_]+$/.test(clean)) {
      return setUsernameStatus('invalid');
    }
    setUsernameStatus('checking');
    try {
      const data = await checkUsername(clean);
      setUsernameStatus(data.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runUsernameCheck(username), 500);
    return () => clearTimeout(timer);
  }, [username, runUsernameCheck]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === suggestUsername(name)) {
      setUsername(suggestUsername(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      setLoading(false);
      return;
    }
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      setError('Please choose a valid, available username');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, name.trim() || email.split('@')[0], username.trim().toLowerCase());
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const usernameIcon = () => {
    switch (usernameStatus) {
      case 'checking': return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
      case 'available': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'taken': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'invalid': return <XCircle className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Create an account</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Enter your details to get started</p>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

      <SocialAuthSection mode="signup" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input type="text" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required minLength={2} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username *</label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              placeholder="user_name"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              minLength={3}
              maxLength={20}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{usernameIcon()}</span>
          </div>
          <p className="text-xs mt-1.5 text-gray-400">3–20 chars, letters, numbers, underscores. Used for your public profile URL.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
          <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className="input-field pr-11" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">At least 12 characters</p>
        </div>

        <button type="submit" className="btn-primary w-full mt-6" disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking'}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
      </p>
    </>
  );
}
