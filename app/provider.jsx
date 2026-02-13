'use client';
import { NextIntlProvider } from 'next-intl';

export default function Providers({ children, messages }) {
  return <NextIntlProvider messages={messages}>{children}</NextIntlProvider>;
}
