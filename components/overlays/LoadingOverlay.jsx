'use client';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { EVENTS, emitEvent, addEventHandler } from '../../lib/events';
import { buildSanityImageUrl } from '../../lib/imageUtils';

function NextButton({ isExiting, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const rotateValue = useMemo(() => {
    const exitRotation = isExiting ? -90 : 0;
    return exitRotation + clickCount * 360;
  }, [isExiting, clickCount]);

  return (
    <button
      type="button"
      aria-label="next"
      onClick={e => {
        setClickCount(c => c + 1);
        onClick?.(e);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`px-6 py-3 text-lg font-whiteCustom lg:hidden font-medium font-playfair transition-colors duration-300 ${hovered ? 'text-whiteCustom opacity-100 backdrop-blur-[2px]' : 'text-greyCustom opacity-85'}`}
    >
      <motion.span
        className="inline-block mr-2"
        initial={false}
        animate={{ rotate: rotateValue }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
      <span className="text-whiteCustom">next</span>
    </button>
  );
}

export default function LoadingOverlay({ initialImages = [] }) {
  const previouslyFocusedElement = useRef(null);
  const elegantBackground =
    'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)';

  // 1. Préparation des URLs ultra-optimisées côté serveur
  const desktopData = useMemo(
    () =>
      (initialImages || []).filter(img => img?._type === 'loadingImageDesktop'),
    [initialImages]
  );
  const mobileData = useMemo(
    () =>
      (initialImages || []).filter(img => img?._type === 'loadingImageMobile'),
    [initialImages]
  );

  // Fonction helper pour extraire l'image (supporte ancien et nouveau format)
  const getImageSource = (img, width) => {
    // Nouveau format : objet image avec asset
    if (img?.image && img.image.asset) {
      return buildSanityImageUrl(img.image, {
        w: width,
        q: 60,
        auto: 'format',
      });
    }
    // Ancien format : URL directe
    if (img?.url) {
      return buildSanityImageUrl(img.url, { w: width, q: 60, auto: 'format' });
    }
    return null;
  };

  const desktopSrcs = useMemo(
    () => desktopData.map(img => getImageSource(img, 1920)).filter(Boolean),
    [desktopData]
  );

  const mobileSrcs = useMemo(
    () => mobileData.map(img => getImageSource(img, 1080)).filter(Boolean),
    [mobileData]
  );

  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Initialiser à true si pas d'images pour éviter le blocage
  const [allLoaded, setAllLoaded] = useState(false);

  const rotateInterval = useRef(null);
  const [isReTrigger, setIsReTrigger] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const overlayRef = useRef(null);
  const titleIdleTimeoutRef = useRef(null);

  const titleOffsetX = useMotionValue(0);
  const titleOffsetY = useMotionValue(0);
  const titleX = useSpring(titleOffsetX, {
    stiffness: 180,
    damping: 22,
    mass: 0.4,
  });
  const titleY = useSpring(titleOffsetY, {
    stiffness: 180,
    damping: 22,
    mass: 0.4,
  });

  // Détection Mobile
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useLayoutEffect(() => {
    setIsMobileDevice(window.innerWidth < 768);
    const checkMobile = () => setIsMobileDevice(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeSrcs = useMemo(
    () => (isMobileDevice ? mobileSrcs : desktopSrcs),
    [isMobileDevice, mobileSrcs, desktopSrcs]
  );

  const clearTitleIdleTimeout = useCallback(() => {
    if (titleIdleTimeoutRef.current) {
      clearTimeout(titleIdleTimeoutRef.current);
      titleIdleTimeoutRef.current = null;
    }
  }, []);

  const resetTitleToCenter = useCallback(() => {
    titleOffsetX.set(0);
    titleOffsetY.set(0);
  }, [titleOffsetX, titleOffsetY]);

  useLayoutEffect(() => {
    clearTitleIdleTimeout();
    resetTitleToCenter();

    if (!visible || isExiting || isMobileDevice) {
      return () => clearTitleIdleTimeout();
    }

    const handleResizeOrBlur = () => {
      clearTitleIdleTimeout();
      resetTitleToCenter();
    };

    window.addEventListener('resize', handleResizeOrBlur);
    window.addEventListener('blur', handleResizeOrBlur);

    return () => {
      clearTitleIdleTimeout();
      window.removeEventListener('resize', handleResizeOrBlur);
      window.removeEventListener('blur', handleResizeOrBlur);
    };
  }, [
    visible,
    isExiting,
    isMobileDevice,
    clearTitleIdleTimeout,
    resetTitleToCenter,
  ]);

  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement;
    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!visible && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus?.();
    }
  }, [visible]);

  // Blocage du scroll
  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    const html = document.documentElement;
    const body = document.body;

    if (visible) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
      body.style.overscrollBehavior = 'none';
      if (scrollRoot) {
        scrollRoot.style.overflow = 'hidden';
        scrollRoot.style.touchAction = 'none';
      }
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.touchAction = '';
      body.style.overscrollBehavior = '';
      if (scrollRoot) {
        scrollRoot.style.overflow = '';
        scrollRoot.style.touchAction = '';
        scrollRoot.scrollTo(0, 0);
      }
      window.scrollTo(0, 0);
    }
    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.touchAction = '';
      body.style.overscrollBehavior = '';
      if (scrollRoot) {
        scrollRoot.style.overflow = '';
        scrollRoot.style.touchAction = '';
      }
    };
  }, [visible]);

  useEffect(() => {
    // Si pas d'images ou une seule, on considère comme chargé
    if (activeSrcs.length <= 1) {
      setAllLoaded(true);
      return;
    }

    // Réinitialiser quand les sources changent
    setAllLoaded(false);

    let done = 0;
    const total = activeSrcs.length;

    // Timeout de sécurité : si le préchargement prend trop de temps, on continue quand même
    const timeout = setTimeout(() => {
      setAllLoaded(true);
    }, 5000); // 5 secondes max

    activeSrcs.forEach(src => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        done++;
        if (done === total) {
          clearTimeout(timeout);
          setAllLoaded(true);
        }
      };
      img.src = src;
    });

    return () => clearTimeout(timeout);
  }, [activeSrcs]);

  // 3. Lancement du Flipbook
  useEffect(() => {
    if (!visible || isExiting || !allLoaded) return;
    if (activeSrcs.length <= 1) return;

    rotateInterval.current = setInterval(() => {
      setCurrentIndex(i => (i + 1) % activeSrcs.length);
    }, 800);

    return () => clearInterval(rotateInterval.current);
  }, [visible, isExiting, allLoaded, activeSrcs.length]);

  const dismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
  };

  useEffect(() => {
    const handler = () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
      setCurrentIndex(0);
      setIsExiting(false);
      setIsReTrigger(true);
      setVisible(true);
    };
    return addEventHandler(EVENTS.INTRO_SHOW, handler);
  }, []);

  if (!visible && !isExiting) return null;

  const imageStyle = {
    filter: 'brightness(0.42) contrast(1.05) saturate(0.9)',
    transform: 'scale(1.04)',
    transition: 'opacity 0.1s ease-in-out',
  };

  const canDismiss = allLoaded;

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-[100]"
      suppressHydrationWarning
      style={{ background: elegantBackground, overflow: 'hidden' }}
      initial={isReTrigger ? { y: '-100%', opacity: 1 } : { y: 0, opacity: 1 }}
      animate={isExiting ? { y: '-100%', opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        if (isExiting) {
          const scrollRoot = document.getElementById('scroll-root');
          if (scrollRoot) scrollRoot.scrollTo(0, 0);
          window.scrollTo(0, 0);
          setVisible(false);
          setIsExiting(false);
          setIsReTrigger(false);
          emitEvent(EVENTS.INTRO_DISMISSED);
        }
      }}
      // On bloque le clic (et le swipe) tant que canDismiss n'est pas true
      onClick={() => {
        if (canDismiss) dismiss();
      }}
      onTouchStart={e => setTouchStart(e.touches[0].clientY)}
      onTouchMove={e => {
        if (
          canDismiss &&
          touchStart &&
          touchStart - e.touches[0].clientY > 50
        ) {
          dismiss();
          setTouchStart(null);
        }
      }}
      onTouchEnd={() => setTouchStart(null)}
      onMouseMove={e => {
        if (!visible || isExiting || isMobileDevice) return;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        titleOffsetX.set(e.clientX - centerX);
        titleOffsetY.set(e.clientY - centerY);
        clearTitleIdleTimeout();
        titleIdleTimeoutRef.current = setTimeout(() => {
          resetTitleToCenter();
        }, 900);
      }}
      onMouseLeave={() => {
        clearTitleIdleTimeout();
        resetTitleToCenter();
      }}
    >
      <div className="relative w-full h-full">
        {desktopSrcs[0] && (
          <Image
            src={desktopSrcs[0]}
            alt="Loading background"
            fill
            unoptimized
            className={`absolute inset-0 w-full h-full object-cover z-0 hidden md:block ${currentIndex === 0 ? 'opacity-100' : 'opacity-0'}`}
            style={imageStyle}
            sizes="100vw"
            priority={true}
          />
        )}
        {mobileSrcs[0] && (
          <Image
            src={mobileSrcs[0]}
            alt="Loading background mobile"
            fill
            unoptimized
            className={`absolute inset-0 w-full h-full object-cover z-0 block md:hidden ${currentIndex === 0 ? 'opacity-100' : 'opacity-0'}`}
            style={imageStyle}
            sizes="100vw"
            priority={true}
          />
        )}

        {currentIndex > 0 && activeSrcs[currentIndex] && (
          <Image
            key={activeSrcs[currentIndex]}
            src={activeSrcs[currentIndex]}
            alt="Loading frame"
            fill
            unoptimized
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
            style={imageStyle}
            sizes="100vw"
          />
        )}

        <div className="absolute inset-0 bg-black/35 pointer-events-none z-10" />

        {/* L'indicateur de chargement reste tant que les images ne sont pas prêtes */}
        {!allLoaded && (desktopSrcs.length > 1 || mobileSrcs.length > 1) && (
          <div className="absolute top-8 right-8 z-20 pointer-events-none">
            <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
          </div>
        )}

        <div className="absolute inset-0 z-20 pointer-events-none select-none">
          <motion.div
            className="absolute top-1/2 left-1/2"
            style={{ x: titleX, y: titleY }}
          >
            <div style={{ transform: 'translate(-50%, -50%)' }}>
              <h2 className="text-whiteCustom/60 flex items-end flex-nowrap justify-center gap-4 text-2xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-8xl mb-0 drop-shadow-title">
                <div className="font-playfair italic leading-none">
                  Han-Noah
                </div>
                <div className="font-lexend font-bold leading-none">
                  MASSENGO
                </div>
              </h2>
            </div>
          </motion.div>
        </div>

        <div
          className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-500 ${canDismiss ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <NextButton
            isExiting={isExiting}
            onClick={e => {
              e.stopPropagation();
              if (canDismiss) dismiss();
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
