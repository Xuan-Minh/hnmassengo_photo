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

  // Refs pour le centrage du carrousel de noms
  const navRef = useRef(null);
  const mobileNavRef = useRef(null);
  const itemsRef = useRef([]);

  const currentImageVersionRef = useRef(0);
  const listTimersRef = useRef({ tick: null, swap: null, cancelled: 0 });

  // Logique de centrage du nom du projet
  const centerActiveProject = useCallback((index, containerRef) => {
    const container = containerRef.current;
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

    // Recentrer sur Desktop et Mobile
    centerActiveProject(currentProjectIndex, navRef);
    centerActiveProject(currentProjectIndex, mobileNavRef);
  }, [currentProjectIndex, projects, setActiveCoord, centerActiveProject]);

  // Navigation image (Animation d'apparition d'origine conservée)
  const navigateToImage = useCallback((projectIndex, imageIndex) => {
    currentImageVersionRef.current += 1;
    setIsListImageLoaded(false);
    setListImageError(false);
    setIsTransitioning(true); // Déclenche l'opacité 0
    setTimeout(() => {
      setCurrentProjectIndex(projectIndex);
      setCurrentImageIndex(imageIndex);
      setIsTransitioning(false); // Déclenche l'opacité 100
    }, 250);
  }, []);

  // ... (Conserver navigateListPrev, navigateListNext et les useEffect des Timers/Events tels quels)

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
      {/* Header Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-8 mb-12 mt-8 md:mt-12 w-full">
        <GalleryViewToggle view={view} onViewChange={onViewChange} />

        {/* CONTENEUR AVEC LE MASQUE */}
        <div className="flex-1 overflow-hidden mask-fade-edges">
          <div
            ref={navRef}
            /* AJOUT DU PADDING HORIZONTAL IMPORTANT */
            className="flex flex-row flex-nowrap overflow-x-auto no-scrollbar gap-x-16 py-2 scroll-smooth px-[40%]"
          >
            {projects.map((p, idx) => (
              <button
                key={p.id}
                ref={el => (itemsRef.current[idx] = el)}
                onClick={() => navigateToImage(idx, 0)}
                className={`text-lg font-playfair transition-all duration-500 relative whitespace-nowrap ${
                  idx === currentProjectIndex
                    ? 'font-bold opacity-100 scale-110'
                    : 'opacity-30 hover:opacity-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="w-[52px] flex-shrink-0"></div>
      </div>

      {/* ZONE IMAGE (Animation d'origine préservée) */}
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
              className="relative w-[85%] h-[50vh] lg:w-[70%] lg:h-[70vh] xl:w-[80%] xl:h-[80vh] cursor-pointer"
              onClick={() => onProjectSelect(projects[currentProjectIndex])}
            >
              <Image
                key={`${currentProjectIndex}-${currentImageIndex}`}
                src={currentListDisplaySrc}
                alt={projects[currentProjectIndex]?.name || ''}
                fill
                className={`object-contain transition-opacity duration-300 ${
                  isTransitioning || (!isListImageLoaded && !listImageError)
                    ? 'opacity-0'
                    : 'opacity-100'
                }`}
                onLoad={() => setIsListImageLoaded(true)}
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

      {/* Footer Mobile avec la même logique de padding */}
      <div className="lg:hidden w-full overflow-hidden mask-fade-edges mb-8">
        <div
          ref={mobileNavRef}
          className="flex flex-row flex-nowrap overflow-x-auto no-scrollbar gap-x-10 px-[40%] scroll-smooth"
        >
          {projects.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => navigateToImage(idx, 0)}
              className={`text-md font-playfair whitespace-nowrap transition-all ${
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
