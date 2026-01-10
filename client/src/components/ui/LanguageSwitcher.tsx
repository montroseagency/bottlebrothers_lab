'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  locales,
  type Locale,
  buildLocalePath,
  extractLocale,
  setLocaleCookie,
  getLocaleShortName,
} from '@/lib/locale';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'full';
}

export function LanguageSwitcher({ className = '', variant = 'default' }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = extractLocale(pathname) || 'sq';

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Set cookie for persistence
    setLocaleCookie(newLocale);

    // Navigate to new locale path
    const newPath = buildLocalePath(pathname, newLocale);
    router.push(newPath);
  };

  if (variant === 'minimal') {
    // Just show current locale with dropdown
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentLocale}
          onChange={(e) => handleLocaleChange(e.target.value as Locale)}
          className="appearance-none bg-transparent border border-white/20 rounded px-2 py-1 text-sm text-white cursor-pointer hover:border-white/40 focus:outline-none focus:border-primary-400"
        >
          {locales.map((locale) => (
            <option key={locale} value={locale} className="bg-neutral-900 text-white">
              {getLocaleShortName(locale)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (variant === 'full') {
    // Show full language names
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {locales.map((locale, index) => (
          <React.Fragment key={locale}>
            {index > 0 && <span className="text-white/40">|</span>}
            <button
              onClick={() => handleLocaleChange(locale)}
              className={`px-2 py-1 text-sm font-medium transition-colors ${
                locale === currentLocale
                  ? 'text-primary-400'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {locale === 'sq' ? 'Shqip' : 'English'}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Default: Toggle button style
  return (
    <div className={`flex items-center bg-white/10 rounded-full p-0.5 ${className}`}>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${
            locale === currentLocale
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          {getLocaleShortName(locale)}
        </button>
      ))}
    </div>
  );
}

// Hook to get current locale
export function useLocale(): Locale {
  const pathname = usePathname();
  return extractLocale(pathname) || 'sq';
}

export default LanguageSwitcher;
