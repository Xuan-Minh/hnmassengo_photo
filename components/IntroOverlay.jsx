'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import OverlayActionButton from './OverlayActionButton';
import { EVENTS, emitEvent, addEventHandler } from '../lib/events';

export default function IntroOverlay() {
  const previouslyFocusedElement = useRef(null);
  // Fond dégradé élégant au lieu d'un gris uni
  const elegantBackground =
    'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)';

  // Liste dynamique des images de chargement chargées depuis Sanity via l'API
  const [imageSources, setImageSources] = useState([]);

  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const rotateInterval = useRef(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isReTrigger, setIsReTrigger] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const overlayRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // Survol limité au bouton uniquement (pas de dépendance au mouvement global)

  // Affiche toujours l'intro au chargement (plus de gating sessionStorage)
  useEffect(() => {
    setVisible(true);
    previouslyFocusedElement.current = document.activeElement;
    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, []);

  // Rendre le focus à l'élément déclencheur à la fermeture
  useEffect(() => {
    if (!visible && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus?.();
    }
  }, [visible]);

  // Charge la liste des images depuis Sanity via l'API
  const fetchedOnceRef = useRef(false);
  useEffect(() => {
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    // Charger directement depuis l'API Sanity
    fetch('/api/loading-images')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.images) && data.images.length > 0) {
          setImageSources(data.images);
        }
      })
      .catch(error => {
        console.error('Erreur chargement images de chargement:', error);
      });
  }, []);

  // Précharge TOUTES les images avant de commencer l'animation
  useEffect(() => {
    if (imageSources.length === 0) return;
    let isMounted = true;
    const ok = [];
    let done = 0;

    // Précharger toutes les images simultanément
    imageSources.forEach(src => {
      const img = typeof window !== 'undefined' ? new window.Image() : null;
      if (!img) return;

      img.onload = () => {
        done += 1;
        ok.push(src);

        // Mettre à jour la progression
        if (isMounted) {
          setLoadingProgress((done / imageSources.length) * 100);
        }

        // Une fois TOUTES les images chargées, démarrer l'animation
        if (isMounted && done === imageSources.length && ok.length > 0) {
          setLoadedImages(ok);
          setLoadingProgress(100);
        }
      };

      img.onerror = () => {
        done += 1;

        // Mettre à jour la progression même en cas d'erreur
        if (isMounted) {
          setLoadingProgress((done / imageSources.length) * 100);
        }

        // Continuer même en cas d'erreur partielle
        if (isMounted && done === imageSources.length) {
          // Au minimum, utiliser les images qui ont fonctionné
          setLoadedImages(ok.length > 0 ? ok : [imageSources[0]]);
          setLoadingProgress(100);
        }
      };

      img.src = src;
    });

    return () => {
      isMounted = false;
    };
  }, [imageSources]);

  // Rotation du fond uniquement quand TOUTES les images sont chargées
  useEffect(() => {
    if (!visible || isExiting) return;
    if (loadedImages.length === 0 || loadedImages.length < imageSources.length)
      return;

    const framesCount = loadedImages.length;
    rotateInterval.current = setInterval(() => {
      setCurrentIndex(i => (i + 1) % framesCount);
    }, 800);

    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, [visible, isExiting, loadedImages.length, imageSources.length]);

  // Pas de timer: l'intro reste affichée jusqu'au clic sur "Next"

  const dismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
  };

  // Écoute un événement global pour réafficher l'intro à la demande
  useEffect(() => {
    const handler = () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
      setCurrentIndex(0);
      setHovered(false);
      setIsExiting(false);
      setIsReTrigger(true);
      setVisible(true);
    };
    const cleanup = addEventHandler(EVENTS.INTRO_SHOW, handler);
    return cleanup;
  }, []);

  if (!visible && !isExiting) return null;

  // Mode sans fade: on affiche seulement l'image courante (préchargée). Si aucune image, fond neutre fixe.
  const showImages = loadedImages.length > 0;

  // Swipe up pour fermer (mobile)
  const handleTouchStart = e => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = e => {
    if (!touchStart) return;

    const currentTouch = e.touches[0].clientY;
    const diff = touchStart - currentTouch;

    // Si swipe up d'au moins 50px
    if (diff > 50) {
      dismiss();
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-[100]"
      style={{ background: elegantBackground, overflow: 'hidden' }}
      initial={isReTrigger ? { y: '-100%', opacity: 1 } : { y: 0, opacity: 1 }}
      animate={isExiting ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        if (isExiting) {
          setVisible(false);
          setIsExiting(false);
          setIsReTrigger(false); // Réinitialiser pour la prochaine fois
          emitEvent(EVENTS.INTRO_DISMISSED);
        }
      }}
      onClick={dismiss}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        {showImages && (
          <>
            {/* Afficher toutes les images préchargées avec opacité conditionnelle */}
            {loadedImages.map((imageSrc, index) => (
              <Image
                key={imageSrc} // Clé stable basée sur l'URL
                src={imageSrc}
                alt=""
                fill
                className="absolute inset-0 w-full h-full object-cover z-0"
                draggable={false}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  filter: 'brightness(0.42) contrast(1.05) saturate(0.9)',
                  transform: 'scale(1.04)',
                  transition: 'opacity 0.1s ease-in-out',
                  opacity: index === currentIndex ? 1 : 0,
                }}
                sizes="100vw"
                priority={index === 0} // Priorité pour la première image
              />
            ))}
            <div className="absolute inset-0 bg-black/35 pointer-events-none z-10" />

            {/* Indicateur de chargement visible tant que toutes les images ne sont pas chargées */}
            {loadedImages.length === 0 && loadingProgress < 100 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 flex flex-col items-center gap-3">
                  <div className="text-white/80 text-sm font-light">
                    Loading
                  </div>
                  <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <div className="text-white/60 text-xs">
                    {Math.round(loadingProgress)}%
                  </div>
                </div>
              </div>
            )}

            {/* Indicateur subtil une fois l'animation démarrée mais si de nouvelles images arrivent */}
            {loadedImages.length > 0 &&
              loadedImages.length < imageSources.length && (
                <div className="absolute top-8 right-8 z-20 pointer-events-none">
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
                </div>
              )}
          </>
        )}

        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
          <h2
            className="text-whiteCustom flex items-end justify-center gap-4 text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-7xl mb-0"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
          >
            <div className="font-playfair italic leading-none">Han-Noah</div>
            <div className="font-lexend font-bold leading-none">MASSENGO</div>
          </h2>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
          <OverlayActionButton
            label="next"
            intent="next"
            animate="exit"
            isActive={isExiting}
            activeDeltaDeg={-90}
            onClick={e => {
              e.stopPropagation();
              dismiss();
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
