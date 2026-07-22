'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useReducer, useCallback } from 'react';
import { useParams } from 'next/navigation';
import client from '../../lib/sanity.client';
import { getOptimizedImageParams } from '../../lib/hooks';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import { AnimatePresence } from 'framer-motion';

import GalleryGrid from './GalleryGrid';
import GalleryList from './GalleryList';
import GalleryGridMore from './GalleryGridMore';
import GalleryProjetCartel from './GalleryProjetCartel';

function getProjectDateMs(project) {
  const raw = project?.date;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

const initialState = {
  projects: [],
  view: 'grid',
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
  const t = useTranslations('gallery');
  const { locale } = useParams();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { projects, view, selectedProject, overlayOpen, activeCoord } = state;

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

  // Basculement automatique en vue liste sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && view !== 'list') {
        dispatch({ type: 'UPDATE_STATE', payload: { view: 'list' } });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // Tri global des données (Calculé une seule fois ici)
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

  // Mémorisation des callbacks pour éviter les boucles de rendu infinies
  const handleViewChange = useCallback(v => {
    dispatch({ type: 'UPDATE_STATE', payload: { view: v } });
  }, []);

  const handleProjectSelect = useCallback(p => {
    dispatch({ type: 'UPDATE_STATE', payload: { selectedProject: p } });
  }, []);

  const handleSetActiveCoord = useCallback(coord => {
    dispatch({ type: 'UPDATE_STATE', payload: { activeCoord: coord } });
  }, []);

  return (
    <>
      <section className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-background">
        <div
          className={`relative flex flex-col justify-center items-start  ${
            view === 'grid'
              ? 'h-[75vh] lg:h-[90vh] w-[min(1400px,90vw)] xl:w-[min(1600px,90vw)]'
              : 'h-full w-[min(1100px,90vw)] 2xl:w-[min(1800px,90vw)]p-6'
          }`}
        >
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <GalleryGridMore
                key="grid"
                projects={projectsRecentFirst}
                view={view}
                onViewChange={handleViewChange}
                onProjectSelect={handleProjectSelect}
                setActiveCoord={handleSetActiveCoord}
              />
            ) : (
              <GalleryList
                key="list"
                projects={projectsChrono}
                view={view}
                onViewChange={handleViewChange}
                onProjectSelect={handleProjectSelect}
                setActiveCoord={handleSetActiveCoord}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="hidden lg:grid lg:grid-cols-3 md:grid-cols-1 items-center mt-16 lg:mt-4 w-[min(1024px,90vw)]">
          <div className="h-8 text-xl italic font-liberation text-blackCustom">
            {activeCoord}
          </div>
          {view === 'grid' && (
            <button
              type="button"
              className="justify-self-center px-4 py-2 text-xl italic font-liberation text-blackCustom hover:text-accent  fade-in hover:[--bg-size:100%_1px]"
              onClick={() =>
                dispatch({
                  type: 'UPDATE_STATE',
                  payload: { overlayOpen: true },
                })
              }
            ></button>
          )}
        </div>
      </section>

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
    </>
  );
}
