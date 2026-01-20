'use client';
import Script from 'next/script';

export default function SnipcartPortal() {
  const apiKey =
    process.env.NEXT_PUBLIC_SNIPCART_API_KEY || process.env.SNIPCART_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      'Missing Snipcart public API key. Set NEXT_PUBLIC_SNIPCART_API_KEY (recommended) or SNIPCART_API_KEY.'
    );
  }

  return (
    <>
      <div
        id="snipcart"
        data-api-key={apiKey}
        data-config-add-product-behavior="none"
        hidden
        suppressHydrationWarning
      ></div>
      <Script
        src="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.js"
        strategy="afterInteractive"
        suppressHydrationWarning
      />
    </>
  );
}
