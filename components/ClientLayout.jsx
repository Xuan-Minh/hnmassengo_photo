'use client';

import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes de prerendering côté serveur
const IntroOverlay = dynamic(() => import('../components/IntroOverlay'), {
  ssr: false,
});

export default function ClientLayout({ children }) {
  return (
    <>
      <IntroOverlay />
      {children}
    </>
  );
}
