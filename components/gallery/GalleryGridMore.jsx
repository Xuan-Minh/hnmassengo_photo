'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  getSanityImageDeliveryUrl,
  isSanityCdnUrl,
} from '../../lib/imageUtils';

function getProjectDateMs(project) {
  const raw = project?.date;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

const FILTERS = [
  { label: 'all', value: 'all' },
  { label: 'artworks', value: 'artwork' },
  { label: 'commissions', value: 'commission' },
];

export default function GalleryGridMore({
  onClose,
  onProjectClick,
  projects = [],
}) {
  const t = useTranslations('gallery');
  const [filter, setFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);
  const [isHoverSourceGrid, setIsHoverSourceGrid] = useState(false);
  const scrollContainerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const projectsRecentFirst = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      const am = getProjectDateMs(a);
      const bm = getProjectDateMs(b);

      // Sans date: on les met à la fin
      if (am === null && bm === null)
        return (a?.name || '').localeCompare(b?.name || '');
      if (am === null) return 1;
      if (bm === null) return -1;

      return bm - am; // récent -> ancien
    });
    return arr;
  }, [projects]);

  const handleSidebarHover = projectId => {
    setHoveredId(projectId);
    if (!projectId) return;

    const targetEl = document.getElementById(`project-start-${projectId}`);
    const container = scrollContainerRef.current;

    if (targetEl && container) {
      // Calcul du défilement pour centrer l'image verticalement
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const scrollPos =
        container.scrollTop +
        (targetRect.top - containerRect.top) -
        containerRect.height / 2 +
        targetRect.height / 2;

      container.scrollTo({
        top: scrollPos,
        behavior: 'smooth',
      });
    }
  };

  // Curseur personnalisé pour le nom du projet
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCustomCursor, setShowCustomCursor] = useState(false);

  // Mouvement de souris pour le curseur personnalisé (throttled)
  useEffect(() => {
    let rafId = null;
    const handleMouseMove = e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setCursorPos({ x: e.clientX, y: e.clientY });
        rafId = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Gestion du curseur custom
  useEffect(() => {
    if (!hoveredId || !isHoverSourceGrid) {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
      return;
    }

    const project = projectsRecentFirst.find(p => p.id === hoveredId);
    if (project) {
      document.body.style.cursor = 'none';
      setShowCustomCursor(true);
    }
    return () => {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
    };
  }, [hoveredId, projectsRecentFirst, isHoverSourceGrid]);

  // Filtrage des projets
  const filteredProjects = useMemo(() => {
    return projectsRecentFirst.filter(
      p => filter === 'all' || p.type === filter
    );
  }, [projectsRecentFirst, filter]);

  // On veut toutes les images de tous les projets filtrés
  const allImages = useMemo(() => {
    return filteredProjects.flatMap(p =>
      (p.images || [])
        .filter(Boolean)
        .map((img, idx) => {
          const src = getSanityImageDeliveryUrl(img, { w: 640, q: 70 });
          if (!src) return null;

          return {
            projectId: p.id,
            project: p,
            name: p.name,
            type: p.type,
            src,
            coords: p.coords,
            isFirst: idx === 0,
            isSanityImage: isSanityCdnUrl(src),
          };
        })
        .filter(Boolean)
    );
  }, [filteredProjects]);

  // Virtualisation : calculer les images visibles
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemHeight = 200; // hauteur approximative d'un item
      const cols =
        window.innerWidth >= 1536
          ? 9
          : window.innerWidth >= 1280
            ? 8
            : window.innerWidth >= 1024
              ? 7
              : window.innerWidth >= 768
                ? 6
                : window.innerWidth >= 640
                  ? 3
                  : 2;

      const rowsVisible = Math.ceil(containerHeight / itemHeight);
      const currentRow = Math.floor(scrollTop / itemHeight);

      const start = Math.max(0, (currentRow - 2) * cols); // 2 lignes avant
      const end = Math.min(
        allImages.length,
        (currentRow + rowsVisible + 2) * cols
      ); // 2 lignes après

      setVisibleRange({ start, end });
    };

    updateVisibleRange();

    const handleScroll = () => {
      requestAnimationFrame(updateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateVisibleRange);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateVisibleRange);
    };
  }, [allImages.length]);

  const handleImageClick = project => {
    onProjectClick(project);
    // On ne ferme plus la grille ici, pour que le cartel s'ouvre par-dessus
  };

  // Trouver le projet survolé pour afficher les coordonnées
  const hoveredProject = projectsRecentFirst.find(p => p.id === hoveredId);

  return (
    <motion.div
      className="fixed inset-0 bg-background z-[100] flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Bouton Back */}
      <div className="absolute top-8 left-8 md:top-16 md:left-16 z-50">
        <button
          onClick={onClose}
          className="text-lg font-playfair text-accent hover:text-blackCustom transition-colors"
        >
          back
        </button>
      </div>

      {/* Header */}
      <div className="relative w-full h-24 flex items-center justify-center px-8 md:px-16 shrink-0">
        <h2 className="text-4xl font-playfair italic text-blackCustom/20">
          {t('title')}
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden px-8 md:px-16 pb-16">
        {/* Sidebar Filters & Projects List */}
        <div className="w-48 flex flex-col pt-8 shrink-0 overflow-y-auto no-scrollbar pb-16">
          <div className="flex flex-col gap-2 mb-12">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`text-lg text-left font-playfair transition-colors duration-300 ${
                  filter === f.value
                    ? 'font-bold text-blackCustom'
                    : 'text-accent hover:text-blackCustom'
                }`}
                onClick={() => setFilter(f.value)}
              >
                {t(`filters.${f.value}`)}
              </button>
            ))}
          </div>

          {/* Liste dynamique des projets */}
          <ul className="flex flex-col gap-3">
            {filteredProjects.map(p => (
              <li key={p.id}>
                <button
                  className="text-sm md:text-base text-left font-playfair transition-colors duration-300 text-accent hover:text-blackCustom"
                  onClick={() => handleImageClick(p)}
                  onMouseEnter={() => {
                    handleSidebarHover(p.id);
                    setIsHoverSourceGrid(false);
                  }}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pl-8" ref={scrollContainerRef}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-2 pb-16">
            {allImages.map((imgData, index) => {
              const isHovered = hoveredId === imgData.projectId;
              const isVisible =
                index >= visibleRange.start && index < visibleRange.end;

              return (
                <div
                  id={
                    imgData.isFirst
                      ? `project-start-${imgData.projectId}`
                      : undefined
                  }
                  key={imgData.projectId + '-' + index}
                  className="relative group cursor-pointer flex items-center justify-center w-full h-full overflow-hidden"
                  onMouseEnter={() => {
                    setHoveredId(imgData.projectId);
                    setIsHoverSourceGrid(true);
                  }}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    setIsHoverSourceGrid(false);
                  }}
                  onClick={() => handleImageClick(imgData.project)}
                  style={{ minHeight: '200px' }}
                >
                  {isVisible && (
                    <Image
                      src={imgData.src}
                      alt={imgData.name}
                      width={200}
                      height={300}
                      unoptimized={imgData.isSanityImage}
                      className={`max-w-[90%] max-h-[90%] 2xl:max-w-[98%] 2xl:max-h-[98%] object-contain shadow transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-40'
                      }`}
                      style={{ objectFit: 'contain' }}
                      draggable={false}
                      sizes="(max-width: 768px) 45vw, 128px"
                      loading="lazy"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Coords */}
      <div className="absolute bottom-8 left-8 md:left-16 text-xl font-playfair italic text-blackCustom pointer-events-none">
        {hoveredProject ? hoveredProject.coords : ''}
      </div>
      {/* Custom cursor for project name */}
      <AnimatePresence>
        {showCustomCursor && hoveredId && (
          <motion.div
            className="fixed pointer-events-none z-[200] text-whiteCustom font-playfair italic text-lg"
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
            {projectsRecentFirst.find(p => p.id === hoveredId)?.name}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
