'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { EVENTS, emitEvent, addEventHandler } from '../../lib/events';
import { buildSanityImageUrl } from '../../lib/imageUtils';

// Hook pour détecter si c'est mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Button component for loading overlay exit action
function NextButton({ isExiting, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const rotateValue = useMemo(() => {
    const exitRotation = isExiting ? -90 : 0;
    return exitRotation + clickCount * 360;
  }, [isExiting, clickCount]);

  const handleClick = e => {
    setClickCount(c => c + 1);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      aria-label="next"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-6 py-3 text-lg font-medium font-playfair text-[18px] md:text-[18px]"
      style={{
        color: hovered ? '#F4F3F2' : '#C8C7C6',
        opacity: hovered ? 1 : 0.85,
        transition: 'color .3s, opacity .3s',
        backdropFilter: hovered ? 'blur(2px)' : 'none',
      }}
    >
      <motion.span
        className="inline-block mr-2"
        initial={false}
        animate={{ rotate: rotateValue }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
      <span>next</span>
    </button>
  );
}

export default function LoadingOverlay() {
  const isMobile = useIsMobile();
  const previouslyFocusedElement = useRef(null);
  // Fond dégradé élégant au lieu d'un gris uni
  const elegantBackground =
    'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)';

  // Liste dynamique des images de chargement chargées depuis Sanity via l'API
  const [imageSources, setImageSources] = useState([]);
  const [imageMetadata, setImageMetadata] = useState([]); // Métadonnées (dimensions, orientation)

  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const rotateInterval = useRef(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isReTrigger, setIsReTrigger] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const overlayRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  // Charge la liste des images depuis Sanity via l'API et les optimise
  const fetchedOnceRef = useRef(false);
  useEffect(() => {
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    // Charger directement depuis l'API Sanity
    fetch('/api/loading-images')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.images) && data.images.length > 0) {
          // Stocker toutes les métadonnées
          setImageMetadata(data.images);
        }
      })
      .catch(error => {
        console.error('Erreur chargement images de chargement:', error);
      });
  }, []);

  // Filtrer et optimiser les images selon le breakpoint mobile
  useEffect(() => {
    if (imageMetadata.length === 0) return;

    // Filtrer selon le device (exclusif)
    // - Sur mobile: afficher SEULEMENT les images marquées comme "portraitOnly"
    // - Sur desktop: afficher SEULEMENT les images qui NE sont PAS "portraitOnly"
    let filtered = isMobile
      ? imageMetadata.filter(img => img.portraitOnly)
      : imageMetadata.filter(img => !img.portraitOnly);

    // Fallback : si aucune image ne correspond, on affiche tout
    if (filtered.length === 0) {
      filtered = imageMetadata;
    }

    // Extraire seulement les URLs (pas les objets complets)
    const urls = filtered.map(img => img.url);
    setImageSources(urls);
  }, [isMobile, imageMetadata]);

  // Précharge: affiche la 1ère image immédiatement, charge les autres en background
  useEffect(() => {
    if (imageSources.length === 0) return;

    // Injecter un preload link pour la 1ère image dans le <head>
    if (typeof window !== 'undefined' && imageSources[0]) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageSources[0];
      link.fetchPriority = 'high';
      document.head.appendChild(link);

      // Cleanup
      return () => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };
    }
  }, [imageSources]);

  // Précharge: affiche la 1ère image immédiatement, charge les autres en background
  useEffect(() => {
    if (imageSources.length === 0) return;
    let isMounted = true;
    const ok = [];
    let done = 0;
    let firstImageLoaded = false;

    // Précharger toutes les images
    imageSources.forEach((src, index) => {
      const img = typeof window !== 'undefined' ? new window.Image() : null;
      if (!img) return;

      img.onload = () => {
        done += 1;
        ok.push(src);

        // Dès que la 1ère image charge, afficher et démarrer l'animation
        if (isMounted && index === 0 && !firstImageLoaded) {
          firstImageLoaded = true;
          setLoadedImages([src]);
          setLoadingProgress(100);
        }

        // Une fois TOUTES les images chargées, mettre à jour la liste complète
        if (isMounted && done === imageSources.length && ok.length > 0) {
          setLoadedImages(ok);
          setLoadingProgress(100);
        }
      };

      img.onerror = () => {
        done += 1;

        // Si c'est la 1ère image qui échoue, afficher quand même
        if (isMounted && index === 0 && !firstImageLoaded) {
          firstImageLoaded = true;
          setLoadedImages([imageSources[0]]);
          setLoadingProgress(100);
        }

        // Continuer même en cas d'erreur partielle
        if (isMounted && done === imageSources.length) {
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
                key={imageSrc}
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
                priority={index === 0}
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
          <NextButton
            isExiting={isExiting}
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
