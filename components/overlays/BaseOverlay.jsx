'use client';
import { useEffect } from 'react';
import { m } from 'framer-motion';

/**
 * BaseOverlay - Composant wrapper pour tous les overlays
 * Gère : animations, focus management, structure de base
 * @param {Function} onClose - Callback de fermeture
 * @param {React.ReactNode} children - Contenu de l'overlay
 * @param {number} animationDuration - Durée de l'animation (défaut 0.8s)
 * @param {string} ariaLabelledBy - ID du titre pour l'accessibilité
 * @param {string} ariaLabel - Label de repli si ariaLabelledBy est absent
 */
export default function BaseOverlay({
  onClose,
  children,
  animationDuration = 0.8,
  ariaLabelledBy,
  ariaLabel,
}) {
  // CORRECTION : Plus besoin de useRef ! Un seul useEffect suffit.
  useEffect(() => {
    // 1. Capture l'élément actif au montage (variable locale)
    const elementToFocus = document.activeElement;

    // 2. Rend le focus au démontage
    return () => {
      elementToFocus?.focus?.();
    };
  }, []);

  return (
    <m.div
      className="fixed inset-0 z-[60] bg-blackCustom text-whiteCustom font-liberation flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        duration: animationDuration,
        ease: [0.22, 1, 0.36, 1],
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
    >
      <div className="absolute top-8 left-8 md:top-16 md:left-16 z-50">
        <button
          type="button"
          onClick={onClose}
          className="text-lg text-whiteCustom/60 hover:text-whiteCustom transition-colors"
          aria-label="Close overlay"
        >
          back
        </button>
      </div>

      {children}
    </m.div>
  );
}
