'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { GALLERY_FILTERS } from '../lib/constants';
import client from '../lib/sanity.client';

// Utiliser les données depuis Sanity
const FILTERS = GALLERY_FILTERS;

import GalleryGridMore from './GalleryGridMore';
import ProjetCartel from './ProjetCartel';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Gallery() {
  const t = useTranslations();
  const { locale } = useParams();
  const [projects, setProjects] = useState([]);

  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [hoveredId, setHoveredId] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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

  // --- States pour le mode LIST ---
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Charger les projets depuis Sanity
  useEffect(() => {
    const fetchProjects = async () => {
      const data = await client.fetch(
        '*[_type == "project"] { ..., images[]{ asset->{ url } } }'
      );
      console.log('Fetched projects:', data); // Debug
      const mapped = data.map(p => ({
        id: p._id,
        name:
          p.name?.[locale] || p.name?.fr || p[`name_${locale}`] || p.name_fr,
        type: p.type,
        images: p.images?.map(img => img.asset?.url) || [],
        coords: p.coords,
        description:
          p.description?.[locale] ||
          p.description?.fr ||
          p[`description_${locale}`] ||
          p.description_fr,
      }));
      console.log('Mapped projects:', mapped); // Debug
      setProjects(mapped);
    };
    fetchProjects();
  }, [locale]);

  const handleViewChange = newView => {
    if (view === newView) return;
    setView(newView);
  };

  // Filtrage des projets
  const filteredProjects = projects.filter(
    p => filter === 'all' || p.type === filter
  );

  // Reset index si on change de filtre
  useEffect(() => {
    setCurrentProjectIndex(0);
    setCurrentImageIndex(0);
  }, [filter]);

  // Timer pour le slideshow en mode LIST
  useEffect(() => {
    if (view !== 'list') return;
    if (filteredProjects.length === 0) return;

    const timer = setInterval(() => {
      // On lance la transition fade-out
      setIsTransitioning(true);

      setTimeout(() => {
        // Après le fade-out, on change l'image
        const currentProject = filteredProjects[currentProjectIndex];
        if (!currentProject) return;

        if (currentImageIndex < currentProject.images.length - 1) {
          // Image suivante du même projet
          setCurrentImageIndex(prev => prev + 1);
        } else {
          // Projet suivant
          const nextProjIndex =
            (currentProjectIndex + 1) % filteredProjects.length;
          setCurrentProjectIndex(nextProjIndex);
          setCurrentImageIndex(0);
        }
        // On relance le fade-in
        setIsTransitioning(false);
      }, 300); // Durée du fade-out
    }, 3000); // Durée d'affichage de chaque image

    return () => clearInterval(timer);
  }, [view, filteredProjects, currentProjectIndex, currentImageIndex]);

  // On veut toutes les images de tous les projets filtrés (pour le mode GRID)
  const allImages = filteredProjects.flatMap(p =>
    p.images.map((img, idx) => ({
      projectId: p.id,
      uniqueKey: `${p.id}-${idx}`,
      name: p.name,
      type: p.type,
      img,
      coords: p.coords,
      isFirst: idx === 0,
    }))
  );

  // Pour la grille 5x5, la première case est réservée aux filtres/view
  const gridItems = [
    { type: 'filters', uniqueKey: 'filters' },
    ...allImages.slice(0, 24), // 24 images max affichées (5x5 - 1 pour les filtres)
  ];

  // Gestion du curseur custom
  useEffect(() => {
    if (!hoveredId && view === 'grid') {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
      return;
    }
    // En mode list, le curseur pointer sur l'image centrale
    if (view === 'list') {
      setShowCustomCursor(false);
      // géré via CSS class
      return;
    }

    const project = projects.find(p => p.id === hoveredId);
    if (project) {
      document.body.style.cursor = 'none';
      setShowCustomCursor(true);
    }
    return () => {
      document.body.style.cursor = 'default';
      setShowCustomCursor(false);
    };
  }, [hoveredId, view, projects]);

  // Basculement automatique en vue liste sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (view !== 'list') setView('list');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // Composant Controls (Filtres + Toggle View)
  const Controls = () => (
    <div
      className={`flex flex-col items-start p-2 font-playfair md:h-full ${
        view === 'grid' ? 'justify-center' : 'justify-start'
      }`}
    >
      <div className="hidden lg:flex gap-4 mb-4">
        <button
          className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
            view === 'grid' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          }`}
          onClick={() => handleViewChange('grid')}
          aria-label="Grid view"
        >
          <Image
            src="/icons/gridOff.png"
            alt="Grid View Off"
            fill
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'grid' ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/icons/gridOn.png"
            alt="Grid View On"
            fill
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'grid' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
        <button
          className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
            view === 'list' ? 'opacity-100' : 'opacity-50 hover:opacity-100'
          }`}
          onClick={() => handleViewChange('list')}
          aria-label="List view"
        >
          <Image
            src="/icons/listOff.png"
            alt="List View Off"
            fill
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'list' ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/icons/listOn.png"
            alt="List View On"
            fill
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === 'list' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      </div>
      {view === 'grid' && (
        <div className="flex flex-col gap-1 items-start">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`text-lg text-left relative group transition-opacity duration-300 ${
                filter === f.value
                  ? 'font-bold opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span
                className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                  filter === f.value ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <section
        id="works"
        className="relative w-full h-screen overflow-hidden md:pt-10"
      >
        <div
          className={`w-full h-full flex flex-col justify-center items-center`}
        >
          <div
            style={{
              width: 'min(1000px, 90vw)',
            }}
            className="relative flex flex-col justify-center items-start h-[75vh] lg:h-[90vh]"
          >
            <AnimatePresence mode="wait">
              {view === 'grid' ? (
                // --- MODE GRID ---
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="w-full h-full grid grid-cols-1 md:grid-cols-5 md:grid-rows-5 gap-x-2 gap-y-2 overflow-hidden lg:pt-10"
                >
                  <AnimatePresence mode="popLayout">
                    {gridItems.map((item, idx) => {
                      if (idx === 0) {
                        // Case filtres + view
                        return (
                          <div
                            key="filters"
                            className="flex items-center justify-center"
                          >
                            <Controls />
                          </div>
                        );
                      }
                      if (!item) return <div key={`empty-${idx}`} />;
                      // Case image d'un projet
                      const imgData = item;
                      const isHovered = hoveredId === imgData.projectId;
                      return (
                        <motion.div
                          layout
                          exit={{ opacity: 0, scale: 0.7 }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, type: 'spring' }}
                          key={imgData.uniqueKey}
                          className="relative group cursor-pointer flex items-center justify-center w-full h-full overflow-hidden"
                          onMouseEnter={() => setHoveredId(imgData.projectId)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => {
                            const projectData = projects.find(
                              p => p.id === imgData.projectId
                            );
                            setSelectedProject(projectData);
                          }}
                        >
                          <Image
                            src={imgData.img}
                            alt={imgData.name}
                            width={600}
                            height={400}
                            className={`max-w-full max-h-full object-contain shadow transition-opacity duration-300 ${
                              isHovered ? 'opacity-100' : 'opacity-40'
                            }`}
                            style={{ objectFit: 'contain' }}
                            draggable={false}
                            sizes="(max-width: 768px) 45vw, (max-width: 1200px) 20vw, 18vw"
                            priority={idx < 5}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : (
                // --- MODE LIST ---
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="w-full h-full flex flex-col"
                >
                  {/* Ligne du haut : Boutons view + Liste projets - Desktop seulement */}
                  <div className="hidden lg:flex items-center justify-between gap-8 mb-12 mt-8 md:mt-12 w-full">
                    {/* Boutons de vue à gauche */}
                    <div className="flex gap-4 flex-shrink-0">
                      <button
                        className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
                          view === 'grid'
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                        onClick={() => handleViewChange('grid')}
                        aria-label="Grid view"
                      >
                        <Image
                          src="/icons/gridOff.png"
                          alt="Grid View Off"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'grid' ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                        <Image
                          src="/icons/gridOn.png"
                          alt="Grid View On"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'grid' ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </button>
                      <button
                        className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
                          view === 'list'
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                        onClick={() => handleViewChange('list')}
                        aria-label="List view"
                      >
                        <Image
                          src="/icons/listOff.png"
                          alt="List View Off"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'list' ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                        <Image
                          src="/icons/listOn.png"
                          alt="List View On"
                          fill
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            view === 'list' ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Liste des projets au centre */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 flex-1">
                      {filteredProjects.map((p, idx) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setCurrentProjectIndex(idx);
                            setCurrentImageIndex(0);
                          }}
                          className={`text-lg font-playfair transition-all duration-300 ${
                            idx === currentProjectIndex
                              ? 'font-bold underline underline-offset-4'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>

                    {/* Spacer à droite pour équilibrer */}
                    <div className="w-[52px] flex-shrink-0"></div>
                  </div>

                  {/* Zone centrale image (Slideshow) */}
                  <div className="flex-1 relative w-full h-[100vh] flex items-center justify-center overflow-hidden mt-0 md:mt-8 lg:mt-0">
                    {filteredProjects.length > 0 && (
                      <Image
                        src={
                          filteredProjects[currentProjectIndex].images[
                            currentImageIndex
                          ]
                        }
                        alt={filteredProjects[currentProjectIndex].name}
                        width={1200}
                        height={900}
                        className={`max-w-[85%] max-h-[50vh] lg:max-w-[70%] lg:max-h-[70%] xl:max-w-[80%] xl:max-h-[80%] object-contain cursor-pointer transition-opacity duration-300 ${
                          isTransitioning ? 'opacity-0' : 'opacity-100'
                        }`}
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 80vw"
                        onClick={() =>
                          setSelectedProject(
                            filteredProjects[currentProjectIndex]
                          )
                        }
                        priority
                      />
                    )}
                  </div>

                  {/* Liste des projets en bas - Mobile seulement */}
                  <div className="lg:hidden flex flex-row flex-wrap justify-center gap-x-6 gap-y-3 mt-3">
                    {filteredProjects.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCurrentProjectIndex(idx);
                          setCurrentImageIndex(0);
                        }}
                        className={`text-lg font-playfair transition-all duration-300 ${
                          idx === currentProjectIndex
                            ? 'font-bold underline underline-offset-4'
                            : 'opacity-60'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer commun */}
          <div
            style={{ width: 'min(1100px, 90vw)' }}
            className="grid lg:grid-cols-3 grid-cols-2 items-center mt-4"
          >
            <div className="text-xl font-playfair italic text-blackCustom h-8">
              {view === 'grid'
                ? hoveredId && projects.find(p => p.id === hoveredId)?.coords
                : filteredProjects[currentProjectIndex]?.coords}
            </div>
            {view === 'grid' && (
              <button
                className="justify-self-center text-xl font-playfair italic text-blackCustom hover:text-accentHover transition-colors px-4 py-2 rounded"
                onClick={() => setOverlayOpen(true)}
              >
                see more
              </button>
            )}
            <div></div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {overlayOpen && (
          <GalleryGridMore
            onClose={() => setOverlayOpen(false)}
            onProjectClick={project => setSelectedProject(project)}
            projects={projects}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedProject && (
          <ProjetCartel
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
      {/* Custom cursor for project name */}
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
