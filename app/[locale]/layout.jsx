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

// 1. AJOUT : Import du client Sanity
import client from '../../lib/sanity.client';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  // 2. AJOUT : On va chercher les images sur le serveur (Zéro délai client)
  let loadingImages = [];
  try {
    const data = await client.fetch(
      `*[_type == "loadingImage"] | order(order asc) {
        "url": image.asset->url,
        portraitOnly
      }`
    );
    loadingImages = data || [];
  } catch (e) {
    console.error('Erreur chargement images LoadingOverlay', e);
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <UIControlBar />
        {/* 3. MODIFICATION : On transmet les images en prop */}
        <ClientLayout loadingImages={loadingImages}>
          <RevealRoot>{children}</RevealRoot>
        </ClientLayout>
        <SnipcartPortal apiKey={process.env.SNIPCART_PUBLIC_API_KEY || ''} />
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
