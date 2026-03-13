import '../globals.css';
import React from 'react';
import { Lexend, Playfair_Display } from 'next/font/google';
import { getLocale } from 'next-intl/server';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-lexend',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
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
    <html
      lang={locale}
      translate="no"
      className={`${lexend.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#222222" />
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
        <link rel="alternate" href="https://hnmassengo.com/fr" hrefLang="fr" />
        <link rel="alternate" href="https://hnmassengo.com/en" hrefLang="en" />
        <link rel="alternate" href="https://hnmassengo.com/de" hrefLang="de" />
        <link
          rel="alternate"
          href="https://hnmassengo.com/fr"
          hrefLang="x-default"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
