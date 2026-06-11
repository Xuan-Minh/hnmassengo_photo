import { useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import { getOptimizedImageParams, useEffectEvent } from '../../lib/hooks';
import GalleryViewToggle from './GalleryViewToggle';

const ArrowLeft = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ArrowRight = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const initialState = {
  isMobile: false,
  currentProjectIndex: 0,
  currentImageIndex: 0,
  isTransitioning: false,
  isListImageLoaded: false,
  listImageError: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default function GalleryList({
  projects,
  view,
  onViewChange,
  onProjectSelect,
  setActiveCoord,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    isMobile,
    currentProjectIndex,
    currentImageIndex,
    isTransitioning,
    isListImageLoaded,
    listImageError,
  } = state;

  const mobileNavRef = useRef(null);
  const itemsRef = useRef([]);
  const scrollEndTimeoutRef = useRef(null);
  const currentImageVersionRef = useRef(0);
  const listTimersRef = useRef({ tick: null, swap: null, cancelled: 0 });

  // Initialisation paresseuse de la ref
  const preloadedUrlsRef = useRef(null);
  if (preloadedUrlsRef.current === null) {
    preloadedUrlsRef.current = new Set();
  }

  useEffect(() => {
    const updateMobile = () =>
      dispatch({
        type: 'UPDATE_STATE',
        payload: { isMobile: window.innerWidth < 1024 },
      });

    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  const navigateToImage = useCallback(
    (projectIndex, imageIndex) => {
      const transitionDelay = isMobile ? 80 : 250;
      currentImageVersionRef.current += 1;

      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          isListImageLoaded: false,
          listImageError: false,
          isTransitioning: true,
        },
      });

      setTimeout(() => {
        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            currentProjectIndex: projectIndex,
            currentImageIndex: imageIndex,
            isTransitioning: false,
          },
        });
        // CORRECTION : On met à jour le parent en même temps que le state local (pas de useEffect)
        setActiveCoord(projects[projectIndex]?.coords || '');
      }, transitionDelay);
    },
    [isMobile, projects, setActiveCoord]
  );

  const navigateListPrev = useCallback(() => {
    if (currentImageIndex > 0) {
      navigateToImage(currentProjectIndex, currentImageIndex - 1);
    } else {
      const prevProjectIndex =
        currentProjectIndex === 0
          ? projects.length - 1
          : currentProjectIndex - 1;
      const prevImages = projects[prevProjectIndex]?.images || [];
      navigateToImage(prevProjectIndex, Math.max(0, prevImages.length - 1));
    }
  }, [currentProjectIndex, currentImageIndex, projects, navigateToImage]);

  const navigateListNext = useCallback(() => {
    const currentImages = projects[currentProjectIndex]?.images || [];
    if (currentImageIndex < currentImages.length - 1) {
      navigateToImage(currentProjectIndex, currentImageIndex + 1);
    } else {
      navigateToImage((currentProjectIndex + 1) % projects.length, 0);
    }
  }, [currentProjectIndex, currentImageIndex, projects, navigateToImage]);

  const centerActiveProject = useCallback(index => {
    const container = mobileNavRef.current;
    const activeItem = itemsRef.current[index];
    if (container && activeItem) {
      const scrollLeft =
        activeItem.offsetLeft -
        container.offsetWidth / 2 +
        activeItem.offsetWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, []);

  // CORRECTION : Ce useEffect ne fait plus appel à setActiveCoord.
  // Il se contente uniquement de son rôle de manipulation de l'UI (le scroll DOM).
  useEffect(() => {
    centerActiveProject(currentProjectIndex);
  }, [currentProjectIndex, centerActiveProject]);

  const handleScrollEnd = useEffectEvent(() => {
    const container = mobileNavRef.current;
    if (!container) return;

    const children = itemsRef.current || [];
    if (children.length === 0) return;

    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const edgeThreshold = 20;

    let closestIndex = 0;
    if (scrollLeft <= edgeThreshold) {
      closestIndex = 0;
    } else if (scrollLeft >= maxScrollLeft - edgeThreshold) {
      closestIndex = children.length - 1;
    } else {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let minDist = Infinity;
      children.forEach((el, idx) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const d = Math.abs(center - containerCenter);
        if (d < minDist) {
          minDist = d;
          closestIndex = idx;
        }
      });
    }

    if (closestIndex !== currentProjectIndex) {
      navigateToImage(closestIndex, 0);
    }
  });

  useEffect(() => {
    const container = mobileNavRef.current;
    if (!container) return;

    const onScroll = () => {
      if (scrollEndTimeoutRef.current)
        clearTimeout(scrollEndTimeoutRef.current);
      scrollEndTimeoutRef.current = setTimeout(handleScrollEnd, 150);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('touchend', handleScrollEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('touchend', handleScrollEnd);
      if (scrollEndTimeoutRef.current)
        clearTimeout(scrollEndTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const timers = listTimersRef.current;
    if (timers.tick) clearTimeout(timers.tick);
    if (timers.swap) clearTimeout(timers.swap);
    timers.tick = null;
    timers.swap = null;

    if (projects.length === 0) return;
    const currentImages = projects[currentProjectIndex]?.images || [];
    if (currentImages.length === 0) return;

    const token = (timers.cancelled += 1);

    const computeNext = () => {
      if (currentImageIndex < currentImages.length - 1) {
        return {
          nextProjectIndex: currentProjectIndex,
          nextImageIndex: currentImageIndex + 1,
        };
      }
      return {
        nextProjectIndex: (currentProjectIndex + 1) % projects.length,
        nextImageIndex: 0,
      };
    };

    timers.tick = setTimeout(() => {
      const next = computeNext();
      if (!next || timers.cancelled !== token) return;

      dispatch({ type: 'UPDATE_STATE', payload: { isTransitioning: true } });

      timers.swap = setTimeout(() => {
        if (timers.cancelled !== token) return;

        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            currentProjectIndex: next.nextProjectIndex,
            currentImageIndex: next.nextImageIndex,
            isTransitioning: false,
          },
        });
        // CORRECTION : On met à jour le parent en même temps que le timer (pas de useEffect)
        setActiveCoord(projects[next.nextProjectIndex]?.coords || '');
      }, 250);
    }, 3000);

    return () => {
      if (timers.tick) clearTimeout(timers.tick);
      if (timers.swap) clearTimeout(timers.swap);
    };
  }, [projects, currentProjectIndex, currentImageIndex, setActiveCoord]);

  const handleKeyDown = useEffectEvent(e => {
    if (e.key === 'ArrowRight') navigateListNext();
    if (e.key === 'ArrowLeft') navigateListPrev();
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const galleryParams = getOptimizedImageParams('gallery', isMobile);
  const imageParams = useMemo(
    () => ({
      ...galleryParams,
      q: isMobile ? 68 : galleryParams.q,
      auto: 'format',
    }),
    [galleryParams, isMobile]
  );

  const getDisplaySrcAt = useCallback(
    (projectIndex, imageIndex) => {
      const source = projects[projectIndex]?.images?.[imageIndex] || null;
      if (!source) return null;
      return buildSanityImageUrl(source, imageParams);
    },
    [projects, imageParams]
  );

  const currentListDisplaySrc = getDisplaySrcAt(
    currentProjectIndex,
    currentImageIndex
  );

  useEffect(() => {
    if (projects.length === 0 || typeof window === 'undefined') return;
    const currentImages = projects[currentProjectIndex]?.images || [];
    if (currentImages.length === 0) return;

    const prevTarget =
      currentImageIndex > 0
        ? {
            projectIndex: currentProjectIndex,
            imageIndex: currentImageIndex - 1,
          }
        : {
            projectIndex:
              currentProjectIndex === 0
                ? projects.length - 1
                : currentProjectIndex - 1,
            imageIndex: Math.max(
              0,
              (
                projects[
                  currentProjectIndex === 0
                    ? projects.length - 1
                    : currentProjectIndex - 1
                ]?.images || []
              ).length - 1
            ),
          };

    const nextTarget =
      currentImageIndex < currentImages.length - 1
        ? {
            projectIndex: currentProjectIndex,
            imageIndex: currentImageIndex + 1,
          }
        : {
            projectIndex: (currentProjectIndex + 1) % projects.length,
            imageIndex: 0,
          };

    const preload = url => {
      if (!url || preloadedUrlsRef.current.has(url)) return;
      preloadedUrlsRef.current.add(url);
      const img = new window.Image();
      img.src = url;
    };

    preload(getDisplaySrcAt(prevTarget.projectIndex, prevTarget.imageIndex));
    preload(getDisplaySrcAt(nextTarget.projectIndex, nextTarget.imageIndex));
  }, [projects, currentProjectIndex, currentImageIndex, getDisplaySrcAt]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col"
    >
      <div className="hidden lg:flex items-center justify-between gap-8 mb-12 mt-8 md:mt-12 w-full">
        <GalleryViewToggle view={view} onViewChange={onViewChange} />
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 flex-1">
          {projects.map((p, idx) => (
            <button
              type="button"
              key={p.id}
              onClick={() => navigateToImage(idx, 0)}
              className={`text-lg font-liberation transition-opacity duration-300 relative group whitespace-nowrap ${
                idx === currentProjectIndex
                  ? 'font-bold opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {p.name}
              <span
                className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ${idx === currentProjectIndex ? 'w-full' : 'w-0 group-hover:w-full'}`}
              />
            </button>
          ))}
        </div>
        <div className="w-[52px] flex-shrink-0" />
      </div>

      <div className="flex-1 relative w-full h-[100vh] flex items-center justify-center overflow-hidden">
        {currentListDisplaySrc && (
          <div className="relative w-full h-full flex items-center justify-center gap-4 px-4">
            <button
              type="button"
              onClick={navigateListPrev}
              className="z-10 opacity-40 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              onClick={() => onProjectSelect(projects[currentProjectIndex])}
              className="relative w-[94%] h-[62vh] lg:w-[70%] lg:h-[70vh] xl:w-[80%] xl:h-[80vh] cursor-pointer"
              onKeyPress={e => {
                if (e.key === 'Enter')
                  onProjectSelect(projects[currentProjectIndex]);
              }}
            >
              <Image
                key={`${currentProjectIndex}-${currentImageIndex}`}
                src={currentListDisplaySrc}
                alt={projects[currentProjectIndex]?.name || ''}
                fill
                sizes="(max-width: 1024px) 94vw, 70vw"
                className={`object-contain transition-opacity ${isMobile ? 'duration-150' : 'duration-300'} ${isTransitioning || (!isListImageLoaded && !listImageError) ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() =>
                  dispatch({
                    type: 'UPDATE_STATE',
                    payload: { isListImageLoaded: true },
                  })
                }
                priority={!isMobile}
              />
            </button>
            <button
              type="button"
              onClick={navigateListNext}
              className="z-10 opacity-40 hover:opacity-100 transition-opacity"
            >
              <ArrowRight />
            </button>
          </div>
        )}
      </div>

      <div className="lg:hidden w-full overflow-hidden mask-fade-edges mb-8">
        <div
          ref={mobileNavRef}
          className="flex flex-row flex-nowrap overflow-x-auto no-scrollbar gap-x-10 px-[10%] scroll-smooth"
        >
          {projects.map((p, idx) => (
            <button
              type="button"
              key={p.id}
              ref={el => (itemsRef.current[idx] = el)}
              onClick={() => navigateToImage(idx, 0)}
              className={`text-[20px] font-liberation whitespace-nowrap transition-all ${
                idx === currentProjectIndex
                  ? 'font-bold opacity-100 scale-105'
                  : 'opacity-30'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </m.div>
  );
}
