'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function ConditionalLanguageSwitcher() {
  const pathname = usePathname();
  const [hash, setHash] = React.useState('');

  React.useEffect(() => {
    const updateHash = () => {
      setHash(typeof window !== 'undefined' ? window.location.hash : '');
    };

    updateHash();

    // Écouter les changements de hash
    const handleHashChange = () => updateHash();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const shouldShow = React.useMemo(() => {
    const isLegalPage = pathname.includes('/legal');
    const isStudioPage = pathname.includes('/studio');
    const isShopPage =
      pathname.includes('/shop') ||
      pathname === '/fr' ||
      pathname === '/en' ||
      pathname === '/de';
    const isSnipcartUrl =
      hash.includes('#/cart') ||
      hash.includes('#/checkout') ||
      hash.includes('#snipcart');

    // Ne pas cacher le selector sur la page shop même avec Snipcart ouvert
    return !isLegalPage && (!isSnipcartUrl || isShopPage) && !isStudioPage;
  }, [pathname, hash]);

  if (!shouldShow) return null;
  return <LanguageSwitcher />;
}
