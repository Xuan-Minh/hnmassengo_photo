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
        "url": image.asset->url,
        order
      }`,
      {},
      { next: { revalidate: 3600 } }
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
