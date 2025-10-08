"use client";
import { NextIntlClientProvider } from "next-intl";

export default function Providers({ children, messages, locale }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
