import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { routing } from '../../src/i18n/routing';
import React from 'react';
import { UIControlBar } from '../../components/layout/UIControlBar';
import RevealRoot from '../../components/layout/RevealRoot';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import SnipcartPortal from '../../components/layout/SnipcartPortal';
import ClientLayout from '../../components/layout/ClientLayout';
import { Lexend, Playfair_Display } from 'next/font/google';

import client from '../../lib/sanity.client';

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

export const viewport = {
  viewportFit: 'cover',
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

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  let loadingImages = [];
  try {
    const data = await client.fetch(
      `*[_type == "loadingImageDesktop" || _type == "loadingImageMobile"] {
        _type,
        image {
          asset->,
          crop,
          hotspot
        },
        "url": image.asset->url,
        order
      }`,
      {},
      { next: { revalidate: 60 } }
    );
    // Tri séparé pour chaque type
    // Tri ascendant puis ré-attribution séquentielle du champ order
    const desktopImages = (data || [])
      .filter(img => img._type === 'loadingImageDesktop')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img, idx) => ({ ...img, order: idx + 1 }));
    const mobileImages = (data || [])
      .filter(img => img._type === 'loadingImageMobile')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img, idx) => ({ ...img, order: idx + 1 }));
    loadingImages = [...desktopImages, ...mobileImages];
  } catch (e) {
    console.error('Erreur chargement images LoadingOverlay', e);
  }

  return (
    <html
      lang={locale}
      className={`${lexend.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
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
        {/* Alternates languages */}
        <link rel="alternate" href="https://hnmassengo.com/fr" hrefLang="fr" />
        <link rel="alternate" href="https://hnmassengo.com/en" hrefLang="en" />
        <link rel="alternate" href="https://hnmassengo.com/de" hrefLang="de" />
        <link
          rel="alternate"
          href="https://hnmassengo.com/fr"
          hrefLang="x-default"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <UIControlBar />
            <ClientLayout loadingImages={loadingImages}>
              <RevealRoot>{children}</RevealRoot>
            </ClientLayout>
            <SnipcartPortal
              apiKey={process.env.SNIPCART_PUBLIC_API_KEY || ''}
            />
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}
