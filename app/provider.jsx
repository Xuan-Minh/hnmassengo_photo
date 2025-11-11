"use client";
export default function Providers({ children, messages }) {
  return <NextIntlProvider messages={messages}>{children}</NextIntlProvider>;
}
