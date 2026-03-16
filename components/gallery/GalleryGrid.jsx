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

// Calcule le ratio de l'image pour l'effet Cascade
function getAspectRatio(url) {
  if (!url) return 1;
  const match = url.match(/-(\d+)x(\d+)\./);
  if (match) {
    return parseInt(match[1], 10) / parseInt(match[2], 10);
  }
  return 1;
}

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

  // CONFIGURATION AJUSTABLE DES COLONNES
  const [layoutConfig, setLayoutConfig] = useState({
    cols: 8,
    max: 50,
    filterSpan: 2,
  });

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCustomCursor, setShowCustomCursor] = useState(false);

  useEffect(() => {
    const handleMouseMove = e => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // AJUSTEMENT : On a doublé la limite "max" d'images pour que ça dépasse bien le bas de l'écran
  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth >= 1536) {
        setLayoutConfig({ cols: 12, max: 150, filterSpan: 3 });
      } else if (window.innerWidth >= 1280) {
        setLayoutConfig({ cols: 10, max: 120, filterSpan: 3 });
      } else if (window.innerWidth >= 1024) {
        setLayoutConfig({ cols: 8, max: 100, filterSpan: 2 });
      } else if (window.innerWidth >= 768) {
        setLayoutConfig({ cols: 6, max: 80, filterSpan: 2 });
      } else {
        setLayoutConfig({ cols: 3, max: 40, filterSpan: 3 });
      }
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  useEffect(() => {
    if (hoveredId) {
      const project = projects.find(p => p.id === hoveredId);
      setActiveCoord(project?.coords || '');
    } else {
      setActiveCoord('');
    }
  }, [hoveredId, projects, setActiveCoord]);

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
        // AJUSTEMENT : On prend beaucoup plus d'images par projet (de 8 à 18)
        const imageQuota = 8 + Math.floor(random() * 10);

        const indexedImages = projectImages.map((img, originalIdx) => ({
          img,
          originalIdx,
        }));
        const selectedImages = shuffleWithSeed(indexedImages, random).slice(
          0,
          imageQuota
        );

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
              ratio: getAspectRatio(imgSrc),
              isSanityImage: isSanityCdnUrl(imgSrc),
            };
          })
          .filter(Boolean);
      })
      .filter(Boolean);
  }, [filteredProjectsGrid, gridFilter]);

  const allImages = useMemo(() => {
    const flat = projectBuckets.flatMap(bucket => bucket);
    const seed = hashString(`global-shuffle-${gridFilter}`);
    const random = createSeededRandom(seed);
    const shuffled = shuffleWithSeed(flat, random);

    return layoutConfig.max ? shuffled.slice(0, layoutConfig.max) : shuffled;
  }, [projectBuckets, gridFilter, layoutConfig.max]);

  // DISTRIBUTION INTELLIGENTE (L'algorithme qui équilibre les hauteurs)
  const masonryCols = useMemo(() => {
    const cols = Array.from({ length: layoutConfig.cols }, () => []);
    const colHeights = Array(layoutConfig.cols).fill(0);

    // On donne un "handicap" de hauteur aux premières colonnes car le filtre prend de la place
    for (let i = 0; i < layoutConfig.filterSpan; i++) {
      colHeights[i] = 2.5; // (Approximativement 2.5 images carrées)
    }

    allImages.forEach((img, idx) => {
      // 1. Trouver la colonne la plus courte
      let shortestIdx = 0;
      let minHeight = colHeights[0];
      for (let i = 1; i < layoutConfig.cols; i++) {
        if (colHeights[i] < minHeight) {
          minHeight = colHeights[i];
          shortestIdx = i;
        }
      }

      // 2. Ajouter l'image à cette colonne
      cols[shortestIdx].push({ ...img, globalIndex: idx });

      // 3. Mettre à jour la hauteur de la colonne (hauteur = largeur / ratio)
      colHeights[shortestIdx] += 1 / (img.ratio || 1);
    });

    return cols;
  }, [allImages, layoutConfig.cols, layoutConfig.filterSpan]);

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
      <AnimatePresence mode="wait">
        <motion.div
          key={`masonry-grid-${gridFilter}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-full h-full hidden md:flex gap-1 overflow-hidden lg:pt-10"
        >
          {/* BLOC DE GAUCHE : Filtres en haut + Sous-colonnes d'images en bas */}
          <div
            className="flex flex-col gap-1 h-full min-w-0"
            style={{ flex: layoutConfig.filterSpan }}
          >
            <div className="flex flex-col items-start p-4 md:p-6 font-playfair shrink-0">
              <GalleryViewToggle view={view} onViewChange={onViewChange} />
              <div className="relative z-10 flex flex-col gap-1 items-start mt-2">
                {GALLERY_FILTERS.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    className={`text-sm md:text-base text-left relative group transition-opacity duration-300 whitespace-nowrap ${
                      gridFilter === f.value
                        ? 'font-bold opacity-100 text-blackCustom'
                        : 'opacity-60 hover:opacity-100 text-accent hover:text-blackCustom'
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

            <div className="flex w-full gap-1 flex-1 min-h-0 overflow-visible">
              {masonryCols
                .slice(0, layoutConfig.filterSpan)
                .map((col, colIdx) => (
                  <div
                    key={`subcol-${colIdx}`}
                    className="flex flex-col flex-1 gap-1"
                  >
                    {col.map(imgData => {
                      const isHovered = hoveredId === imgData.projectId;
                      return (
                        <div
                          key={imgData.uniqueKey}
                          className="relative group cursor-pointer w-full overflow-hidden"
                          style={{ aspectRatio: imgData.ratio }}
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
                            fill
                            unoptimized={imgData.isSanityImage}
                            className={`object-cover shadow transition-opacity duration-300 ${
                              isHovered ? 'opacity-100' : 'opacity-40'
                            }`}
                            draggable={false}
                            sizes="(max-width: 768px) 45vw, 128px"
                            loading={
                              imgData.globalIndex < 30 ? 'eager' : 'lazy'
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>

          {/* RESTE DES COLONNES (À droite des filtres) */}
          {masonryCols.slice(layoutConfig.filterSpan).map((col, colIdx) => (
            <div
              key={`col-${colIdx + layoutConfig.filterSpan}`}
              className="flex flex-col flex-1 gap-1"
            >
              {col.map(imgData => {
                const isHovered = hoveredId === imgData.projectId;
                return (
                  <div
                    key={imgData.uniqueKey}
                    className="relative group cursor-pointer w-full overflow-hidden"
                    style={{ aspectRatio: imgData.ratio }}
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
                      fill
                      unoptimized={imgData.isSanityImage}
                      className={`object-cover shadow transition-opacity duration-300 ${
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
        </motion.div>
      </AnimatePresence>

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
