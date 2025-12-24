import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "../../components/GlobalToast";
import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
import { routing } from "../../src/i18n/routing";
import Menu from "../../components/Menu";
import React from "react";

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider>
        <Menu />
        {children}
      </ToastProvider>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
