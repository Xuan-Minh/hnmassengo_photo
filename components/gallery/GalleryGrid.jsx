// components/gallery/GalleryGrid.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GALLERY_FILTERS } from '../../lib/constants';
import {
  getSanityImageDeliveryUrl,
  isSanityCdnUrl,
} from '../../lib/imageUtils';
import GalleryViewToggle from './GalleryViewToggle';

const hashString = value => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const createSeededRandom = seed => {
  let current = seed % 2147483647;
  if (current <= 0) current += 2147483646;

  return () => {
    current = (current * 16807) % 2147483647;
    return (current - 1) / 2147483646;
  };
};

const shuffleWithSeed = (items, random) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getProjectDateMs = project => {
  const raw = project?.date;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
};

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

  // Gestion du nombre d'images (Responsive) - NOUVELLES VALEURS
  useEffect(() => {
    const updateMaxImages = () => {
      if (window.innerWidth >= 1536)
        setMaxImages(135); // 2xl: grille 12x12
      else if (window.innerWidth >= 1024)
        setMaxImages(111); // lg: grille 10x12
      else if (window.innerWidth >= 768)
        setMaxImages(60); // md: grille 8x8 avec bloc filtres 2x2
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
    return projects
      .filter(p => gridFilter === 'all' || p.type === gridFilter)
      .sort((a, b) => {
        const am = getProjectDateMs(a);
        const bm = getProjectDateMs(b);

        if (am === null && bm === null)
          return (a?.name || '').localeCompare(b?.name || '');
        if (am === null) return 1;
        if (bm === null) return -1;

        return bm - am;
      });
  }, [projects, gridFilter]);

  const projectBuckets = useMemo(() => {
    return filteredProjectsGrid
      .map(project => {
        const projectImages = (project.images || []).filter(Boolean);
        if (!projectImages.length) return null;

        const seed = hashString(`${project.id}-${gridFilter}`);
        const random = createSeededRandom(seed);

        const indexedImages = projectImages.map((img, originalIdx) => ({
          img,
          originalIdx,
        }));
        const selectedImages = shuffleWithSeed(indexedImages, random);

        return selectedImages
          .map(({ img, originalIdx }) => {
            const imgSrc = getSanityImageDeliveryUrl(img, { w: 640, q: 70 });
            if (!imgSrc) return null;

            return {
              projectId: project.id,
              uniqueKey: `${project.id}-${originalIdx}`,
              name: project.name,
              type: project.type,
              imgSrc,
              isSanityImage: isSanityCdnUrl(imgSrc),
            };
          })
          .filter(Boolean);
      })
      .filter(Boolean);
  }, [filteredProjectsGrid, gridFilter]);

  // NOUVEAU : On mélange TOUTES les images ensemble pour créer la Constellation !
  const allImages = useMemo(() => {
    const flat = projectBuckets.flatMap(bucket => bucket);
    // On utilise un seed constant basé sur le filtre pour que le mélange reste stable
    const seed = hashString(`global-shuffle-${gridFilter}`);
    const random = createSeededRandom(seed);
    return shuffleWithSeed(flat, random);
  }, [projectBuckets, gridFilter]);

  const gridSlots = useMemo(() => {
    if (!maxImages) return [];

    if (!allImages.length) {
      return Array.from({ length: maxImages }, () => null);
    }

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
        // MODIFICATION DES COLONNES: Beaucoup plus denses ! (12 sur grand écran)
        className="w-full h-full hidden md:grid md:grid-cols-8 lg:grid-cols-10 2xl:grid-cols-12 md:grid-rows-8 lg:grid-rows-12 2xl:grid-rows-12 gap-x-1 gap-y-1 overflow-hidden lg:pt-10"
      >
        {/* Contrôles et Filtres (Prend plus de place pour être lisible au milieu des petites photos) */}
        <div
          key="filters"
          className="flex items-center justify-center col-span-2 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-3 2xl:col-span-3 2xl:row-span-3"
        >
          <div className="flex flex-col items-start p-4 md:p-6 md:mb-2 font-playfair md:h-full justify-center">
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
                      src={imgData.imgSrc}
                      alt={imgData.name}
                      width={200}
                      height={300}
                      unoptimized={imgData.isSanityImage}
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
