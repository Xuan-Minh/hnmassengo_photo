import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const locales = ['fr', 'en', 'de'];
const defaultLocale = 'fr';

function getLocaleFromHeader(acceptLanguage) {
  if (!acceptLanguage) return defaultLocale;
  const langs = acceptLanguage.split(',').map(s => s.split(';')[0].trim());
  const short = langs.map(l => l.slice(0,2));
  return short.find(l => locales.includes(l)) || defaultLocale;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return; // laisser passer
  }

  const hasLocale = locales.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const locale = getLocaleFromHeader(request.headers.get('accept-language'));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
