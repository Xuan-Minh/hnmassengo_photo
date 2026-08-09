'use client';
import { useEffect, useMemo, useRef, useReducer } from 'react';
import { useTranslations } from 'next-intl';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  getSanityImageDeliveryUrl,
  isSanityCdnUrl,
} from '../../lib/imageUtils';
import GalleryViewToggle from './GalleryViewToggle';

// ==========================================
// 1. CONSTANTES & UTILITAIRES
// ==========================================

function getProjectDateMs(project) {
  const raw = project?.date;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function getInitialCols() {
  if (typeof window === 'undefined') return 6;
  const width = window.innerWidth;
  if (width >= 1536) return 11;
  if (width >= 1280) return 13;
  if (width >= 1024) return 12;
  if (width >= 768) return 10;
  if (width >= 640) return 3;
  return 2;
}

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

// ==========================================
// 2. ÉTAT ET REDUCER
// ==========================================

const initialState = {
  filter: 'all',
  hoveredId: null,
  gridHoveredProjectId: null,
  isHoverSourceGrid: false,
  colsCount: getInitialCols(),
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

// ==========================================
// 3. SOUS-COMPOSANTS UI
// ==========================================

function Sidebar({
  filter,
  filteredProjects,
  gridHoveredProjectId,
  dispatch,
  t,
  onSidebarHover,
  onImageClick,
  view,
  onViewChange,
  onFilterClick,
}) {
  return (
    <div className="w-48 flex flex-col pt-8 shrink-0 overflow-y-auto no-scrollbar pb-16">
      <GalleryViewToggle view={view} onViewChange={onViewChange} />
      <div className="flex flex-col my-6">
        {FILTERS.map(f => (
          <button
            type="button"
            key={f.value}
            className={`text-lg text-left font-liberation transition-opacity duration-300 relative group hover:[--bg-size:100%_1px] self-start ${
              filter === f.value
                ? 'font-bold opacity-100 text-blackCustom'
                : 'opacity-60 hover:opacity-100 text-accent hover:text-blackCustom'
            }`}
            onClick={() => {
              dispatch({ type: 'UPDATE_STATE', payload: { filter: f.value } });
              if (onFilterClick) onFilterClick(true);
            }}
          >
            <span
              className="inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out"
              style={{ backgroundSize: 'var(--bg-size, 0% 1px)' }}
            >
              {t(`filters.${f.value}`)}
            </span>
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {filteredProjects.map(p => {
          const isProjectHovered = gridHoveredProjectId === p.id;

          return (
            <li key={p.id} className="group">
              <button
                type="button"
                className={`text-sm md:text-base text-left font-liberation transition-colors duration-300 relative group hover:[--bg-size:100%_1px] ${
                  isProjectHovered
                    ? 'text-blackCustom'
                    : 'text-accent/30 hover:text-blackCustom'
                }`}
                onClick={() => onImageClick(p)}
                onMouseEnter={() => onSidebarHover(p.id)}
                onMouseLeave={() => {
                  dispatch(state => {
                    if (!state.isHoverSourceGrid) {
                      return {
                        type: 'UPDATE_STATE',
                        payload: { hoveredId: null },
                      };
                    }
                    return { type: 'UPDATE_STATE', payload: {} };
                  });
                }}
              >
                <span
                  className={`inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out ${
                    isProjectHovered
                      ? '[background-size:100%_1px]'
                      : '[background-size:0%_1px] group-hover:[background-size:100%_1px]'
                  }`}
                >
                  {p.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MasonryGrid({
  filter,
  masonryCols,
  hoveredId,
  dispatch,
  onImageClick,
  hasDragged,
  isDragging,
  isScrolling,
}) {
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={`masonry-more-${filter}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="flex w-full gap-2"
      >
        {masonryCols.map((col, colIdx) => (
          <div key={`col-${colIdx}`} className="flex flex-col flex-1 gap-2">
            {col.map(imgData => {
              const isHovered = hoveredId === imgData.projectId;
              return (
                <button
                  type="button"
                  id={
                    imgData.isFirst
                      ? `project-start-${imgData.projectId}`
                      : undefined
                  }
                  key={`${imgData.projectId}-${imgData.globalIndex}`}
                  className="relative group cursor-pointer w-full overflow-hidden"
                  style={{ aspectRatio: imgData.ratio }}
                  onMouseEnter={() => {
                    if (isDragging?.current || isScrolling?.current) return;

                    dispatch({
                      type: 'UPDATE_STATE',
                      payload: {
                        gridHoveredProjectId: imgData.projectId,
                        hoveredId: imgData.projectId,
                        isHoverSourceGrid: true,
                      },
                    });
                  }}
                  onMouseLeave={() => {
                    if (isDragging?.current || isScrolling?.current) return;

                    dispatch({
                      type: 'UPDATE_STATE',
                      payload: {
                        gridHoveredProjectId: null,
                        hoveredId: null,
                        isHoverSourceGrid: false,
                      },
                    });
                  }}
                  onClick={e => {
                    if (hasDragged && hasDragged.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    onImageClick(imgData.project);
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter') onImageClick(imgData.project);
                  }}
                  tabIndex={0}
                >
                  <Image
                    src={imgData.src}
                    alt={imgData.name}
                    fill
                    unoptimized={imgData.isSanityImage}
                    className={`object-contain shadow transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-40'
                    }`}
                    draggable={false}
                    sizes="(max-width: 768px) 45vw, 128px"
                    loading={imgData.globalIndex < 30 ? 'eager' : 'lazy'}
                  />
                </button>
              );
            })}
          </div>
        ))}
      </m.div>
    </AnimatePresence>
  );
}

function CustomCursorOverlay({
  showCustomCursor,
  hoveredId,
  cursorPos,
  projectsRecentFirst,
}) {
  if (!showCustomCursor || !hoveredId) return null;
  const projectName = projectsRecentFirst.find(p => p.id === hoveredId)?.name;

  return (
    <AnimatePresence>
      <m.div
        className="fixed pointer-events-none text-whiteCustom font-liberation italic text-lg z-50 mix-blend-difference"
        style={{
          left: cursorPos.x + 15,
          top: cursorPos.y + 15,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {projectName}
      </m.div>
    </AnimatePresence>
  );
}

// ==========================================
// 4. CUSTOM HOOKS (LOGIQUE MÉTIER)
// ==========================================

function useGalleryGridData(projects, filter, colsCount) {
  const projectsRecentFirst = useMemo(() => {
    return projects.toSorted((a, b) => {
      const am = getProjectDateMs(a);
      const bm = getProjectDateMs(b);
      if (am === null && bm === null)
        return (a?.name || '').localeCompare(b?.name || '');
      if (am === null) return 1;
      if (bm === null) return -1;
      return bm - am;
    });
  }, [projects]);
  const projectsChrono = useMemo(() => {
    return projects.toSorted((a, b) => {
      const am = getProjectDateMs(a);
      const bm = getProjectDateMs(b);
      if (am === null && bm === null)
        return (a?.name || '').localeCompare(b?.name || '');
      if (am === null) return 1;
      if (bm === null) return -1;
      return am - bm;
    });
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projectsChrono.filter(p => filter === 'all' || p.type === filter);
  }, [projectsChrono, filter]);

  const allImages = useMemo(() => {
    return filteredProjects.flatMap(p => {
      if (!p.images) return [];
      return p.images.flatMap((img, idx) => {
        if (!img) return [];
        const src = getSanityImageDeliveryUrl(img, { w: 640, q: 70 });
        if (!src) return [];
        return [
          {
            projectId: p.id,
            project: p,
            name: p.name,
            type: p.type,
            src,
            ratio: getAspectRatio(img),
            coords: p.coords,
            isFirst: idx === 0,
            isSanityImage: isSanityCdnUrl(src),
          },
        ];
      });
    });
  }, [filteredProjects]);

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

  return { projectsRecentFirst, filteredProjects, masonryCols };
}

function useGalleryInteractions(
  dispatch,
  hoveredId,
  isHoverSourceGrid,
  filter,
  scrollContainerRef,
  projectsRecentFirst
) {
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filter, scrollContainerRef]);

  const handleSidebarHover = projectId => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        hoveredId: projectId,
        gridHoveredProjectId: null,
        isHoverSourceGrid: false,
      },
    });

    if (!projectId) return;

    const targetEl = document.getElementById(`project-start-${projectId}`);
    const container = scrollContainerRef.current;

    if (targetEl && container) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const distanceToTop = targetRect.top - containerRect.top;

      const scrollPos = container.scrollTop + distanceToTop - 60;

      container.scrollTo({
        top: scrollPos,
        behavior: 'smooth',
      });
    }
  };
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
  }, [dispatch]);

  useEffect(() => {
    if (!hoveredId || !isHoverSourceGrid) {
      document.body.style.cursor = 'default';
      dispatch({ type: 'UPDATE_STATE', payload: { showCustomCursor: false } });
      return;
    }

    const project = projectsRecentFirst.find(p => p.id === hoveredId);
    if (project) {
      document.body.style.cursor = 'none';
      dispatch({ type: 'UPDATE_STATE', payload: { showCustomCursor: true } });
    }

    return () => {
      document.body.style.cursor = 'default';
      dispatch({ type: 'UPDATE_STATE', payload: { showCustomCursor: false } });
    };
  }, [hoveredId, projectsRecentFirst, isHoverSourceGrid, dispatch]);

  useEffect(() => {
    const updateCols = () =>
      dispatch({
        type: 'UPDATE_STATE',
        payload: { colsCount: getInitialCols() },
      });
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, [dispatch]);

  return { handleSidebarHover };
}

function useGridScroll(scrollContainerRef) {
  const scrollSpeed = useRef(0);
  const scrollRaf = useRef(null);
  const isDragging = useRef(false);
  const isScrolling = useRef(false); // NOUVEAU: Traque si l'edge scroll est actif
  const hasDragged = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  const handleGridMouseMove = e => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 1. DRAG & DROP
    if (isDragging.current) {
      const y = e.pageY - container.offsetTop;
      const walk = (y - startY.current) * 1.5;

      if (Math.abs(walk) > 5) {
        hasDragged.current = true;
      }

      container.scrollTop = startScrollTop.current - walk;
      return;
    }

    // 2. EDGE SCROLL
    const { top, bottom, height } = container.getBoundingClientRect();
    const y = e.clientY;
    const threshold = height * 0.15;
    const maxSpeed = 9;

    if (y < top + threshold) {
      const proximity = (top + threshold - y) / threshold;
      scrollSpeed.current = -(proximity * maxSpeed);
      isScrolling.current = true; // On signale que ça scrolle
    } else if (y > bottom - threshold) {
      const proximity = (y - (bottom - threshold)) / threshold;
      scrollSpeed.current = proximity * maxSpeed;
      isScrolling.current = true; // On signale que ça scrolle
    } else {
      scrollSpeed.current = 0;
      isScrolling.current = false; // On arrête
    }

    if (scrollSpeed.current !== 0 && !scrollRaf.current) {
      const scrollLoop = () => {
        if (scrollSpeed.current !== 0 && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += scrollSpeed.current;
          scrollRaf.current = requestAnimationFrame(scrollLoop);
        } else {
          scrollRaf.current = null;
        }
      };
      scrollRaf.current = requestAnimationFrame(scrollLoop);
    }
  };

  const handleGridMouseDown = e => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isDragging.current = true;
    hasDragged.current = false;
    startY.current = e.pageY - container.offsetTop;
    startScrollTop.current = container.scrollTop;
    scrollSpeed.current = 0;

    document.body.classList.add('is-dragging-gallery');
  };

  const handleGridMouseUpOrLeave = () => {
    isDragging.current = false;
    scrollSpeed.current = 0;
    if (scrollRaf.current) {
      cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = null;
    }

    document.body.classList.remove('is-dragging-gallery');
  };

  return {
    handleGridMouseMove,
    handleGridMouseDown,
    handleGridMouseUpOrLeave,
    hasDragged,
    isDragging, // EXPORT
    isScrolling, // EXPORT
  };
}

// ==========================================
// 5. COMPOSANT PRINCIPAL
// ==========================================

export default function GalleryGridMore({
  projects,
  onProjectSelect,
  setActiveCoord,
  view,
  onViewChange,
  onFilterClick,
}) {
  const t = useTranslations('gallery');
  const scrollContainerRef = useRef(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    filter,
    hoveredId,
    gridHoveredProjectId,
    isHoverSourceGrid,
    colsCount,
    cursorPos,
    showCustomCursor,
  } = state;

  const { projectsRecentFirst, filteredProjects, masonryCols } =
    useGalleryGridData(projects, filter, colsCount);

  const { handleSidebarHover } = useGalleryInteractions(
    dispatch,
    hoveredId,
    isHoverSourceGrid,
    filter,
    scrollContainerRef,
    projectsRecentFirst
  );

  const hoveredProject = projectsRecentFirst.find(p => p.id === hoveredId);

  useEffect(() => {
    if (setActiveCoord) {
      setActiveCoord(hoveredProject ? hoveredProject.coords : '');
    }
  }, [hoveredProject, setActiveCoord]);

  // Initialisation de la logique de défilement unifié
  const {
    handleGridMouseMove,
    handleGridMouseDown,
    handleGridMouseUpOrLeave,
    hasDragged,
    isDragging,
    isScrolling,
  } = useGridScroll(scrollContainerRef);

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 flex w-full h-full">
        {/* SIDEBAR FILTRES */}
        <Sidebar
          filter={filter}
          filteredProjects={filteredProjects}
          gridHoveredProjectId={gridHoveredProjectId}
          dispatch={dispatch}
          t={t}
          onSidebarHover={handleSidebarHover}
          onImageClick={onProjectSelect}
          view={view}
          onViewChange={onViewChange}
          onFilterClick={onFilterClick}
        />

        {/* GRILLE D'IMAGES */}
        <div
          className="flex-1 overflow-y-hidden select-none touch-none " // select-none et touch-none fiabilisent le drag
          ref={scrollContainerRef}
          onMouseMove={handleGridMouseMove}
          onMouseDown={handleGridMouseDown}
          onMouseUp={handleGridMouseUpOrLeave}
          onMouseLeave={handleGridMouseUpOrLeave}
        >
          <MasonryGrid
            filter={filter}
            masonryCols={masonryCols}
            hoveredId={hoveredId}
            dispatch={dispatch}
            onImageClick={onProjectSelect}
            hasDragged={hasDragged}
            isDragging={isDragging}
            isScrolling={isScrolling}
          />
        </div>
      </div>

      {/* OVERLAY CURSEUR */}
      <CustomCursorOverlay
        showCustomCursor={showCustomCursor}
        hoveredId={hoveredId}
        cursorPos={cursorPos}
        projectsRecentFirst={projectsRecentFirst}
      />
    </div>
  );
}
