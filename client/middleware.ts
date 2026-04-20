import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Locale prefixes to strip from URLs
const locales = ['sq', 'en'];

// Paths that should not be touched
const excludedPaths = [
  '/admin',
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

function isExcludedPath(pathname: string): boolean {
  return excludedPaths.some(prefix => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // If URL starts with a locale prefix, redirect to the path without it
  for (const locale of locales) {
    if (pathname === `/${locale}`) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url, 308);
    }
    if (pathname.startsWith(`/${locale}/`)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(`/${locale}`.length);
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
