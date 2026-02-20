'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function SnipcartPortal({ apiKey }) {
  const [loadScript, setLoadScript] = useState(false);

  useEffect(() => {
    // Charger Snipcart en background avec requestIdleCallback
    // pour ne pas bloquer les interactions utilisateur critiques
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => setLoadScript(true), {
        timeout: 5000,
      });
      return () => cancelIdleCallback(idleId);
    } else {
      // Fallback pour les navigateurs sans requestIdleCallback
      const timeoutId = setTimeout(() => setLoadScript(true), 3000);
      return () => clearTimeout(timeoutId);
    }
  }, []);

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
      {loadScript && (
        <Script
          src="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.js"
          strategy="afterInteractive"
          suppressHydrationWarning
        />
      )}
    </>
  );
}
