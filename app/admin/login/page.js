'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CLINIC } from '@/src/lib/constants';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to sign in.');
        return;
      }

      const from = searchParams.get('from') || '/admin';
      router.push(from);
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-soft"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8 2 5 4.8 5 9c0 3.2 1.4 5 2.1 8.4.3 1.5.6 3.6 2 3.6 1.6 0 1.4-2.7 1.9-4.6.3-1.1.6-1.9 1-1.9s.7.8 1 1.9c.5 1.9.3 4.6 1.9 4.6 1.4 0 1.7-2.1 2-3.6C17.6 14 19 12.2 19 9c0-4.2-3-7-7-7z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold text-brand-dark">
            {CLINIC.shortName} Admin
          </span>
        </div>

        <h1 className="mt-6 font-display text-2xl font-medium text-brand-dark">
          Staff sign in
        </h1>
        <p className="mt-1 text-sm text-brand-dark/50">
          Access the appointments dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-brand-dark/10 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none"
              placeholder="admin@brightsmile.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-brand-dark/10 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
