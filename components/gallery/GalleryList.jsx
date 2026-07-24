'use client';

import { useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import Image from 'next/image';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import {
  getOptimizedImageParams,
  useEffectEvent,
  useIsMobile,
} from '../../lib/hooks';
import GalleryViewToggle from './GalleryViewToggle';

// ==========================================
// 1. ÉTAT ET REDUCER
// ==========================================

const initialState = {
  currentProjectIndex: 0,
  currentImageIndex: 0,
  isTransitioning: false,
  isListImageLoaded: false,
  listImageError: false,
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
// 2. SOUS-COMPOSANTS UI
// ==========================================

const ArrowLeft = () => <div className="text-lg italic">previous</div>;

const ArrowRight = () => <div className="text-lg italic">next</div>;

const DesktopNav = ({
  view,
  onViewChange,
  projects,
  currentProjectIndex,
  navigateToImage,
}) => (
  <div className="hidden lg:flex items-center justify-between gap-8 my-8 w-full">
    <GalleryViewToggle view={view} onViewChange={onViewChange} />
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 flex-1">
      {projects.map((p, idx) => (
        <button
          type="button"
          key={p.id}
          onClick={() => navigateToImage(idx, 0)}
          className={`text-lg font-liberation transition-opacity duration-300 relative group whitespace-nowrap ${
            idx === currentProjectIndex
              ? 'font-bold opacity-100'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          {p.name}
          <span
            className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ${
              idx === currentProjectIndex ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </button>
      ))}
    </div>
    <div className="w-[52px] flex-shrink-0" />
  </div>
);

const MainViewer = ({
  currentListDisplaySrc,
  project,
  currentImageIndex,
  isMobile,
  isTransitioning,
  isListImageLoaded,
  listImageError,
  dispatch,
  navigateListPrev,
  navigateListNext,
  onProjectSelect,
}) => {
  if (!currentListDisplaySrc) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Flèche gauche */}
      <button
        type="button"
        onClick={navigateListPrev}
        className="absolute left-2 md:left-12 z-20 opacity-60 hover:opacity-100 p-2 shrink-0 text-blackCustom hover:text-whiteCustom transition-all"
      >
        <ArrowLeft />
      </button>

      <button
        type="button"
        onClick={() => onProjectSelect(project)}
        className="relative w-full aspect-[4/5] md:aspect-auto md:h-full cursor-pointer px-10 md:px-24 flex-row group"
        tabIndex={0}
        aria-pressed="false"
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === 'Space') {
            e.preventDefault();
            onProjectSelect(project);
          }
        }}
      >
        <Image
          key={`${project?.id}-${currentImageIndex}`}
          src={currentListDisplaySrc}
          alt={project?.name || ''}
          fill
          sizes="(max-width: 1024px) 100vw, 70vw"
          className={`object-contain transition-transform group-hover:scale-[1.02] ${
            isMobile ? 'duration-150' : 'duration-300'
          } ${
            isTransitioning || (!isListImageLoaded && !listImageError)
              ? 'opacity-0'
              : 'opacity-100'
          }`}
          onLoad={() =>
            dispatch({
              type: 'UPDATE_STATE',
              payload: { isListImageLoaded: true },
            })
          }
          priority={!isMobile}
        />
        <div className="absolute bottom-8 right-2 z-10 bg-whiteCustom backdrop-blur-md text-blackCustom px-3 py-1.5 rounded-sm shadow-sm text-[10px] font-bold uppercase tracking-widest pointer-events-none transition-all duration-300 opacity-100 md:group-hover:opacity-100">
          the project &#62;
        </div>
      </button>

      {/* Flèche droite */}
      <button
        type="button"
        onClick={navigateListNext}
        className="absolute right-2 md:right-12 z-20 opacity-60 hover:opacity-100 transition-all p-2 shrink-0 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] text-accent hover:text-whiteCustom"
      >
        <ArrowRight />
      </button>
    </div>
  );
};

const MobileNavTop = ({ projects, currentProjectIndex, navigateToImage }) => {
  const midIndex = Math.ceil(projects.length / 2);

  return (
    <div className="lg:hidden w-full mt-10 mb-2">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {projects.map((p, idx) => {
          if (idx >= midIndex) return null;

          const isActive = idx === currentProjectIndex;

          return (
            <button
              type="button"
              key={p.id}
              onClick={() => navigateToImage(idx, 0)}
              className={`text-[13px] font-liberation whitespace-nowrap transition-all ${
                isActive ? 'font-bold opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className="inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out"
                style={{ backgroundSize: isActive ? '100% 1px' : '0% 1px' }}
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MobileNavBottom = ({
  projects,
  currentProjectIndex,
  navigateToImage,
}) => {
  const midIndex = Math.ceil(projects.length / 2);

  return (
    <div className="lg:hidden w-full px-4 mt-2 mb-8">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {projects.map((p, idx) => {
          if (idx < midIndex) return null;

          const isActive = idx === currentProjectIndex;

          return (
            <button
              type="button"
              key={p.id}
              onClick={() => navigateToImage(idx, 0)}
              className={`text-[13px] font-liberation whitespace-nowrap transition-all ${
                isActive ? 'font-bold opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className="inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out"
                style={{ backgroundSize: isActive ? '100% 1px' : '0% 1px' }}
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. CUSTOM HOOK : LOGIQUE DE GALERIE
// ==========================================

function useGalleryLogic(projects, setActiveCoord) {
  const isMobile = useIsMobile(1024);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { currentProjectIndex, currentImageIndex } = state;

  const currentImageVersionRef = useRef(0);
  const listTimersRef = useRef({ tick: null, swap: null, cancelled: 0 });

  const preloadedUrlsRef = useRef(null);
  if (preloadedUrlsRef.current === null) preloadedUrlsRef.current = new Set();

  const navigateToImage = useCallback(
    (projectIndex, imageIndex) => {
      const transitionDelay = isMobile ? 80 : 250;
      currentImageVersionRef.current += 1;

      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          isListImageLoaded: false,
          listImageError: false,
          isTransitioning: true,
        },
      });

      setTimeout(() => {
        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            currentProjectIndex: projectIndex,
            currentImageIndex: imageIndex,
            isTransitioning: false,
          },
        });
        setActiveCoord(projects[projectIndex]?.coords || '');
      }, transitionDelay);
    },
    [isMobile, projects, setActiveCoord, dispatch]
  );

  const navigateListPrev = useCallback(() => {
    if (currentImageIndex > 0) {
      navigateToImage(currentProjectIndex, currentImageIndex - 1);
    } else {
      const prevProjectIndex =
        currentProjectIndex === 0
          ? projects.length - 1
          : currentProjectIndex - 1;
      const prevImages = projects[prevProjectIndex]?.images || [];
      navigateToImage(prevProjectIndex, Math.max(0, prevImages.length - 1));
    }
  }, [currentProjectIndex, currentImageIndex, projects, navigateToImage]);

  const navigateListNext = useCallback(() => {
    const currentImages = projects[currentProjectIndex]?.images || [];
    if (currentImageIndex < currentImages.length - 1) {
      navigateToImage(currentProjectIndex, currentImageIndex + 1);
    } else {
      navigateToImage((currentProjectIndex + 1) % projects.length, 0);
    }
  }, [currentProjectIndex, currentImageIndex, projects, navigateToImage]);

  // Slideshow
  useEffect(() => {
    const timers = listTimersRef.current;
    if (timers.tick) clearTimeout(timers.tick);
    if (timers.swap) clearTimeout(timers.swap);
    timers.tick = null;
    timers.swap = null;

    if (projects.length === 0) return;
    const currentImages = projects[currentProjectIndex]?.images || [];
    if (currentImages.length === 0) return;

    const token = (timers.cancelled += 1);

    const computeNext = () => {
      if (currentImageIndex < currentImages.length - 1) {
        return {
          nextProjectIndex: currentProjectIndex,
          nextImageIndex: currentImageIndex + 1,
        };
      }
      return {
        nextProjectIndex: (currentProjectIndex + 1) % projects.length,
        nextImageIndex: 0,
      };
    };

    timers.tick = setTimeout(() => {
      const next = computeNext();
      if (!next || timers.cancelled !== token) return;
      dispatch({ type: 'UPDATE_STATE', payload: { isTransitioning: true } });

      timers.swap = setTimeout(() => {
        if (timers.cancelled !== token) return;
        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            currentProjectIndex: next.nextProjectIndex,
            currentImageIndex: next.nextImageIndex,
            isTransitioning: false,
          },
        });
        setActiveCoord(projects[next.nextProjectIndex]?.coords || '');
      }, 250);
    }, 5000);

    return () => {
      if (timers.tick) clearTimeout(timers.tick);
      if (timers.swap) clearTimeout(timers.swap);
    };
  }, [
    projects,
    currentProjectIndex,
    currentImageIndex,
    setActiveCoord,
    dispatch,
  ]);

  const handleKeyDown = useEffectEvent(e => {
    if (e.key === 'ArrowRight') navigateListNext();
    if (e.key === 'ArrowLeft') navigateListPrev();
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Image formatting
  const galleryParams = getOptimizedImageParams('gallery', isMobile);
  const imageParams = useMemo(
    () => ({
      ...galleryParams,
      q: isMobile ? 68 : galleryParams.q,
      auto: 'format',
    }),
    [galleryParams, isMobile]
  );

  const getDisplaySrcAt = useCallback(
    (projectIndex, imageIndex) => {
      const source = projects[projectIndex]?.images?.[imageIndex] || null;
      if (!source) return null;
      return buildSanityImageUrl(source, imageParams);
    },
    [projects, imageParams]
  );

  const currentListDisplaySrc = getDisplaySrcAt(
    currentProjectIndex,
    currentImageIndex
  );

  // Preloading
  useEffect(() => {
    if (projects.length === 0 || typeof window === 'undefined') return;
    const currentImages = projects[currentProjectIndex]?.images || [];
    if (currentImages.length === 0) return;

    const prevTarget =
      currentImageIndex > 0
        ? {
            projectIndex: currentProjectIndex,
            imageIndex: currentImageIndex - 1,
          }
        : {
            projectIndex:
              currentProjectIndex === 0
                ? projects.length - 1
                : currentProjectIndex - 1,
            imageIndex: Math.max(
              0,
              (
                projects[
                  currentProjectIndex === 0
                    ? projects.length - 1
                    : currentProjectIndex - 1
                ]?.images || []
              ).length - 1
            ),
          };

    const nextTarget =
      currentImageIndex < currentImages.length - 1
        ? {
            projectIndex: currentProjectIndex,
            imageIndex: currentImageIndex + 1,
          }
        : {
            projectIndex: (currentProjectIndex + 1) % projects.length,
            imageIndex: 0,
          };

    const preload = url => {
      if (!url || preloadedUrlsRef.current.has(url)) return;
      preloadedUrlsRef.current.add(url);
      const img = new window.Image();
      img.src = url;
    };

    preload(getDisplaySrcAt(prevTarget.projectIndex, prevTarget.imageIndex));
    preload(getDisplaySrcAt(nextTarget.projectIndex, nextTarget.imageIndex));
  }, [projects, currentProjectIndex, currentImageIndex, getDisplaySrcAt]);

  return {
    state,
    dispatch,
    navigateToImage,
    navigateListPrev,
    navigateListNext,
    currentListDisplaySrc,
    isMobile,
  };
}

// ==========================================
// 4. COMPOSANT PRINCIPAL
// ==========================================

export default function GalleryList({
  projects,
  view,
  onViewChange,
  onProjectSelect,
  setActiveCoord,
}) {
  const {
    state,
    dispatch,
    navigateToImage,
    navigateListPrev,
    navigateListNext,
    currentListDisplaySrc,
    isMobile,
  } = useGalleryLogic(projects, setActiveCoord);

  const {
    currentProjectIndex,
    currentImageIndex,
    isTransitioning,
    isListImageLoaded,
    listImageError,
  } = state;

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <DesktopNav
        view={view}
        onViewChange={onViewChange}
        projects={projects}
        currentProjectIndex={currentProjectIndex}
        navigateToImage={navigateToImage}
      />
      <MobileNavTop
        projects={projects}
        currentProjectIndex={currentProjectIndex}
        navigateToImage={navigateToImage}
      />{' '}
      <div className="flex-1  relative w-full h-full flex items-center justify-center overflow-hidden">
        <MainViewer
          currentListDisplaySrc={currentListDisplaySrc}
          project={projects[currentProjectIndex]}
          currentImageIndex={currentImageIndex}
          isMobile={isMobile}
          isTransitioning={isTransitioning}
          isListImageLoaded={isListImageLoaded}
          listImageError={listImageError}
          dispatch={dispatch}
          navigateListPrev={navigateListPrev}
          navigateListNext={navigateListNext}
          onProjectSelect={onProjectSelect}
        />
      </div>
      <MobileNavBottom
        projects={projects}
        currentProjectIndex={currentProjectIndex}
        navigateToImage={navigateToImage}
      />
    </div>
  );
}
