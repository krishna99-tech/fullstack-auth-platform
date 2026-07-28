"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SocialButton } from "@/components/base/buttons/social-button";
import { CheckCircle2, XCircle, Loader2, User, AtSign, Eye, EyeOff } from 'lucide-react';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  // Derive auto-suggested username from name
  const suggestUsername = (fullName: string) => {
    return fullName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  // Debounced username check
  const checkUsername = useCallback(async (value: string) => {
    const clean = value.trim().toLowerCase();
    if (!clean) return setUsernameStatus('idle');

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (clean.length < 3 || clean.length > 20 || !usernameRegex.test(clean)) {
      return setUsernameStatus('invalid');
    }

    setUsernameStatus('checking');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-username?username=${encodeURIComponent(clean)}`);
      const data = await res.json();
      setUsernameStatus(data.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  // Auto-fill username when name is typed (only if user hasn't typed their own)
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
    setMessage('');

    if (usernameStatus === 'taken') {
      setError('That username is already taken. Please choose another.');
      setLoading(false);
      return;
    }
    if (usernameStatus === 'invalid') {
      setError('Username must be 3-20 characters, letters, numbers, and underscores only.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, username: username.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case 'checking': return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
      case 'available': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'taken': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'invalid': return <XCircle className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  const getUsernameHint = () => {
    switch (usernameStatus) {
      case 'available': return <span className="text-emerald-600 dark:text-emerald-400">✓ Username is available!</span>;
      case 'taken': return <span className="text-red-500">✗ Username is already taken</span>;
      case 'invalid': return <span className="text-amber-500">3–20 chars, letters, numbers, underscores only</span>;
      default: return <span className="text-gray-400">Choose a unique username (e.g. john_doe)</span>;
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Create an account</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Enter your details to get started</p>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              minLength={2}
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username <span className="text-amber-500">*</span>
          </label>
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
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {getUsernameIcon()}
            </span>
          </div>
          <p className="text-xs mt-1.5">{getUsernameHint()}</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email <span className="text-amber-500">*</span>
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-11"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
          <p className="text-xs text-gray-400 mt-1.5">At least 6 characters</p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-6"
          disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking'}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
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
            Sign up with Google
          </SocialButton>
          <SocialButton href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`} social="github" theme="brand">
            Sign up with GitHub
          </SocialButton>
        </div>
      </div>

      <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
      </p>
    </>
  );
}
