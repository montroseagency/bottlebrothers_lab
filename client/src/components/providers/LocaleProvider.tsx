'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n, { setI18nLocale, type SupportedLocale, supportedLocales, defaultLocale } from '@/i18n';
import { extractLocale } from '@/lib/locale';

interface LocaleProviderProps {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}

/**
 * Provider that syncs i18n language with the URL locale
 * Wraps the app and ensures translations match the current route
 */
export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const pathname = usePathname();

  // Extract locale from URL path
  const urlLocale = extractLocale(pathname);
  const currentLocale: SupportedLocale = urlLocale && supportedLocales.includes(urlLocale as SupportedLocale)
    ? (urlLocale as SupportedLocale)
    : (initialLocale || defaultLocale);

  // Sync i18n language with URL locale
  useEffect(() => {
    setI18nLocale(currentLocale);
  }, [currentLocale]);

  // Set initial locale on first render (for SSR consistency)
  if (i18n.language !== currentLocale) {
    setI18nLocale(currentLocale);
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

export default LocaleProvider;
