"use client";
import { NextIntlProvider } from "next-intl";
import { ToastProvider } from "../components/GlobalToast";

export default function Providers({ children, messages }) {
  return (
    <NextIntlProvider messages={messages}>
      <ToastProvider>{children}</ToastProvider>
    </NextIntlProvider>
  );
}
