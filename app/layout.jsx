import '../globals.css';

import ConditionalMenu from '../components/ConditionalMenu';
import ConditionalLanguageSwitcher from '../components/ConditionalLanguageSwitcher';
import { Lexend, Playfair_Display } from 'next/font/google';
import dynamic from 'next/dynamic';
import RevealRoot from '../components/RevealRoot';
import ErrorBoundary from '../components/ErrorBoundary';
import SnipcartPortal from '../components/SnipcartPortal';
import StructuredData from '../components/StructuredData';
import WebVitals from '../components/WebVitals';
import React from 'react';
import ClientLayout from '../components/ClientLayout';

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
  // Canonical statique (page d'accueil FR par défaut)
  const canonicalUrl = 'https://hnmassengo.com/fr';

  // Langues disponibles
  const locales = [
    { code: 'fr', url: 'https://hnmassengo.com/fr' },
    { code: 'en', url: 'https://hnmassengo.com/en' },
    { code: 'de', url: 'https://hnmassengo.com/de' },
  ];

  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="/styles/snipcart-local.css" />
        <link rel="stylesheet" href="/styles/snipcart-custom.css" />
        <meta name="theme-color" content="#222222" />
        <StructuredData />
        {locales.map(locale => (
          <link
            rel="alternate"
            href={locale.url}
            hrefLang={locale.code}
            key={'hreflang-' + locale.code}
          />
        ))}
        {/* Script Snipcart async retiré, inclus via SnipcartPortal */}
      </head>
      <body
        className={[lexend.className, lexend.variable, playfair.variable].join(
          ' '
        )}
      >
        <ErrorBoundary>
          <ConditionalMenu />
          <ConditionalLanguageSwitcher />
          <ClientLayout>
            <RevealRoot>{children}</RevealRoot>
          </ClientLayout>
        </ErrorBoundary>

        <SnipcartPortal />
        <WebVitals />
      </body>
    </html>
  );
}
