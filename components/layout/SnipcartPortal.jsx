'use client';
import Script from 'next/script';

export default function SnipcartPortal({ apiKey }) {
  if (!apiKey) return null;

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
        strategy="lazyOnload"
        suppressHydrationWarning
      />
    </>
  );
}
