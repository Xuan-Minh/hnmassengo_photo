import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { routing } from '../../../src/i18n/routing';
import React from 'react';

export async function generateMetadata({ params }) {
  const { locale: rawLocale } = await params;
  const locale = routing.locales.includes(rawLocale)
    ? rawLocale
    : routing.defaultLocale;

  return {
    alternates: {
      languages: {
        fr: '/fr/legal',
        en: '/en/legal',
        de: '/de/legal',
        'x-default': '/fr/legal',
      },
      canonical: `/${locale}/legal`,
    },
  };
}

export default async function LegalLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}
