// Wrapper pour dynamic imports de Framer Motion
// Réduit le bundle initial en chargeant Framer Motion à la demande
import dynamic from 'next/dynamic';

// Import dynamique de Framer Motion pour réduire le bundle initial
export const lazyFramerMotion = {
  motion: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), {
    loading: () => null, // Ne rien afficher pendant le chargement
    ssr: false, // Framer Motion nécessite le client
  }),
  AnimatePresence: dynamic(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })), {
    loading: () => null,
    ssr: false,
  }),
  animate: dynamic(() => import('framer-motion').then(mod => ({ default: mod.animate })), {
    loading: () => null,
    ssr: false,
  }),
  useMotionValue: dynamic(() => import('framer-motion').then(mod => ({ default: mod.useMotionValue })), {
    loading: () => null,
    ssr: false,
  }),
};

// Alternative: Suspense + dynamic pour une meilleure UX
import { Suspense } from 'react';

export const FramerMotionBoundary = ({ children }) => (
  <Suspense fallback={null}>
    {children}
  </Suspense>
);
