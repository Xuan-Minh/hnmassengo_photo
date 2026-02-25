// components/gallery/GalleryGrid.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GALLERY_FILTERS } from '../../lib/constants';
import GalleryViewToggle from './GalleryViewToggle';

export default function GalleryGrid({
  projects,
  view,
  onViewChange,
  onProjectSelect,
  setActiveCoord,
}) {
  const t = useTranslations('gallery');
  const [gridFilter, setGridFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);
  const [maxImages, setMaxImages] = useState(24);

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

  // Gestion du nombre d'images (Responsive)
  useEffect(() => {
    const updateMaxImages = () => {
      if (window.innerWidth >= 1536)
        setMaxImages(55); // 2xl
      else if (window.innerWidth >= 1024)
        setMaxImages(47); // lg
      else if (window.innerWidth >= 768)
        setMaxImages(24); // md
      else setMaxImages(null); // Pas de grille sur mobile
    };
    updateMaxImages();
    window.addEventListener('resize', updateMaxImages);
    return () => window.removeEventListener('resize', updateMaxImages);
  }, []);

  // Transmettre les coordonnées au footer parent quand on survole
  useEffect(() => {
    if (hoveredId) {
      const project = projects.find(p => p.id === hoveredId);
      setActiveCoord(project?.coords || '');
    } else {
      setActiveCoord(''); // Vide quand rien n'est survolé
    }
  }, [hoveredId, projects, setActiveCoord]);

  // Filtrage
  const filteredProjectsGrid = useMemo(() => {
    return projects.filter(p => gridFilter === 'all' || p.type === gridFilter);
  }, [projects, gridFilter]);

  const allImages = useMemo(() => {
    return filteredProjectsGrid.flatMap(p =>
      (p.images || []).map((img, idx) => ({
        projectId: p.id,
        uniqueKey: `${p.id}-${idx}`,
        name: p.name,
        type: p.type,
        img,
      }))
    );
  }, [filteredProjectsGrid]);

  const gridSlots = useMemo(() => {
    if (!maxImages) return [];
    return Array.from(
      { length: maxImages },
      (_, idx) => allImages[idx] || null
    );
  }, [allImages, maxImages]);

  // Curseur custom logic
  useEffect(() => {
    if (hoveredId) {
      document.body.style.cursor = 'none';
      setShowCustomCursor(true);
    } else {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
    }
    return () => {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
    };
  }, [hoveredId]);

  return (
    <>
      <motion.div
        key="grid"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="w-full h-full hidden md:grid md:grid-cols-5 lg:grid-cols-6 2xl:grid-cols-7 md:grid-rows-5 lg:grid-rows-8 2xl:grid-rows-8 gap-x-2 gap-y-2 overflow-hidden lg:pt-10"
      >
        {/* Contrôles et Filtres */}
        <div key="filters" className="flex items-center justify-center">
          <div className="flex flex-col items-start p-4 md:p-6 font-playfair md:h-full justify-center">
            <GalleryViewToggle view={view} onViewChange={onViewChange} />
            <div className="relative z-10 flex flex-col gap-1 items-start pointer-events-auto">
              {GALLERY_FILTERS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  className={`text-sm md:text-base text-left relative group transition-opacity duration-300 whitespace-nowrap ${
                    gridFilter === f.value
                      ? 'font-bold opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  onPointerDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setGridFilter(f.value);
                  }}
                >
                  {t(`filters.${f.value}`)}
                  <span
                    className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                      gridFilter === f.value
                        ? 'w-full'
                        : 'w-0 group-hover:w-full'
                    }`}
                    style={{ pointerEvents: 'none' }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slots d'images */}
        {gridSlots.map((imgData, slotIdx) => {
          const isHovered = imgData && hoveredId === imgData.projectId;
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
                    onMouseEnter={() => setHoveredId(imgData.projectId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      const projectData = projects.find(
                        p => p.id === imgData.projectId
                      );
                      onProjectSelect(projectData);
                    }}
                  >
                    <Image
                      src={imgData.img}
                      alt={imgData.name}
                      width={200}
                      height={300}
                      className={`max-w-full max-h-full object-contain shadow transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-40'
                      }`}
                      style={{ objectFit: 'contain' }}
                      draggable={false}
                      sizes="(max-width: 768px) 45vw, 128px"
                      loading={slotIdx < 5 ? 'eager' : 'lazy'}
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

      {/* Curseur Personnalisé */}
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
