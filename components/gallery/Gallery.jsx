'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { GALLERY_FILTERS } from '../../lib/constants';
import client from '../../lib/sanity.client';

// Utiliser les données depuis Sanity
const FILTERS = GALLERY_FILTERS;

import GalleryGridMore from './GalleryGridMore';
import GalleryProjetCartel from './GalleryProjetCartel';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { buildSanityImageUrl } from '../../lib/imageUtils';

function getProjectDateMs(project) {
  const raw = project?.date;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export default function Gallery() {
  const t = useTranslations();
  const { locale } = useParams();
  const [projects, setProjects] = useState([]);

  // Le filtre ne doit impacter que la vue GRILLE
  const [gridFilter, setGridFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [hoveredId, setHoveredId] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Curseur personnalisé pour le nom du projet
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCustomCursor, setShowCustomCursor] = useState(false);

  // Mouvement de souris pour le curseur personnalisé
  useEffect(() => {
    const handleMouseMove = e => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Gérer le scroll quand un overlay est ouvert
  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;

    if (overlayOpen || selectedProject) {
      scrollRoot.style.overflow = 'hidden';
    } else {
      scrollRoot.style.overflow = '';
    }

    return () => {
      scrollRoot.style.overflow = '';
    };
  }, [overlayOpen, selectedProject]);

  // --- States pour le mode LIST ---
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isListImageLoaded, setIsListImageLoaded] = useState(false);
  const [listImageError, setListImageError] = useState(false);

  const listTimersRef = useRef({ tick: null, swap: null, cancelled: 0 });

  // Charger les projets depuis Sanity
  useEffect(() => {
    const fetchProjects = async () => {
      const data = await client.fetch(
        '*[_type == "project"] { ..., images[]{ asset->{ url } } }'
      );
      const mapped = data.map(p => ({
        id: p._id,
        name:
          p.name?.[locale] || p.name?.fr || p[`name_${locale}`] || p.name_fr,
        type: p.type,
        images: (p.images || []).map(img => img?.asset?.url).filter(Boolean),
        coords: p.coords,
        date: p.date,
        description:
          p.description?.[locale] ||
          p.description?.fr ||
          p[`description_${locale}`] ||
          p.description_fr,
      }));
      setProjects(mapped);
    };
    fetchProjects();
  }, [locale]);

  const handleViewChange = newView => {
    if (view === newView) return;
    setView(newView);
  };

  const projectsChrono = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      const am = getProjectDateMs(a);
      const bm = getProjectDateMs(b);

      // Sans date: on les met à la fin dans tous les cas
      if (am === null && bm === null)
        return (a?.name || '').localeCompare(b?.name || '');
      if (am === null) return 1;
      if (bm === null) return -1;

      return am - bm; // ancien -> récent
    });
    return arr;
  }, [projects]);

  const projectsRecentFirst = useMemo(() => {
    return [...projectsChrono].reverse();
  }, [projectsChrono]);

  const filteredProjectsList = useMemo(() => {
    return projectsChrono;
  }, [projectsChrono]);

  const filteredProjectsGrid = useMemo(() => {
    return projectsRecentFirst.filter(
      p => gridFilter === 'all' || p.type === gridFilter
    );
  }, [projectsRecentFirst, gridFilter]);

  const currentListSrc = useMemo(() => {
    return (
      filteredProjectsList[currentProjectIndex]?.images?.[currentImageIndex] ||
      null
    );
  }, [filteredProjectsList, currentProjectIndex, currentImageIndex]);

  const currentListDisplaySrc = useMemo(() => {
    return buildSanityImageUrl(currentListSrc, {
      w: 1600,
      q: 70,
      auto: 'format',
    });
  }, [currentListSrc]);

  useEffect(() => {
    if (view !== 'list') return;
    setCurrentProjectIndex(0);
    setCurrentImageIndex(0);
  }, [view, filteredProjectsList]);

  useEffect(() => {
    if (view !== 'list') return;
    setIsListImageLoaded(false);
    setListImageError(false);
  }, [view, currentListDisplaySrc]);

  useEffect(() => {
    const timers = listTimersRef.current;

    // Nettoyage des timers précédents
    if (timers.tick) clearTimeout(timers.tick);
    if (timers.swap) clearTimeout(timers.swap);
    timers.tick = null;
    timers.swap = null;

    if (view !== 'list') return;
    if (filteredProjectsList.length === 0) return;

    const currentProject = filteredProjectsList[currentProjectIndex];
    const currentImages = currentProject?.images || [];
    if (currentImages.length === 0) return;

    const token = (timers.cancelled += 1);

    const computeNext = () => {
      const proj = filteredProjectsList[currentProjectIndex];
      const imgs = proj?.images || [];
      if (imgs.length === 0) return null;

      if (currentImageIndex < imgs.length - 1) {
        return {
          nextProjectIndex: currentProjectIndex,
          nextImageIndex: currentImageIndex + 1,
        };
      }
      return {
        nextProjectIndex:
          (currentProjectIndex + 1) % filteredProjectsList.length,
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
        filteredProjectsList[next.nextProjectIndex]?.images?.[
          next.nextImageIndex
        ];
      const nextSrc = buildSanityImageUrl(nextRaw, {
        w: 1600,
        q: 70,
        auto: 'format',
      });

      // Précharger la prochaine image, puis fade-out -> swap -> fade-in
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
  }, [view, filteredProjectsList, currentProjectIndex, currentImageIndex]);

  // On veut toutes les images de tous les projets filtrés (pour le mode GRID)
  const allImages = useMemo(() => {
    return filteredProjectsGrid.flatMap(p =>
      (p.images || []).map((img, idx) => ({
        projectId: p.id,
        uniqueKey: `${p.id}-${idx}`,
        name: p.name,
        type: p.type,
        img,
        coords: p.coords,
        isFirst: idx === 0,
      }))
    );
  }, [filteredProjectsGrid]);

  // Nombre d'images à afficher selon la taille d'écran
  const [maxImages, setMaxImages] = useState(24);

  useEffect(() => {
    const updateMaxImages = () => {
      if (window.innerWidth >= 1536) {
        // 2xl: 7 cols x 8 rows = 56 - 1 (filtre) = 55 images
        setMaxImages(55);
      } else if (window.innerWidth >= 1024) {
        // lg: 6 cols x 8 rows = 48 - 1 (filtre) = 47 images
        setMaxImages(47);
      } else if (window.innerWidth >= 768) {
        // md: 5 cols x 5 rows = 25 - 1 (filtre) = 24 images
        setMaxImages(24);
      } else {
        // mobile: 2 cols x 6 rows = 12 images (compact mais lisible)
        setMaxImages(12);
      }
    };
    updateMaxImages();
    window.addEventListener('resize', updateMaxImages);
    return () => window.removeEventListener('resize', updateMaxImages);
  }, []);

  // Pour la grille, on garde toujours le même nombre de slots
  // afin d'avoir des transitions uniformes entre filtres.
  const gridSlots = useMemo(() => {
    return Array.from(
      { length: maxImages },
      (_, idx) => allImages[idx] || null
    );
  }, [allImages, maxImages]);

  // Gestion du curseur custom
  useEffect(() => {
    if (!hoveredId && view === 'grid') {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
      return;
    }
    // En mode list, le curseur pointer sur l'image centrale
    if (view === 'list') {
      setShowCustomCursor(false);
      // géré via CSS class
      return;
    }

    const project = projects.find(p => p.id === hoveredId);
    if (project) {
      document.body.style.cursor = 'none';
      setShowCustomCursor(true);
    }
    return () => {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
    };
  }, [hoveredId, view, projects]);

  // Basculement automatique en vue liste sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (view !== 'list') setView('list');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // Composant Controls (Filtres + Toggle View)
  const Controls = () => (
    <div
      className={`flex flex-col items-start p-4 md:p-6 font-playfair md:h-full ${
        view === 'grid' ? 'justify-center' : 'justify-start'
      }`}
    >
      <div className="hidden lg:flex gap-4 mb-1">
        <button
          className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
            view === 'grid' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          }`}
          onClick={() => handleViewChange('grid')}
          aria-label="Grid view"
        >
          <Image
            src="/icons/gridOff.webp"
            alt="Grid View Off"
            fill
            sizes="24px"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'grid' ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/icons/gridOn.webp"
            alt="Grid View On"
            fill
            sizes="24px"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'grid' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
        <button
          className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
            view === 'list' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          }`}
          onClick={() => handleViewChange('list')}
          aria-label="List view"
        >
          <Image
            src="/icons/listOff.webp"
            alt="List View Off"
            fill
            sizes="24px"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'list' ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/icons/listOn.webp"
            alt="List View On"
            fill
            sizes="24px"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'list' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      </div>
      {view === 'grid' && (
        <div className="relative z-10 flex flex-col gap-1 items-start pointer-events-auto">
          {FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              className={`text-sm md:text-base text-left relative group transition-opacity duration-300 whitespace-nowrap ${
                gridFilter === f.value
                  ? 'font-bold opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
              onPointerDown={e => {
                // Empêche un parent/overlay de capter le premier clic
                e.preventDefault();
                e.stopPropagation();
                setGridFilter(f.value);
              }}
            >
              {f.label}
              <span
                className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                  gridFilter === f.value ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
                style={{ pointerEvents: 'none' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <section id="works" className="relative w-full h-screen overflow-hidden">
        <div
          className={`w-full h-full flex flex-col justify-center items-center`}
        >
          <div className="relative flex flex-col justify-center items-start h-[75vh] lg:h-[90vh] w-[min(1000px,90vw)] 2xl:w-[min(1300px,90vw)]">
            <AnimatePresence mode="wait">
              {view === 'grid' ? (
                // --- MODE GRID ---
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="w-full h-full grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 2xl:grid-cols-7 grid-rows-6 md:grid-rows-5 lg:grid-rows-8 2xl:grid-rows-8 gap-x-2 gap-y-2 overflow-hidden lg:pt-10"
                >
                  {/* Case filtres + view */}
                  <div
                    key="filters"
                    className="flex items-center justify-center"
                  >
                    <Controls />
                  </div>

                  {/* Slots d'images (toujours maxImages) */}
                  {gridSlots.map((imgData, slotIdx) => {
                    const isHovered =
                      imgData && hoveredId === imgData.projectId;
                    const contentKey = imgData
                      ? `${gridFilter}-${imgData.uniqueKey}`
                      : `${gridFilter}-empty-${slotIdx}`;

                    return (
                      <div
                        key={`slot-${slotIdx}`}
                        className="relative w-full h-full overflow-hidden"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {imgData ? (
                            <motion.div
                              key={contentKey}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.35, ease: 'easeInOut' }}
                              className="relative group cursor-pointer flex items-center justify-center w-full h-full"
                              onMouseEnter={() =>
                                setHoveredId(imgData.projectId)
                              }
                              onMouseLeave={() => setHoveredId(null)}
                              onClick={() => {
                                const projectData = projects.find(
                                  p => p.id === imgData.projectId
                                );
                                setSelectedProject(projectData);
                              }}
                            >
                              <Image
                                src={imgData.img}
                                alt={imgData.name}
                                width={600}
                                height={400}
                                className={`max-w-full max-h-full object-contain shadow transition-opacity duration-300 ${
                                  isHovered ? 'opacity-100' : 'opacity-40'
                                }`}
                                style={{ objectFit: 'contain' }}
                                draggable={false}
                                sizes="(max-width: 768px) 45vw, (max-width: 1200px) 20vw, 18vw"
                                priority={slotIdx < 5}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key={contentKey}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.35, ease: 'easeInOut' }}
                              className="w-full h-full bg-transparent"
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                // --- MODE LIST ---
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="w-full h-full flex flex-col"
                >
                  {/* Ligne du haut : Boutons view + Liste projets - Desktop seulement */}
                  <div className="hidden lg:flex items-center justify-between gap-8 mb-12 mt-8 md:mt-12 w-full">
                    {/* Boutons de vue à gauche */}
                    <div className="flex gap-4 flex-shrink-0">
                      <button
                        className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
                          view === 'grid'
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                        onClick={() => handleViewChange('grid')}
                        aria-label="Grid view"
                      >
                        <Image
                          src="/icons/gridOff.webp"
                          alt="Grid View Off"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'grid' ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                        <Image
                          src="/icons/gridOn.webp"
                          alt="Grid View On"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'grid' ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </button>
                      <button
                        className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
                          view === 'list'
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                        onClick={() => handleViewChange('list')}
                        aria-label="List view"
                      >
                        <Image
                          src="/icons/listOff.webp"
                          alt="List View Off"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'list' ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                        <Image
                          src="/icons/listOn.webp"
                          alt="List View On"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'list' ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Liste des projets au centre */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 flex-1">
                      {filteredProjectsList.map((p, idx) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setCurrentProjectIndex(idx);
                            setCurrentImageIndex(0);
                          }}
                          className={`text-lg font-playfair transition-all duration-300 ${
                            idx === currentProjectIndex
                              ? 'font-bold underline underline-offset-4'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>

                    {/* Spacer à droite pour équilibrer */}
                    <div className="w-[52px] flex-shrink-0"></div>
                  </div>

                  {/* Zone centrale image (Slideshow) */}
                  <div className="flex-1 relative w-full h-[100vh] flex items-center justify-center overflow-hidden mt-0 md:mt-8 lg:mt-0">
                    {(() => {
                      const src = currentListDisplaySrc;
                      if (!src) return null;
                      return (
                        <div
                          className="relative w-[85%] h-[50vh] lg:w-[70%] lg:h-[70vh] xl:w-[80%] xl:h-[80vh] cursor-pointer"
                          onClick={() =>
                            setSelectedProject(
                              filteredProjectsList[currentProjectIndex]
                            )
                          }
                        >
                          <div
                            className={`absolute inset-0 animate-pulse transition-opacity duration-300 ${
                              isListImageLoaded || listImageError
                                ? 'opacity-0'
                                : 'opacity-100'
                            }`}
                          />
                          {listImageError && (
                            <div className="absolute inset-0 flex items-center justify-center text-blackCustom/60 font-playfair">
                              image indisponible
                            </div>
                          )}
                          <Image
                            key={`${currentProjectIndex}-${currentImageIndex}-${
                              filteredProjectsList[currentProjectIndex]
                                ?.images?.[currentImageIndex] || 'empty'
                            }`}
                            src={src}
                            alt={
                              filteredProjectsList[currentProjectIndex]?.name ||
                              ''
                            }
                            fill
                            className={`object-contain transition-opacity duration-300 ${
                              isTransitioning ||
                              (!isListImageLoaded && !listImageError)
                                ? 'opacity-0'
                                : 'opacity-100'
                            }`}
                            // En LIST, on demande volontairement un peu plus petit qu'en GRID
                            // pour réduire le temps de chargement du premier affichage.
                            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 55vw"
                            quality={60}
                            unoptimized
                            onError={() => setListImageError(true)}
                            onLoadingComplete={() => setIsListImageLoaded(true)}
                            priority
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Liste des projets en bas - Mobile seulement */}
                  <div className="lg:hidden flex flex-row flex-wrap justify-center gap-x-6 gap-y-3 mt-3">
                    {filteredProjectsList.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCurrentProjectIndex(idx);
                          setCurrentImageIndex(0);
                        }}
                        className={`text-lg font-playfair transition-all duration-300 ${
                          idx === currentProjectIndex
                            ? 'font-bold underline underline-offset-4'
                            : 'opacity-60'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer commun */}
          <div
            style={{ width: 'min(1100px, 90vw)' }}
            className="grid lg:grid-cols-3 grid-cols-2 items-center mt-16 lg:mt-4"
          >
            <div className="text-xl font-playfair italic text-blackCustom h-8">
              {view === 'grid'
                ? hoveredId && projects.find(p => p.id === hoveredId)?.coords
                : filteredProjectsList[currentProjectIndex]?.coords}
            </div>
            {view === 'grid' && (
              <button
                className="justify-self-center text-xl font-playfair italic text-blackCustom hover:text-accentHover transition-all duration-300 px-4 py-2 rounded opacity-100 animate-in fade-in"
                onClick={() => setOverlayOpen(true)}
              >
                see more
              </button>
            )}
            <div></div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {overlayOpen && (
          <GalleryGridMore
            onClose={() => setOverlayOpen(false)}
            onProjectClick={project => setSelectedProject(project)}
            projects={projects}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedProject && (
          <GalleryProjetCartel
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
      {/* Custom cursor for project name */}
      <AnimatePresence>
        {showCustomCursor && hoveredId && (
          <motion.div
            className="fixed pointer-events-none z-[1000] text-whiteCustom font-playfair italic text-lg"
            style={{
              left: cursorPos.x + 10,
              top: cursorPos.y + 10,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {projects.find(p => p.id === hoveredId)?.name}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
