'use client';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
  useLayoutEffect,
} from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { EVENTS, emitEvent, addEventHandler } from '../../lib/events';
import { buildSanityImageUrl } from '../../lib/imageUtils';

const imageStyle = {
  filter: 'brightness(0.42) contrast(1.05) saturate(0.9)',
  transform: 'scale(1.04)',
  transition: 'opacity 0.1s ease-in-out',
};

// NextButton: Regroupement des petits états locaux pour rester cohérent
function NextButton({ isExiting, onClick }) {
  const [state, dispatch] = useReducer((s, action) => ({ ...s, ...action }), {
    hovered: false,
    clickCount: 0,
  });
  const { hovered, clickCount } = state;

  const rotateValue = useMemo(() => {
    const exitRotation = isExiting ? -90 : 0;
    return exitRotation + clickCount * 360;
  }, [isExiting, clickCount]);

  return (
    <button
      type="button"
      aria-label="next"
      onClick={e => {
        dispatch({ clickCount: clickCount + 1 });
        onClick?.(e);
      }}
      onMouseEnter={() => dispatch({ hovered: true })}
      onMouseLeave={() => dispatch({ hovered: false })}
      className={`px-6 py-3 text-xl text-whiteCustom lg:hidden font-medium font-liberation transition-colors duration-300 ${hovered ? 'opacity-100 backdrop-blur-[2px]' : 'text-greyCustom opacity-85'}`}
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

const getImageSource = (img, width) => {
  if (img?.image && img.image.asset) {
    return buildSanityImageUrl(img.image, {
      w: width,
      q: 60,
      auto: 'format',
    });
  }
  if (img?.url) {
    return buildSanityImageUrl(img.url, { w: width, q: 60, auto: 'format' });
  }
  return null;
};

// 1. Définition de l'état initial pour l'Overlay
const initialState = {
  visible: true,
  isExiting: false,
  currentIndex: 0,
  allLoaded: false,
  isReTrigger: false,
  touchStart: null,
  isMobileDevice: false,
};

// 2. Définition du Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'NEXT_FRAME':
      return {
        ...state,
        currentIndex: (state.currentIndex + 1) % action.payload,
      };
    default:
      return state;
  }
}

export default function LoadingOverlay({ initialImages }) {
  const previouslyFocusedElement = useRef(null);
  const elegantBackground =
    'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)';

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

  const desktopSrcs = useMemo(
    () => desktopData.map(img => getImageSource(img, 1920)).filter(Boolean),
    [desktopData]
  );

  const mobileSrcs = useMemo(
    () => mobileData.map(img => getImageSource(img, 1080)).filter(Boolean),
    [mobileData]
  );

  // 3. Initialisation du Reducer
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    visible,
    isExiting,
    currentIndex,
    allLoaded,
    isReTrigger,
    touchStart,
    isMobileDevice,
  } = state;

  const rotateInterval = useRef(null);
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

  useLayoutEffect(() => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { isMobileDevice: window.innerWidth < 768 },
    });
    const checkMobile = () =>
      dispatch({
        type: 'UPDATE_STATE',
        payload: { isMobileDevice: window.innerWidth < 768 },
      });

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
    if (activeSrcs.length <= 1) {
      dispatch({ type: 'UPDATE_STATE', payload: { allLoaded: true } });
      return;
    }

    dispatch({ type: 'UPDATE_STATE', payload: { allLoaded: false } });

    let done = 0;
    const total = activeSrcs.length;

    const timeout = setTimeout(() => {
      dispatch({ type: 'UPDATE_STATE', payload: { allLoaded: true } });
    }, 5000);

    activeSrcs.forEach(src => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        done++;
        if (done === total) {
          clearTimeout(timeout);
          dispatch({ type: 'UPDATE_STATE', payload: { allLoaded: true } });
        }
      };
      img.src = src;
    });

    return () => clearTimeout(timeout);
  }, [activeSrcs]);

  useEffect(() => {
    if (!visible || isExiting || !allLoaded) return;
    if (activeSrcs.length <= 1) return;

    rotateInterval.current = setInterval(() => {
      dispatch({ type: 'NEXT_FRAME', payload: activeSrcs.length });
    }, 800);

    return () => clearInterval(rotateInterval.current);
  }, [visible, isExiting, allLoaded, activeSrcs.length]);

  const dismiss = () => {
    if (isExiting) return;
    dispatch({ type: 'UPDATE_STATE', payload: { isExiting: true } });
  };

  useEffect(() => {
    const handler = () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
      // Elimination of fan-out: 4 states updated in a single render cycle
      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          currentIndex: 0,
          isExiting: false,
          isReTrigger: true,
          visible: true,
        },
      });
    };
    return addEventHandler(EVENTS.INTRO_SHOW, handler);
  }, []);

  if (!visible && !isExiting) return null;

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

          // Elimination of fan-out: 3 states updated in a single render cycle
          dispatch({
            type: 'UPDATE_STATE',
            payload: {
              visible: false,
              isExiting: false,
              isReTrigger: false,
            },
          });
          emitEvent(EVENTS.INTRO_DISMISSED);
        }
      }}
      onClick={() => {
        if (canDismiss) dismiss();
      }}
      onTouchStart={e =>
        dispatch({
          type: 'UPDATE_STATE',
          payload: { touchStart: e.touches[0].clientY },
        })
      }
      onTouchMove={e => {
        if (
          canDismiss &&
          touchStart &&
          touchStart - e.touches[0].clientY > 50
        ) {
          dismiss();
          dispatch({ type: 'UPDATE_STATE', payload: { touchStart: null } });
        }
      }}
      onTouchEnd={() =>
        dispatch({ type: 'UPDATE_STATE', payload: { touchStart: null } })
      }
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
              <h2 className="text-whiteCustom/60 flex flex-row items-baseline justify-center gap-2 md:gap-4 text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl mb-0 drop-shadow-title whitespace-nowrap">
                <span className="font-liberation italic leading-none">
                  Han-Noah
                </span>
                <span className="font-liberation font-bold leading-none">
                  MASSENGO
                </span>
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
