// src/i18n.ts
// SSR-safe i18n configuration with URL-based locale detection
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from './locales/en.json';
import sqTranslation from './locales/sq.json';

// Supported locales
export const supportedLocales = ['sq', 'en'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale = 'sq';

// Initialize i18n (SSR-safe - no browser detection)
i18n
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',

    // Albanian is the default/fallback language
    lng: defaultLocale,
    fallbackLng: defaultLocale,

    // Namespaces
    ns: ['translation', 'common', 'admin'],
    defaultNS: 'translation',

    interpolation: {
      escapeValue: false, // React already escapes
    },

    resources: {
      en: {
        translation: enTranslation,
      },
      sq: {
        translation: sqTranslation,
      },
    },

    // Disable browser language detection for SSR safety
    // Language is determined by URL prefix
    react: {
      useSuspense: false, // Prevents hydration issues
    },
  });

/**
 * Change the current language
 * Call this when locale changes (e.g., from URL or language switcher)
 */
export function setI18nLocale(locale: SupportedLocale): void {
  if (supportedLocales.includes(locale) && i18n.language !== locale) {
    i18n.changeLanguage(locale);
  }
}

/**
 * Get current i18n language
 */
export function getI18nLocale(): SupportedLocale {
  const lang = i18n.language;
  return supportedLocales.includes(lang as SupportedLocale)
    ? (lang as SupportedLocale)
    : defaultLocale;
}

export default i18n;