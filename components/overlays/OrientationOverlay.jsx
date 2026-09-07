// components/overlays/OrientationOverlay.jsx
'use client';

import { m, AnimatePresence } from 'framer-motion';

export default function OrientationOverlay({
  isLandscape,
  activeSection,
  onGoToGallery,
}) {
  const shouldShow = isLandscape && activeSection !== 'gallery';

  return (
    <AnimatePresence>
      {shouldShow && (
        <m.div
          key="orientation-overlay"
          className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-[#e5e5e5] font-liberation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 animate-pulse">
            {/* Icône de téléphone qui tourne (SVG basique) */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <path d="M12 18h.01"></path>
              <path d="M20.5 12a8.5 8.5 0 0 1-8.5 8.5"></path>
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl mb-4">
            Veuillez redresser votre appareil
          </h2>
          <p className="text-accent mb-12 max-w-sm">
            Cette section est optimisée pour une lecture en mode portrait.
          </p>

          <button
            type="button"
            onClick={onGoToGallery}
            className="text-lg italic hover:text-white transition-colors border-b border-transparent hover:border-white"
          >
            Ou ouvrir la galerie photo
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
