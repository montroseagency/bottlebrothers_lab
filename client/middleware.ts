import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales
const locales = ['sq', 'en'];
const defaultLocale = 'sq';

// Paths that should NOT have locale prefix
const excludedPaths = [
  '/admin',
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

// Check if path starts with any excluded prefix
function isExcludedPath(pathname: string): boolean {
  return excludedPaths.some(prefix => pathname.startsWith(prefix));
}

// Check if path already has a locale prefix
function hasLocalePrefix(pathname: string): boolean {
  return locales.some(locale =>
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

// Extract locale from Accept-Language header
function getLocaleFromHeader(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header
  const languages = acceptLanguage.split(',').map(lang => {
    const [code, q = 'q=1'] = lang.trim().split(';');
    const quality = parseFloat(q.replace('q=', '')) || 1;
    return { code: code.split('-')[0].toLowerCase(), quality };
  });

  // Sort by quality and find first matching locale
  languages.sort((a, b) => b.quality - a.quality);

  for (const lang of languages) {
    if (locales.includes(lang.code)) {
      return lang.code;
    }
  }

  return defaultLocale;
}

// Get locale with priority order
function getLocale(request: NextRequest, pathname: string): string {
  // Priority 1: URL prefix (already handled - won't reach here if has prefix)

  // Priority 2: Cookie
  const cookieLocale = request.cookies.get('site_locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Priority 3: Accept-Language header
  const headerLocale = getLocaleFromHeader(request);
  if (headerLocale) {
    return headerLocale;
  }

  // Priority 4: Default
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip excluded paths (admin, api, static files)
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // Skip if already has locale prefix
  if (hasLocalePrefix(pathname)) {
    // Extract locale and validate
    const pathLocale = pathname.split('/')[1];
    if (locales.includes(pathLocale)) {
      // Set locale in response header for downstream use
      const response = NextResponse.next();
      response.headers.set('x-locale', pathLocale);
      return response;
    }
  }

  // Redirect to locale-prefixed path
  const locale = getLocale(request, pathname);
  const newPathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;

  const url = request.nextUrl.clone();
  url.pathname = newPathname;

  // Redirect with 308 (permanent redirect that preserves method)
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Match all paths except static files and api
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
