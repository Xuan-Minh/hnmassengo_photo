'use client';
import { useEffect, useMemo, useReducer, useCallback } from 'react';
import { useParams } from 'next/navigation';
import client from '../../lib/sanity.client';
import {
  getOptimizedImageParams,
  useIsMobile,
  useOrientation,
} from '../../lib/hooks';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import { AnimatePresence } from 'framer-motion';

import GalleryList from './GalleryList';
import GalleryGridMore from './GalleryGridMore';
import GalleryProjetCartel from './GalleryProjetCartel';
import GalleryMobile from './GalleryMobile';

const VIEW_SWITCH_FADE_MS = 180;

function getProjectDateMs(project) {
  let raw =
    typeof project?.date === 'object' ? project?.date?.start : project?.date;
  if (!raw) return null;
  if (typeof raw === 'string' && raw.length === 7 && raw.includes('-')) {
    raw = `${raw}-01`;
  }
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

const initialState = {
  projects: [],
  view: 'grid',
  pendingView: null,
  isViewSwitching: false,
  selectedProject: null,
  overlayOpen: false,
  activeCoord: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default function Gallery() {
  const { locale } = useParams();

  // ==========================================
  // HOOKS D'ORIENTATION ET D'ÉCRAN
  // ==========================================
  const isMobile = useIsMobile(1024); // Capte les tel même en paysage
  const isLandscape = useOrientation();

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    projects,
    view,
    pendingView,
    isViewSwitching,
    selectedProject,
    overlayOpen,
    activeCoord,
  } = state;

  // Gérer le scroll quand un overlay est ouvert
  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');

    if (overlayOpen || selectedProject) {
      if (scrollRoot) scrollRoot.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        if (scrollRoot) scrollRoot.style.overflow = '';
        document.body.style.overflow = '';
      }, 50);
      return () => clearTimeout(timer);
    }
    return () => {
      if (scrollRoot) scrollRoot.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [overlayOpen, selectedProject]);

  // Charger les projets depuis Sanity
  useEffect(() => {
    const fetchProjects = async () => {
      const isMobileDevice =
        typeof window !== 'undefined' ? window.innerWidth < 768 : false;
      const data = await client.fetch(
        '*[_type == "project"] { ..., images[]{ asset->{ url } } }'
      );
      const mapped = data.map(p => ({
        id: p._id,
        name:
          p.name?.[locale] || p.name?.fr || p[`name_${locale}`] || p.name_fr,
        type: p.type,
        images: (p.images || [])
          .flatMap(img => (img?.asset?.url ? [img.asset.url] : []))
          .reduce((acc, url) => {
            const optimized = buildSanityImageUrl(url, {
              ...getOptimizedImageParams('gallery-grid', isMobileDevice),
              auto: 'format',
            });
            if (!acc.includes(optimized)) acc.push(optimized);
            return acc;
          }, []),
        coords: p.coords,
        dateDisplay: typeof p.date === 'object' ? p.date?.display : p.date,
        date: p.date,
        description:
          p.description?.[locale] ||
          p.description?.fr ||
          p[`description_${locale}`] ||
          p.description_fr,
      }));

      dispatch({ type: 'UPDATE_STATE', payload: { projects: mapped } });
    };
    fetchProjects();
  }, [locale]);

  // Basculement automatique des vues selon la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768 && view !== 'mobile') {
        dispatch({ type: 'UPDATE_STATE', payload: { view: 'mobile' } });
      } else if (width >= 768 && width < 1024 && view !== 'list') {
        dispatch({ type: 'UPDATE_STATE', payload: { view: 'list' } });
      } else if (width >= 1024 && view === 'mobile') {
        dispatch({ type: 'UPDATE_STATE', payload: { view: 'grid' } });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // Tri global des données
  const projectsChrono = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      const am = getProjectDateMs(a);
      const bm = getProjectDateMs(b);
      if (am === null && bm === null)
        return (a?.name || '').localeCompare(b?.name || '');
      if (am === null) return 1;
      if (bm === null) return -1;
      return am - bm;
    });
    return arr;
  }, [projects]);

  const projectsRecentFirst = useMemo(() => {
    return [...projectsChrono].reverse();
  }, [projectsChrono]);

  // Callbacks
  const handleViewChange = useCallback(
    v => {
      if (v === view || isViewSwitching) return;
      dispatch({
        type: 'UPDATE_STATE',
        payload: { isViewSwitching: true, pendingView: v },
      });
    },
    [view, isViewSwitching]
  );

  useEffect(() => {
    if (!isViewSwitching || !pendingView) return;

    const scrollRoot = document.getElementById('scroll-root');
    const worksSection = document.getElementById('works');
    if (scrollRoot && worksSection) {
      const top =
        scrollRoot.scrollTop +
        (worksSection.getBoundingClientRect().top -
          scrollRoot.getBoundingClientRect().top);

      scrollRoot.scrollTo({ top, behavior: 'smooth' });
    }

    const timer = setTimeout(() => {
      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          view: pendingView,
          pendingView: null,
          isViewSwitching: false,
        },
      });
    }, VIEW_SWITCH_FADE_MS);

    return () => clearTimeout(timer);
  }, [isViewSwitching, pendingView]);

  // Gérer le retour à la homepage si on pivote en portrait pendant que le cartel est ouvert
  useEffect(() => {
    if (isMobile && !isLandscape && selectedProject) {
      // 1. On ferme le cartel
      dispatch({ type: 'UPDATE_STATE', payload: { selectedProject: null } });

      // 2. On scroll tout en haut du site (la homepage)
      const scrollRoot = document.getElementById('scroll-root');
      if (scrollRoot) {
        scrollRoot.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isLandscape, isMobile, selectedProject]);

  const centerWorksSectionOnScreen = useCallback(() => {
    const scrollRoot = document.getElementById('scroll-root');
    const worksSection = document.getElementById('works');

    if (!scrollRoot || !worksSection) return;

    const containerRect = scrollRoot.getBoundingClientRect();
    const worksRect = worksSection.getBoundingClientRect();
    const top =
      scrollRoot.scrollTop +
      (worksRect.top - containerRect.top) -
      containerRect.height / 2 +
      worksRect.height / 2;

    scrollRoot.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleProjectSelect = useCallback(
    p => {
      dispatch({ type: 'UPDATE_STATE', payload: { selectedProject: p } });
      centerWorksSectionOnScreen();
    },
    [centerWorksSectionOnScreen]
  );

  useEffect(() => {
    if (selectedProject) {
      dispatch({ type: 'UPDATE_STATE', payload: { overlayOpen: true } });
    } else {
      dispatch({ type: 'UPDATE_STATE', payload: { overlayOpen: false } });
    }
  }, [selectedProject]);

  const handleSetActiveCoord = useCallback(coord => {
    dispatch({ type: 'UPDATE_STATE', payload: { activeCoord: coord } });
  }, []);

  return (
    <>
      {/* ========================================== */}
      {/* CAS 1 : MOBILE PORTRAIT -> LE BOUCLIER DANS LE FLUX NORMAL */}
      {/* ========================================== */}
      {isMobile && !isLandscape && (
        <section
          id="works"
          className="w-full h-[100vh] lg:h-[80vh] flex flex-col items-center justify-center bg-background text-blackCustom text-center px-6"
        >
          <div className="mb-6 animate-[spin_3s_ease-in-out_infinite]">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <path d="M12 18h.01" />
              <path d="M20.5 12a8.5 8.5 0 0 1-8.5 8.5" />
            </svg>
          </div>
          <h2 className="text-2xl lg:text-3xl font-liberation italic mb-4">
            Pivoter pour accéder
          </h2>
          <p className="text-blackCustom/70 font-liberation text-sm max-w-xs">
            L'expérience de cette galerie a été pensée pour un affichage
            horizontal.
          </p>
        </section>
      )}

      {/* ========================================== */}
      {/* CAS 2 & 3 : DESKTOP ou MOBILE PAYSAGE -> LA GALERIE */}
      {/* ========================================== */}
      {(!isMobile || isLandscape) && (
        <section
          id="works"
          // La galerie passe en z-[100] au lieu de z-[9999]
          className={`flex flex-col items-center justify-center w-full overflow-hidden bg-background ${
            isMobile && isLandscape
              ? 'fixed inset-0 z-[100] h-[100dvh]'
              : 'relative h-screen'
          }`}
        >
          <div
            className={`relative flex flex-col justify-center items-start ${
              view === 'grid'
                ? 'h-[75vh] lg:h-[85vh] w-[min(1400px,90vw)] xl:w-[min(1800px,95vw)]'
                : isMobile && isLandscape
                  ? 'h-full w-full'
                  : 'h-full w-[min(1100px,90vw)] 2xl:w-[min(1800px,90vw)]'
            }`}
          >
            <div
              // On désactive la transition d'opacité sur mobile pour éviter le "fade out" fantôme
              className={`w-full h-full ease-in-out ${
                isViewSwitching && !isMobile
                  ? 'transition-[opacity,transform] duration-[180ms] opacity-0 scale-[0.995] pointer-events-none'
                  : 'transition-none opacity-100 scale-100'
              }`}
            >
              <AnimatePresence mode="wait">
                {view === 'grid' && (
                  <GalleryGridMore
                    key="grid"
                    projects={projectsChrono}
                    view={view}
                    onViewChange={handleViewChange}
                    onProjectSelect={handleProjectSelect}
                    setActiveCoord={handleSetActiveCoord}
                    onFilterClick={centerWorksSectionOnScreen}
                  />
                )}
                {view === 'list' && (
                  <GalleryList
                    key="list"
                    projects={projectsChrono}
                    view={view}
                    onViewChange={handleViewChange}
                    onProjectSelect={handleProjectSelect}
                    setActiveCoord={handleSetActiveCoord}
                  />
                )}
                {view === 'mobile' && (
                  <GalleryMobile
                    key="mobile"
                    projects={projectsRecentFirst}
                    view={view}
                    onViewChange={handleViewChange}
                    onProjectSelect={handleProjectSelect}
                    setActiveCoord={handleSetActiveCoord}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:grid lg:grid-cols-3 md:grid-cols-1 items-center mt-16 lg:mt-4 w-[min(1024px,90vw)]">
            <div className="h-8 text-xl italic font-liberation text-blackCustom">
              {activeCoord}
            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* LE CARTEL (Z-INDEX 200 POUR PASSER AU-DESSUS) */}
      {/* ========================================== */}
      <div className="relative z-[200]">
        <AnimatePresence>
          {selectedProject && (
            <GalleryProjetCartel
              project={selectedProject}
              onClose={() =>
                dispatch({
                  type: 'UPDATE_STATE',
                  payload: { selectedProject: null },
                })
              }
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
