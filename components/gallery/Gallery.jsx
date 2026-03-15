'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
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

export default function Gallery() {
  const t = useTranslations('gallery');
  const { locale } = useParams();

  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('grid');
  const [selectedProject, setSelectedProject] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeCoord, setActiveCoord] = useState('');

  // Gérer le scroll quand un overlay est ouvert
  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;
    if (overlayOpen || selectedProject) {
      scrollRoot.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        scrollRoot.style.overflow = '';
      }, 50);
      return () => clearTimeout(timer);
    }
    return () => {
      scrollRoot.style.overflow = '';
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
          .map(img => img?.asset?.url)
          .filter(Boolean)
          .map(url =>
            buildSanityImageUrl(url, {
              ...getOptimizedImageParams('gallery-grid', isMobileDevice),
              auto: 'format',
            })
          ),
        coords: p.coords,
        date: p.date,
        description:
          p.description?.[locale] ||
          p.description?.fr ||
          p[`description_${locale}`] ||
          p.description_fr,
      }));
      setProjects(mapped);
    };
    fetchProjects();
  }, [locale]);

  // Basculement automatique en vue liste sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && view !== 'list') setView('list');
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

  return (
    <>
      <section className="relative w-full h-screen overflow-hidden">
        <div className="w-full h-full flex flex-col bg-background justify-center items-center">
          <div className="relative flex flex-col justify-center items-start h-[75vh] lg:h-[90vh] w-[min(1000px,90vw)] 2xl:w-[min(1300px,90vw)]">
            <AnimatePresence mode="wait">
              {view === 'grid' ? (
                <GalleryGrid
                  key="grid"
                  projects={projectsRecentFirst}
                  view={view}
                  onViewChange={setView}
                  onProjectSelect={setSelectedProject}
                  setActiveCoord={setActiveCoord}
                />
              ) : (
                <GalleryList
                  key="list"
                  projects={projectsRecentFirst}
                  view={view}
                  onViewChange={setView}
                  onProjectSelect={setSelectedProject}
                  setActiveCoord={setActiveCoord}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer commun isolé des animations ! */}
          <div
            style={{ width: 'min(1100px, 90vw)' }}
            className="grid lg:grid-cols-3 grid-cols-2 items-center mt-16 lg:mt-4"
          >
            <div className="text-xl font-playfair italic text-blackCustom h-8">
              {activeCoord}
            </div>
            {view === 'grid' && (
              <button
                className="justify-self-center text-xl font-playfair italic text-blackCustom hover:text-accent transition-all duration-300 px-4 py-2 rounded animate-in fade-in"
                onClick={() => setOverlayOpen(true)}
              >
                {t('seeMore')}
              </button>
            )}
            <div></div>
          </div>
        </div>
      </section>

      {/* Overlays Globaux */}
      <AnimatePresence>
        {overlayOpen && (
          <GalleryGridMore
            onClose={() => setOverlayOpen(false)}
            onProjectClick={setSelectedProject}
            projects={projects}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedProject && (
          <GalleryProjetCartel
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
