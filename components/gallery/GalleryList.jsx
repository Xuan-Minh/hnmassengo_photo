// components/gallery/GalleryList.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import { getOptimizedImageParams } from '../../lib/hooks';
import GalleryViewToggle from './GalleryViewToggle';

export default function GalleryList({
  projects,
  view,
  onViewChange,
  onProjectSelect,
  setActiveCoord,
}) {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isListImageLoaded, setIsListImageLoaded] = useState(false);
  const [listImageError, setListImageError] = useState(false);
  const [listTouchStart, setListTouchStart] = useState(null);

  const currentImageVersionRef = useRef(0);
  const listTimersRef = useRef({ tick: null, swap: null, cancelled: 0 });

  // Transmettre les coordonnées au footer parent
  useEffect(() => {
    const project = projects[currentProjectIndex];
    setActiveCoord(project?.coords || '');
  }, [currentProjectIndex, projects, setActiveCoord]);

  // Navigation image
  const navigateToImage = useCallback((projectIndex, imageIndex) => {
    currentImageVersionRef.current += 1;
    setIsListImageLoaded(false);
    setListImageError(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentProjectIndex(projectIndex);
      setCurrentImageIndex(imageIndex);
      setIsTransitioning(false);
    }, 250);
  }, []);

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

  // Timer automatique
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
      const imgs = projects[currentProjectIndex]?.images || [];
      if (imgs.length === 0) return null;
      if (currentImageIndex < imgs.length - 1) {
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

    const preload = src => {
      return new Promise(resolve => {
        if (!src || typeof window === 'undefined') return resolve();
        const img = new window.Image();
        const done = () => resolve();
        img.onload = done;
        img.onerror = done;
        img.src = src;
      });
    };

    listTimersRef.current.tick = setTimeout(async () => {
      const next = computeNext();
      if (!next) return;
      const nextRaw =
        projects[next.nextProjectIndex]?.images?.[next.nextImageIndex];
      const nextSrc = buildSanityImageUrl(nextRaw, {
        ...getOptimizedImageParams('gallery'),
        auto: 'format',
      });

      await preload(nextSrc);
      if (timers.cancelled !== token) return;

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
      timers.tick = null;
      timers.swap = null;
    };
  }, [projects, currentProjectIndex, currentImageIndex]);

  // Evénements tactiles et clavier
  useEffect(() => {
    const handleTouchStart = e => setListTouchStart(e.touches[0].clientX);
    const handleTouchEnd = e => {
      if (listTouchStart === null) return;
      const diff = listTouchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50)
        diff > 0 ? navigateListNext() : navigateListPrev();
      setListTouchStart(null);
    };
    const handleKeyDown = e => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateListNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateListPrev();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchend', handleTouchEnd, false);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, false);
      window.removeEventListener('touchend', handleTouchEnd, false);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [listTouchStart, navigateListNext, navigateListPrev]);

  const currentListSrc =
    projects[currentProjectIndex]?.images?.[currentImageIndex] || null;
  const currentListDisplaySrc = currentListSrc
    ? buildSanityImageUrl(currentListSrc, {
        ...getOptimizedImageParams('gallery'),
        auto: 'format',
      })
    : null;

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-full h-full flex flex-col"
    >
      <div className="hidden lg:flex items-center justify-between gap-8 mb-12 mt-8 md:mt-12 w-full">
        <GalleryViewToggle view={view} onViewChange={onViewChange} />

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 flex-1">
          {projects.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => navigateToImage(idx, 0)}
              className={`text-lg font-playfair transition-opacity duration-300 relative group whitespace-nowrap ${
                idx === currentProjectIndex
                  ? 'font-bold opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {p.name}
              <span
                className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                  idx === currentProjectIndex
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}
                style={{ pointerEvents: 'none' }}
              />
            </button>
          ))}
        </div>
        <div className="w-[52px] flex-shrink-0"></div>
      </div>

      <div className="flex-1 relative w-full h-[100vh] flex items-center justify-center overflow-hidden mt-0 md:mt-8 lg:mt-0">
        {currentListDisplaySrc &&
          (() => {
            const capturedVersion = currentImageVersionRef.current;
            return (
              <div className="relative w-full h-full flex items-center justify-center gap-4 px-4">
                <button
                  onClick={navigateListPrev}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300"
                  aria-label="Previous"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                <div
                  className="relative w-[85%] h-[50vh] lg:w-[70%] lg:h-[70vh] xl:w-[80%] xl:h-[80vh] cursor-pointer flex-shrink-0"
                  onClick={() => onProjectSelect(projects[currentProjectIndex])}
                >
                  <div
                    className={`absolute inset-0 animate-pulse transition-opacity duration-300 ${isListImageLoaded || listImageError ? 'opacity-0' : 'opacity-100'}`}
                  />
                  {listImageError && (
                    <div className="absolute inset-0 flex items-center justify-center text-accent font-playfair">
                      image indisponible
                    </div>
                  )}
                  <Image
                    key={`${currentProjectIndex}-${currentImageIndex}`}
                    src={currentListDisplaySrc}
                    alt={projects[currentProjectIndex]?.name || ''}
                    fill
                    className={`object-contain transition-opacity duration-300 ${isTransitioning || (!isListImageLoaded && !listImageError) ? 'opacity-0' : 'opacity-100'}`}
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 55vw"
                    quality={60}
                    unoptimized
                    onError={() => {
                      if (currentImageVersionRef.current === capturedVersion)
                        setListImageError(true);
                    }}
                    onLoad={() => {
                      if (currentImageVersionRef.current === capturedVersion)
                        setIsListImageLoaded(true);
                    }}
                    priority
                  />
                </div>

                <button
                  onClick={navigateListNext}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300"
                  aria-label="Next"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            );
          })()}
      </div>

      <div className="lg:hidden flex flex-row flex-wrap justify-center gap-x-6 gap-y-3 mt-3">
        {projects.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => navigateToImage(idx, 0)}
            className={`text-lg font-playfair transition-opacity duration-300 relative group whitespace-nowrap ${
              idx === currentProjectIndex
                ? 'font-bold opacity-100'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            {p.name}
            <span
              className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                idx === currentProjectIndex
                  ? 'w-full'
                  : 'w-0 group-hover:w-full'
              }`}
              style={{ pointerEvents: 'none' }}
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
