"use client";

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/auth-backend-client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await forgotPassword(email);
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
