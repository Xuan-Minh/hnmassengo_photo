'use client';

import dynamic from 'next/dynamic';

const LoadingOverlay = dynamic(() => import('../components/LoadingOverlay'), {
  ssr: false,
});

export default function ClientLayout({ children }) {
  return (
    <>
      <LoadingOverlay />
      {children}
    </>
  );
}
