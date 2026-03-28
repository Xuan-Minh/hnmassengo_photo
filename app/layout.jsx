import '../globals.css';
import React from 'react';
import localFont from 'next/font/local'; // Utilise les polices locales
import { getLocale } from 'next-intl/server';
//import { Lexend, Playfair_Display } from 'next/font/google';
import GlobalErrorBoundary from '../components/layout/GlobalErrorBoundary';
import StructuredData from '../lib/metadata';

/*const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lexend',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '400i', '700', '700i'],
  variable: '--font-playfair',
  display: 'swap',
});
*/
const lexend = localFont({
  src: '../public/fonts/Lexend-Regular.woff2',
  display: 'swap',
  variable: '--font-lexend',
});

const playfair = localFont({
  src: [
    {
      path: '../public/fonts/PlayfairDisplay-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PlayfairDisplay-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-playfair',
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
        className={`${lexend.className} ${lexend.variable} ${playfair.variable}`}
        suppressHydrationWarning
      >
        <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
      </body>
    </html>
  );
}
