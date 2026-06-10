import '../globals.css';
import React from 'react';
import localFont from 'next/font/local';
import { getLocale } from 'next-intl/server';
import GlobalErrorBoundary from '../components/layout/GlobalErrorBoundary';
import StructuredData from '../lib/metadata';

const liberation = localFont({
  src: [
    {
      path: '../public/fonts/LiberationMono.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/LiberationMono-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/LiberationMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/LiberationMono-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-liberation',
});
export default async function RootLayout({ children }) {
  let locale = 'fr';

  try {
    locale = await getLocale();
  } catch {
    locale = 'fr';
  }

  return (
    <html lang={locale} translate="no" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#222222" />
        <StructuredData />
        <link
          rel="preconnect"
          href="https://cdn.snipcart.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.sanity.io"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://api.sanity.io"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://hmassengo-photo.netlify.app"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://cdn.snipcart.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://cdn.sanity.io"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://api.sanity.io"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${liberation.className} ${liberation.variable}`}
        suppressHydrationWarning
      >
        <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
      </body>
    </html>
  );
}
