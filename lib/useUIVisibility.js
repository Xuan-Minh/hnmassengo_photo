'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook pour déterminer si les éléments UI (Logo, Menu, LanguageSwitcher) doivent être visibles
 * Masque ces éléments sur les pages légales, studio, et quand Snipcart est ouvert
 * @param {boolean} includeShopException - Si true, affiche sur la page shop même avec Snipcart ouvert
 */
export function useUIVisibility(includeShopException = false) {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const updateHash = () => {
      setHash(typeof window !== 'undefined' ? window.location.hash : '');
    };

    updateHash();

    const handleHashChange = () => updateHash();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const shouldShow = useMemo(() => {
    const isLegalPage = pathname.includes('/legal');
    const isStudioPage = pathname.includes('/studio');
    const isShopPage =
      includeShopException &&
      (pathname.includes('/shop') ||
        pathname === '/fr' ||
        pathname === '/en' ||
        pathname === '/de');
    const isSnipcartUrl =
      hash.includes('#/cart') ||
      hash.includes('#/checkout') ||
      hash.includes('#snipcart');

    // Ne pas afficher si on est sur une page légale ou studio
    if (isLegalPage || isStudioPage) return false;

    // Snipcart masque l'UI sauf sur la page shop
    if (isSnipcartUrl && !isShopPage) return false;

    return true;
  }, [pathname, hash, includeShopException]);

  return shouldShow;
}
