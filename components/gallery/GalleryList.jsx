import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import { getOptimizedImageParams } from '../../lib/hooks';
import GalleryViewToggle from './GalleryViewToggle';

// Icônes de navigation internes
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

export default function GalleryList({
  projects,
  view,
  onViewChange,
  onProjectSelect,
  setActiveCoord,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isListImageLoaded, setIsListImageLoaded] = useState(false);
  const [listImageError, setListImageError] = useState(false);

  const mobileNavRef = useRef(null);
  const itemsRef = useRef([]);
  const scrollEndTimeoutRef = useRef(null);
  const currentImageVersionRef = useRef(0);
  const preloadedUrlsRef = useRef(new Set());
  const listTimersRef = useRef({ tick: null, swap: null, cancelled: 0 });

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 1024);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  // --- 1. DÉFINITION DES FONCTIONS DE NAVIGATION (Avant les useEffect) ---

  const navigateToImage = useCallback(
    (projectIndex, imageIndex) => {
      const transitionDelay = isMobile ? 80 : 250;
      currentImageVersionRef.current += 1;
      setIsListImageLoaded(false);
      setListImageError(false);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentProjectIndex(projectIndex);
        setCurrentImageIndex(imageIndex);
        setIsTransitioning(false);
      }, transitionDelay);
    },
    [isMobile]
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

  // --- 2. LOGIQUE DE CENTRAGE (Mobile uniquement) ---
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

  useEffect(() => {
    const project = projects[currentProjectIndex];
    setActiveCoord(project?.coords || '');
    centerActiveProject(currentProjectIndex);
  }, [currentProjectIndex, projects, setActiveCoord, centerActiveProject]);

  // Lorsque l'utilisateur arrête de scroller le carrousel mobile,
  // on calcule quel élément est centré et on le rend actif.
  useEffect(() => {
    const container = mobileNavRef.current;
    if (!container) return;

    const onScrollEnd = () => {
      const children = itemsRef.current || [];
      if (children.length === 0) return;

      // Si on est tout au début ou à la fin, sélectionner explicitement
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const edgeThreshold = 20; // px de tolérance aux bords

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
    };

    const onScroll = () => {
      if (scrollEndTimeoutRef.current)
        clearTimeout(scrollEndTimeoutRef.current);
      scrollEndTimeoutRef.current = setTimeout(onScrollEnd, 150);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('touchend', onScrollEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('touchend', onScrollEnd);
      if (scrollEndTimeoutRef.current)
        clearTimeout(scrollEndTimeoutRef.current);
    };
  }, [currentProjectIndex, navigateToImage]);

  // --- 3. TIMER AUTOMATIQUE ---
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
      setIsTransitioning(true);
      timers.swap = setTimeout(() => {
        if (timers.cancelled !== token) return;
        setCurrentProjectIndex(next.nextProjectIndex);
        setCurrentImageIndex(next.nextImageIndex);
        setIsTransitioning(false);
      }, 250);
    }, 3000);

    return () => {
      if (timers.tick) clearTimeout(timers.tick);
      if (timers.swap) clearTimeout(timers.swap);
    };
  }, [projects, currentProjectIndex, currentImageIndex]);

  // --- 4. ÉVÉNEMENTS CLAVIER ---
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'ArrowRight') navigateListNext();
      if (e.key === 'ArrowLeft') navigateListPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateListNext, navigateListPrev]);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col"
    >
      {/* DESKTOP : STATIQUE ET WRAP (Style commit efdfd36) */}
      <div className="hidden lg:flex items-center justify-between gap-8 mb-12 mt-8 md:mt-12 w-full">
        <GalleryViewToggle view={view} onViewChange={onViewChange} />
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 flex-1">
          {projects.map((p, idx) => (
            <button
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

      {/* ZONE IMAGE : ANIMATION OPACITÉ PRÉSERVÉE */}
      <div className="flex-1 relative w-full h-[100vh] flex items-center justify-center overflow-hidden">
        {currentListDisplaySrc && (
          <div className="relative w-full h-full flex items-center justify-center gap-4 px-4">
            <button
              onClick={navigateListPrev}
              className="z-10 opacity-40 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft />
            </button>
            <div
              className="relative w-[94%] h-[62vh] lg:w-[70%] lg:h-[70vh] xl:w-[80%] xl:h-[80vh] cursor-pointer"
              onClick={() => onProjectSelect(projects[currentProjectIndex])}
            >
              <Image
                key={`${currentProjectIndex}-${currentImageIndex}`}
                src={currentListDisplaySrc}
                alt={projects[currentProjectIndex]?.name || ''}
                fill
                sizes="(max-width: 1024px) 94vw, 70vw"
                className={`object-contain transition-opacity ${isMobile ? 'duration-150' : 'duration-300'} ${isTransitioning || (!isListImageLoaded && !listImageError) ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsListImageLoaded(true)}
                priority={!isMobile}
              />
            </div>
            <button
              onClick={navigateListNext}
              className="z-10 opacity-40 hover:opacity-100 transition-opacity"
            >
              <ArrowRight />
            </button>
          </div>
        )}
      </div>

      {/* MOBILE : CARROUSEL AVEC SCROLL ET CENTRAGE AUTOMATIQUE */}
      <div className="lg:hidden w-full overflow-hidden mask-fade-edges mb-8">
        <div
          ref={mobileNavRef}
          className="flex flex-row flex-nowrap overflow-x-auto no-scrollbar gap-x-10 px-[10%] scroll-smooth"
        >
          {projects.map((p, idx) => (
            <button
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
    </motion.div>
  );
}
