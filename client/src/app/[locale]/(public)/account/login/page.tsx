'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useClientAuth } from '@/contexts/ClientAuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { login, isAuthenticated, isLoading: authLoading } = useClientAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(`/${locale}/account/profile`);
    }
  }, [isAuthenticated, authLoading, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push(`/${locale}/account/profile`);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('account.login.title', 'Welcome Back')}
          </h1>
          <p className="text-gray-400">
            {t('account.login.subtitle', 'Sign in to manage your reservations')}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('account.login.email', 'Email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('account.login.password', 'Password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black
                font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? t('common.loading', 'Loading...') : t('account.login.submit', 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t('account.login.noAccount', "Don't have an account?")}{' '}
              <Link
                href={`/${locale}/account/register`}
                className="text-amber-400 hover:text-amber-300"
              >
                {t('account.login.register', 'Create one')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/${locale}/reservations/lookup`}
            className="text-gray-400 hover:text-white text-sm"
          >
            {t('account.login.lookupReservation', 'Looking for a reservation? Use the lookup tool')}
          </Link>
        </div>
      </div>
    </div>
  );
}
