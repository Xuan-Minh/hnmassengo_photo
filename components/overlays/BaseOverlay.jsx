'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * BaseOverlay - Composant wrapper pour tous les overlays
 * Gère : animations, focus management, structure de base
 * @param {Function} onClose - Callback de fermeture
 * @param {React.ReactNode} children - Contenu de l'overlay
 * @param {number} animationDuration - Durée de l'animation (défaut 0.8s)
 * @param {string} ariaLabelledBy - ID du titre pour l'accessibilité
 */
export default function BaseOverlay({
  onClose,
  children,
  animationDuration = 0.8,
  ariaLabelledBy,
}) {
  const previouslyFocusedElement = useRef(null);

  // Mémoriser l'élément actif à l'ouverture
  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement;
  }, []);

  // Rendre le focus à l'élément déclencheur à la fermeture
  useEffect(() => {
    return () => {
      previouslyFocusedElement.current?.focus?.();
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-blackCustom text-whiteCustom font-playfair flex flex-col"
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
    >
      {/* Bouton Back */}
      <div className="absolute top-8 left-8 md:left-16 z-50">
        <button
          onClick={onClose}
          className="text-lg text-whiteCustom/60 hover:text-whiteCustom transition-colors"
          aria-label="Close overlay"
        >
          back
        </button>
      </div>

      {/* Contenu de l'overlay */}
      {children}
    </motion.div>
  );
}
