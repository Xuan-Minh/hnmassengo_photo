'use client';

import dynamic from 'next/dynamic';
import ScrollbarTheme from './ScrollbarTheme';

const LoadingOverlay = dynamic(() => import('../overlays/LoadingOverlay'), {
  ssr: false,
});

export default function ClientLayout({ children }) {
  return (
    <>
      <ScrollbarTheme />
      <LoadingOverlay />
      {children}
    </>
  );
}
