'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
  const t = useTranslations();
  const [filter, setFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);

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

  // Gestion du curseur custom
  useEffect(() => {
    if (!hoveredId) {
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
  }, [hoveredId, projectsRecentFirst]);

  // Filtrage des projets
  const filteredProjects = useMemo(() => {
    return projectsRecentFirst.filter(
      p => filter === 'all' || p.type === filter
    );
  }, [projectsRecentFirst, filter]);

  // On veut toutes les images de tous les projets filtrés
  const allImages = useMemo(() => {
    return filteredProjects.flatMap(p =>
      (p.images || []).filter(Boolean).map((img, idx) => ({
        projectId: p.id,
        project: p,
        name: p.name,
        type: p.type,
        src: img,
        coords: p.coords,
        isFirst: idx === 0,
      }))
    );
  }, [filteredProjects]);

  const handleImageClick = project => {
    onProjectClick(project);
    onClose(); // Fermer l'overlay grille plus pour afficher le cartel
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
      {/* Header */}
      <div className="relative w-full h-24 flex items-center justify-center px-8 md:px-16 shrink-0">
        <button
          onClick={onClose}
          className="absolute left-8 md:left-16 text-lg font-playfair text-accent hover:text-blackCustom transition-colors"
        >
          back
        </button>
        <h2 className="text-4xl font-playfair italic text-blackCustom/20">
          Gallery
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden px-8 md:px-16 pb-16">
        {/* Sidebar Filters */}
        <div className="w-48 flex flex-col gap-2 pt-8 shrink-0">
          {FILTERS.map(f => (
            <motion.button
              layout
              key={f.value}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className={`text-lg text-left font-playfair transition-colors duration-300 ${
                filter === f.value
                  ? 'font-bold text-blackCustom'
                  : 'text-accent hover:text-blackCustom'
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pl-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-2 pb-16">
            {allImages.map((imgData, index) => {
              const isHovered = hoveredId === imgData.projectId;
              return (
                <motion.div
                  layout
                  exit={{ opacity: 0, scale: 0.7 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  key={imgData.projectId + '-' + index}
                  className="relative group cursor-pointer flex items-center justify-center w-full h-full overflow-hidden"
                  onMouseEnter={() => setHoveredId(imgData.projectId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleImageClick(imgData.project)}
                >
                  <Image
                    src={imgData.src}
                    alt={imgData.name}
                    width={400}
                    height={300}
                    className={`max-w-[90%] max-h-[90%] 2xl:max-w-[98%] 2xl:max-h-[98%] object-contain shadow transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-40'
                    }`}
                    style={{ objectFit: 'contain' }}
                    draggable={false}
                    sizes="(max-width: 768px) 45vw, (max-width: 1200px) 20vw, 18vw"
                    priority={index < 8}
                  />
                </motion.div>
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
