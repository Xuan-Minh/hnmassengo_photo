'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function ConditionalLogo() {
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
    const isSnipcartUrl =
      hash.includes('#/cart') ||
      hash.includes('#/checkout') ||
      hash.includes('#snipcart');

    return !isLegalPage && !isSnipcartUrl && !isStudioPage;
  }, [pathname, hash]);

  if (!shouldShow) return null;
  return <Logo />;
}
