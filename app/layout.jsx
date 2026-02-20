import '../globals.css';

import { UIControlBar } from '../components/layout/UIControlBar';
import { Lexend, Playfair_Display } from 'next/font/google';
import RevealRoot from '../components/layout/RevealRoot';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import SnipcartPortal from '../components/layout/SnipcartPortal';
import StructuredData from '../lib/metadata';
import React from 'react';
import ClientLayout from '../components/layout/ClientLayout';

export const metadata = {
  metadataBase: new URL('https://hnmassengo.com'),
  title: 'Han-Noah MASSENGO | Photographer & Visual Artist',
  description:
    'Explore the artistic portfolio of Han-Noah MASSENGO, a photographer capturing moments through light, shadow, and emotion. Discover commissioned works, fine art prints, and visual stories.',
  keywords: [
    'photography',
    'visual art',
    'Han-Noah MASSENGO',
    'fine art',
    'portrait',
    'commissioned work',
    'art prints',
  ],
  authors: [{ name: 'Han-Noah MASSENGO' }],
  creator: 'Han-Noah MASSENGO',
  openGraph: {
    title: 'Han-Noah MASSENGO | Photographer & Visual Artist',
    description:
      'Explore the artistic portfolio of Han-Noah MASSENGO, a photographer capturing moments through light, shadow, and emotion.',
    url: 'https://hnmassengo.com',
    siteName: 'Han-Noah MASSENGO Portfolio',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/ogimage.webp',
        width: 1200,
        height: 630,
        alt: 'Han-Noah MASSENGO Photography Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Han-Noah MASSENGO | Photographer & Visual Artist',
    description: 'Explore the artistic portfolio of Han-Noah MASSENGO.',
    images: ['/ogimage.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

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

export default function RootLayout({ children }) {
  // Langues disponibles
  const locales = [
    { code: 'fr', url: 'https://hnmassengo.com/fr' },
    { code: 'en', url: 'https://hnmassengo.com/en' },
    { code: 'de', url: 'https://hnmassengo.com/de' },
  ];

  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#222222" />
        {/* Preconnect + DNS Prefetch para Third-Party Resources */}
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
        {/* Preconnect API Sanity - recommandé par Lighthouse (110ms savings) */}
        <link
          rel="preconnect"
          href="https://qrww7x39.api.sanity.io"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Preload primary fonts for faster text rendering */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZosuDxHz0KEVMUb_TKBZqrKOlLcUGR8V6o.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/lexend/v25/wlpxgwHDx_UV-XDjBsJVFVIcLM0CQ9u5Tx84tG5Dxe0.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <StructuredData />
        {locales.map(locale => (
          <link
            rel="alternate"
            href={locale.url}
            hrefLang={locale.code}
            key={'hreflang-' + locale.code}
          />
        ))}
        {/* Charger Snipcart CSS de manière non-bloquante */}
        <link rel="preload" href="/styles/snipcart-local.css" as="style" />
        <link rel="preload" href="/styles/snipcart-custom.css" as="style" />
        <noscript>
          <link rel="stylesheet" href="/styles/snipcart-local.css" />
          <link rel="stylesheet" href="/styles/snipcart-custom.css" />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                  ['snipcart-local.css', 'snipcart-custom.css'].forEach((file) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/styles/' + file;
                    document.head.appendChild(link);
                  });
                });
              } else {
                ['snipcart-local.css', 'snipcart-custom.css'].forEach((file) => {
                  const link = document.createElement('link');
                  link.rel = 'stylesheet';
                  link.href = '/styles/' + file;
                  document.head.appendChild(link);
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={[lexend.className, lexend.variable, playfair.variable].join(
          ' '
        )}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <UIControlBar />
          <ClientLayout>
            <RevealRoot>{children}</RevealRoot>
          </ClientLayout>
        </ErrorBoundary>
        <SnipcartPortal apiKey={process.env.SNIPCART_PUBLIC_API_KEY || ''} />
      </body>
    </html>
  );
}
