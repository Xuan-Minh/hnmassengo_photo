'use client';

import LoadingOverlay from '../overlays/LoadingOverlay';
import ScrollbarTheme from './ScrollbarTheme';

export default function ClientLayout({ children, loadingImages }) {
  return (
    <>
      <ScrollbarTheme />
      {/* On lui passe les images prêtes à l'emploi */}
      <LoadingOverlay initialImages={loadingImages} />
      {children}
    </>
  );
}
