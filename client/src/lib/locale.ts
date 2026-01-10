// Locale utilities for the multilingual system

export const locales = ['sq', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'sq';

/**
 * Extract locale from pathname
 * @example extractLocale('/sq/events') => 'sq'
 * @example extractLocale('/en/menu/123') => 'en'
 * @example extractLocale('/events') => null
 */
export function extractLocale(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return null;
}

/**
 * Remove locale prefix from pathname
 * @example removeLocalePrefix('/sq/events') => '/events'
 * @example removeLocalePrefix('/en/menu/123') => '/menu/123'
 * @example removeLocalePrefix('/events') => '/events'
 */
export function removeLocalePrefix(pathname: string): string {
  const locale = extractLocale(pathname);
  if (!locale) return pathname;

  const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), '');
  return withoutLocale || '/';
}

/**
 * Build path with a different locale prefix
 * @example buildLocalePath('/sq/events', 'en') => '/en/events'
 * @example buildLocalePath('/events', 'sq') => '/sq/events'
 */
export function buildLocalePath(pathname: string, targetLocale: Locale): string {
  const pathWithoutLocale = removeLocalePrefix(pathname);
  return `/${targetLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
}

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get display name for a locale
 */
export function getLocaleDisplayName(locale: Locale): string {
  const displayNames: Record<Locale, string> = {
    sq: 'Shqip',
    en: 'English',
  };
  return displayNames[locale];
}

/**
 * Get short display name for a locale
 */
export function getLocaleShortName(locale: Locale): string {
  const shortNames: Record<Locale, string> = {
    sq: 'SQ',
    en: 'EN',
  };
  return shortNames[locale];
}

/**
 * Cookie utilities for locale
 */
export const LOCALE_COOKIE_NAME = 'site_locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export function setLocaleCookie(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE_NAME}=([^;]+)`));
  const value = match?.[2];

  if (value && isValidLocale(value)) {
    return value;
  }

  return null;
}
