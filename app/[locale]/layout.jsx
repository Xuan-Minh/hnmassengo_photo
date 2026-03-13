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

import client from '../../lib/sanity.client';

const OG_LOCALE = {
  fr: 'fr_FR',
  en: 'en_US',
  de: 'de_DE',
};

export async function generateMetadata({ params }) {
  const { locale: rawLocale } = await params;
  const locale = routing.locales.includes(rawLocale)
    ? rawLocale
    : routing.defaultLocale;

  return {
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
    alternates: {
      languages: {
        fr: '/fr',
        en: '/en',
        de: '/de',
        'x-default': '/fr',
      },
    },
    openGraph: {
      title: 'Han-Noah MASSENGO | Photographer & Visual Artist',
      description:
        'Explore the artistic portfolio of Han-Noah MASSENGO, a photographer capturing moments through light, shadow, and emotion.',
      url: `https://hnmassengo.com/${locale}`,
      siteName: 'Han-Noah MASSENGO Portfolio',
      locale: OG_LOCALE[locale] || 'fr_FR',
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
}

export const viewport = {
  viewportFit: 'cover',
};

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
  } catch {
    // Ignore loading overlay fetch errors and fall back to empty images.
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <UIControlBar />
        <ClientLayout loadingImages={loadingImages}>
          <RevealRoot>{children}</RevealRoot>
        </ClientLayout>
        <SnipcartPortal apiKey={process.env.SNIPCART_PUBLIC_API_KEY || ''} />
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}
