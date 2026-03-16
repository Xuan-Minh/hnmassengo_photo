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

// Fonction pour deviner la taille de l'image grâce à son URL Sanity (Masonry)
function getAspectRatio(url) {
  if (!url) return 1;
  const match = url.match(/-(\d+)x(\d+)/);
  if (match) {
    return parseInt(match[1], 10) / parseInt(match[2], 10);
  }
  return 1;
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
  const [gridHoveredProjectId, setGridHoveredProjectId] = useState(null);
  const [isHoverSourceGrid, setIsHoverSourceGrid] = useState(false);
  const scrollContainerRef = useRef(null);

  // Nombre de colonnes dynamiques pour la cascade (Masonry)
  const [colsCount, setColsCount] = useState(6);

  const projectsRecentFirst = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      const am = getProjectDateMs(a);
      const bm = getProjectDateMs(b);

      if (am === null && bm === null)
        return (a?.name || '').localeCompare(b?.name || '');
      if (am === null) return 1;
      if (bm === null) return -1;

      return bm - am;
    });
    return arr;
  }, [projects]);

  const handleSidebarHover = projectId => {
    setHoveredId(projectId);
    if (!projectId) return;

    const targetEl = document.getElementById(`project-start-${projectId}`);
    const container = scrollContainerRef.current;

    if (targetEl && container) {
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

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCustomCursor, setShowCustomCursor] = useState(false);

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

  const filteredProjects = useMemo(() => {
    return projectsRecentFirst.filter(
      p => filter === 'all' || p.type === filter
    );
  }, [projectsRecentFirst, filter]);

  // Extraction des images avec calcul du ratio
  const allImages = useMemo(() => {
    return filteredProjects.flatMap(p =>
      (p.images || [])
        .filter(Boolean)
        .map((img, idx) => {
          const src = getSanityImageDeliveryUrl(img, { w: 640, q: 70 });
          if (!src) return null;

          const ratio = getAspectRatio(img);

          return {
            projectId: p.id,
            project: p,
            name: p.name,
            type: p.type,
            src,
            ratio,
            coords: p.coords,
            isFirst: idx === 0,
            isSanityImage: isSanityCdnUrl(src),
          };
        })
        .filter(Boolean)
    );
  }, [filteredProjects]);

  // Définition responsive des colonnes de la cascade
  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1536) setColsCount(9);
      else if (window.innerWidth >= 1280) setColsCount(8);
      else if (window.innerWidth >= 1024) setColsCount(7);
      else if (window.innerWidth >= 768) setColsCount(6);
      else if (window.innerWidth >= 640) setColsCount(3);
      else setColsCount(2);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Distribution des images dans les colonnes (Algorithme "Shortest Column First")
  const masonryCols = useMemo(() => {
    const cols = Array.from({ length: colsCount }, () => []);
    const colHeights = Array(colsCount).fill(0);

    allImages.forEach((img, idx) => {
      let shortestIdx = 0;
      let minHeight = colHeights[0];
      for (let i = 1; i < colsCount; i++) {
        if (colHeights[i] < minHeight) {
          minHeight = colHeights[i];
          shortestIdx = i;
        }
      }

      cols[shortestIdx].push({ ...img, globalIndex: idx });
      colHeights[shortestIdx] += 1 / (img.ratio || 1);
    });
    return cols;
  }, [allImages, colsCount]);

  const handleImageClick = project => {
    onProjectClick(project);
  };

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
                className={`text-lg text-left font-playfair transition-colors duration-300 relative group self-start ${
                  filter === f.value
                    ? 'font-bold text-blackCustom'
                    : 'text-accent hover:text-blackCustom'
                }`}
                onClick={() => setFilter(f.value)}
              >
                {t(`filters.${f.value}`)}
                <span
                  className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                    filter === f.value ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                  style={{ pointerEvents: 'none' }}
                />
              </button>
            ))}
          </div>

          <ul className="flex flex-col gap-2">
            {filteredProjects.map(p => (
              <li key={p.id}>
                <button
                  className={`text-sm md:text-base text-left font-playfair transition-colors duration-300 relative group ${
                    gridHoveredProjectId === p.id
                      ? 'text-blackCustom'
                      : 'text-accent/30 hover:text-blackCustom'
                  }`}
                  onClick={() => handleImageClick(p)}
                  onMouseEnter={() => {
                    handleSidebarHover(p.id);
                    setGridHoveredProjectId(null);
                    setIsHoverSourceGrid(false);
                  }}
                  onMouseLeave={() => {
                    if (!isHoverSourceGrid) setHoveredId(null);
                  }}
                >
                  <span
                    className={`inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out ${
                      hoveredId === p.id || gridHoveredProjectId === p.id
                        ? '[background-size:100%_1px]'
                        : '[background-size:0%_1px] group-hover:[background-size:100%_1px]'
                    }`}
                  >
                    {p.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* NOUVEAU LAYOUT : Masonry (Cascade sans marge) avec tes Hover States */}
        <div className="flex-1 overflow-y-auto pl-8" ref={scrollContainerRef}>
          <div className="flex w-full gap-2 pb-16 pr-8">
            {masonryCols.map((col, colIdx) => (
              <div key={`col-${colIdx}`} className="flex flex-col flex-1 gap-2">
                {col.map(imgData => {
                  const isHovered = hoveredId === imgData.projectId;

                  return (
                    <div
                      id={
                        imgData.isFirst
                          ? `project-start-${imgData.projectId}`
                          : undefined
                      }
                      key={`${imgData.projectId}-${imgData.globalIndex}`}
                      className="relative group cursor-pointer w-full overflow-hidden"
                      style={{ aspectRatio: imgData.ratio }}
                      onMouseEnter={() => {
                        setGridHoveredProjectId(imgData.projectId);
                        setHoveredId(imgData.projectId);
                        setIsHoverSourceGrid(true);
                      }}
                      onMouseLeave={() => {
                        setGridHoveredProjectId(null);
                        setHoveredId(null);
                        setIsHoverSourceGrid(false);
                      }}
                      onClick={() => handleImageClick(imgData.project)}
                    >
                      <Image
                        src={imgData.src}
                        alt={imgData.name}
                        fill
                        unoptimized={imgData.isSanityImage}
                        // MODIFICATION ICI : on utilise object-contain
                        className={`object-contain shadow transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-40'
                        }`}
                        draggable={false}
                        sizes="(max-width: 768px) 45vw, 128px"
                        loading={imgData.globalIndex < 30 ? 'eager' : 'lazy'}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
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
