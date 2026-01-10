'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useClientAuth } from '@/contexts/ClientAuthContext';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { register, isAuthenticated, isLoading: authLoading } = useClientAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    marketing_opt_in: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(`/${locale}/account/profile`);
    }
  }, [isAuthenticated, authLoading, router, locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('account.register.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('account.register.passwordTooShort', 'Password must be at least 8 characters'));
      return;
    }

    setIsLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      preferred_locale: locale,
      marketing_opt_in: formData.marketing_opt_in,
    });

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
            {t('account.register.title', 'Create Account')}
          </h1>
          <p className="text-gray-400">
            {t('account.register.subtitle', 'Join us to manage your reservations easily')}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('account.register.firstName', 'First Name')} *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                    text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                    focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('account.register.lastName', 'Last Name')}
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                    text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                    focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('account.register.email', 'Email')} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('account.register.phone', 'Phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent"
                placeholder="+355 69 xxx xxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('account.register.password', 'Password')} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent"
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {t('account.register.confirmPassword', 'Confirm Password')} *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                name="marketing_opt_in"
                id="marketing_opt_in"
                checked={formData.marketing_opt_in}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-amber-500 border-gray-600 rounded
                  focus:ring-amber-500 bg-gray-900"
              />
              <label htmlFor="marketing_opt_in" className="ml-2 text-sm text-gray-400">
                {t('account.register.marketingOptIn', 'I want to receive news, offers, and event updates')}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black
                font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? t('common.loading', 'Loading...') : t('account.register.submit', 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t('account.register.hasAccount', 'Already have an account?')}{' '}
              <Link
                href={`/${locale}/account/login`}
                className="text-amber-400 hover:text-amber-300"
              >
                {t('account.register.login', 'Sign in')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
