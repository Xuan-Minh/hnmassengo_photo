'use client';

import dynamic from 'next/dynamic';

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
