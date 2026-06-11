import { useEffect, useMemo, useReducer } from 'react';
import { m, AnimatePresence } from 'framer-motion';
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

const initialState = {
  gridFilter: 'all',
  hoveredId: null,
  maxImages: 24,
  cursorPos: { x: 0, y: 0 },
  showCustomCursor: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default function GalleryGrid({
  projects,
  view,
  onViewChange,
  onProjectSelect,
  setActiveCoord,
}) {
  const t = useTranslations('gallery');
  const [state, dispatch] = useReducer(reducer, initialState);
  const { gridFilter, hoveredId, maxImages, cursorPos, showCustomCursor } =
    state;

  useEffect(() => {
    let rafId = null;
    const handleMouseMove = e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        dispatch({
          type: 'UPDATE_STATE',
          payload: { cursorPos: { x: e.clientX, y: e.clientY } },
        });
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
    const updateMaxImages = () => {
      if (window.innerWidth >= 1536)
        dispatch({ type: 'UPDATE_STATE', payload: { maxImages: 135 } });
      else if (window.innerWidth >= 1024)
        dispatch({ type: 'UPDATE_STATE', payload: { maxImages: 111 } });
      else if (window.innerWidth >= 768)
        dispatch({ type: 'UPDATE_STATE', payload: { maxImages: 60 } });
      else dispatch({ type: 'UPDATE_STATE', payload: { maxImages: null } });
    };
    updateMaxImages();
    window.addEventListener('resize', updateMaxImages);
    return () => window.removeEventListener('resize', updateMaxImages);
  }, []);

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
    return filteredProjectsGrid.flatMap(project => {
      const projectImages = (project.images || []).filter(Boolean);
      if (!projectImages.length) return [];

      const seed = hashString(`${project.id}-${gridFilter}`);
      const random = createSeededRandom(seed);

      const indexedImages = projectImages.map((img, originalIdx) => ({
        img,
        originalIdx,
      }));
      const selectedImages = shuffleWithSeed(indexedImages, random);

      const bucket = selectedImages.flatMap(({ img, originalIdx }) => {
        const imgSrc = getSanityImageDeliveryUrl(img, { w: 640, q: 70 });
        if (!imgSrc) return [];

        return [
          {
            projectId: project.id,
            uniqueKey: `${project.id}-${originalIdx}`,
            name: project.name,
            type: project.type,
            imgSrc,
            isSanityImage: isSanityCdnUrl(imgSrc),
          },
        ];
      });

      return bucket.length > 0 ? [bucket] : [];
    });
  }, [filteredProjectsGrid, gridFilter]);

  const allImages = useMemo(() => {
    const flat = projectBuckets.flatMap(bucket => bucket);
    const seed = hashString(`global-shuffle-${gridFilter}`);
    const random = createSeededRandom(seed);
    return shuffleWithSeed(flat, random);
  }, [projectBuckets, gridFilter]);

  const gridSlots = useMemo(() => {
    if (!maxImages) return [];
    if (!allImages.length) return Array.from({ length: maxImages }, () => null);
    return Array.from(
      { length: maxImages },
      (_, idx) => allImages[idx] || null
    );
  }, [allImages, maxImages]);

  useEffect(() => {
    if (hoveredId) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [hoveredId]);

  return (
    <>
      <m.div
        key="grid"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="w-full h-full hidden md:grid md:grid-cols-8 lg:grid-cols-10 2xl:grid-cols-12 md:grid-rows-8 lg:grid-rows-12 2xl:grid-rows-12 gap-x-1 gap-y-1 overflow-hidden lg:pt-10"
      >
        <div className="flex items-center justify-center col-span-2 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-3 2xl:col-span-3 2xl:row-span-3">
          <div className="flex flex-col items-start p-4 md:p-6 md:mb-2 font-liberation md:h-full justify-center">
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
                    dispatch({
                      type: 'UPDATE_STATE',
                      payload: { gridFilter: f.value },
                    });
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
                  <m.div
                    key={contentKey}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="relative group cursor-pointer flex items-center justify-center w-full h-full"
                    onMouseEnter={() => {
                      // Mettre à jour l'état du Grid
                      dispatch({
                        type: 'UPDATE_STATE',
                        payload: {
                          hoveredId: imgData.projectId,
                          showCustomCursor: true,
                        },
                      });
                      // Transmettre explicitement au parent depuis l'événement (pas de useEffect)
                      const proj = projects.find(
                        p => p.id === imgData.projectId
                      );
                      setActiveCoord(proj?.coords || '');
                    }}
                    onMouseLeave={() => {
                      dispatch({
                        type: 'UPDATE_STATE',
                        payload: { hoveredId: null, showCustomCursor: false },
                      });
                      setActiveCoord('');
                    }}
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
                  </m.div>
                ) : (
                  <m.div
                    key={contentKey}
                    className="w-full h-full bg-transparent"
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </m.div>

      <AnimatePresence>
        {showCustomCursor && hoveredId && (
          <m.div
            className="fixed pointer-events-none z-[1000] text-whiteCustom font-liberation italic text-lg"
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
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
