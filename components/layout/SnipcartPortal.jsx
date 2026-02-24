'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

// Stylesheets Snipcart à charger dynamiquement (non render-blocking)
const SNIPCART_STYLESHEETS = [
  '/styles/snipcart-local.css',
  '/styles/snipcart-custom.css',
];

export default function SnipcartPortal({ apiKey }) {
  const [loadScript, setLoadScript] = useState(false);

  useEffect(() => {
    // Déclencher le chargement de Snipcart seulement si:
    // 1. L'user accède à la page /shop
    // 2. L'user clique sur un élément avec data-snipcart-item
    // 3. 20s timeouts pour les users sur d'autres pages (fallback)

    const currentPath = window.location.pathname;

    // Si on est sur la page shop, charger immédiatement
    if (
      currentPath.includes('/shop') ||
      currentPath.includes('snipcart-products')
    ) {
      setLoadScript(true);
      return;
    }

    // Sinon charger avec timeout plus long + event listeners
    let timeoutId;

    // Charger si l'user clique sur un élément Snipcart
    const handleSnipcartClick = e => {
      if (e.target.closest('[data-snipcart-item], [data-snipcart-btn]')) {
        setLoadScript(true);
      }
    };

    document.addEventListener('click', handleSnipcartClick);

    // Fallback: charger après 20s (lazy mais sûr)
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => setLoadScript(true), {
        timeout: 20000, // Augmenté de 5s à 20s
      });
      return () => {
        cancelIdleCallback(idleId);
        document.removeEventListener('click', handleSnipcartClick);
      };
    } else {
      timeoutId = setTimeout(() => setLoadScript(true), 20000);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleSnipcartClick);
      };
    }
  }, []);

  // Charger les CSS Snipcart dynamiquement quand loadScript passe à true
  useEffect(() => {
    if (!loadScript) return;
    const links = [];
    SNIPCART_STYLESHEETS.forEach(href => {
      // Éviter les doublons si déjà injecté
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => {
      links.forEach(link => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [loadScript]);

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
