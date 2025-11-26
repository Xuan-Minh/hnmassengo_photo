"use client";
import React, { useState } from "react";

// Exemple de données de projets
const PROJECTS = [
  {
    id: 1,
    name: "M33",
    type: "artwork",
    images: ["/gallery/m33-1.jpg", "/gallery/m33-2.jpg", "/gallery/m33-3.jpg"],
    coords: "48.3705° N, 10.8978° E",
  },
  {
    id: 2,
    name: "Commission A",
    type: "commission",
    images: ["/gallery/commA-1.jpg", "/gallery/commA-2.jpg"],
    coords: "47.1234° N, 11.5678° E",
  },
  // ...ajoute ici les autres projets avec plusieurs images
];

const FILTERS = [
  { label: "all", value: "all" },
  { label: "artworks", value: "artwork" },
  { label: "commissions", value: "commission" },
];

import GalleryGridMore from "./GalleryGridMore";
import ProjetCartel from "./ProjetCartel";
import { AnimatePresence } from "framer-motion";

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [hoveredId, setHoveredId] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // --- States pour le mode LIST ---
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = (newView) => {
    if (view === newView) return;
    setIsAnimating(true);
    setTimeout(() => {
      setView(newView);
      setIsAnimating(false);
    }, 300);
  };

  // Filtrage des projets
  const filteredProjects = PROJECTS.filter(
    (p) => filter === "all" || p.type === filter
  );

  // Reset index si on change de filtre
  React.useEffect(() => {
    setCurrentProjectIndex(0);
    setCurrentImageIndex(0);
  }, [filter]);

  // Timer pour le slideshow en mode LIST
  React.useEffect(() => {
    if (view !== "list") return;
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
          setCurrentImageIndex((prev) => prev + 1);
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
  const allImages = filteredProjects.flatMap((p) =>
    p.images.map((img, idx) => ({
      projectId: p.id,
      name: p.name,
      type: p.type,
      img,
      coords: p.coords,
      isFirst: idx === 0,
    }))
  );

  // Pour la grille 5x5, la première case est réservée aux filtres/view
  const gridItems = [
    { type: "filters" },
    ...allImages.slice(0, 24), // 24 images max affichées
  ];

  // Gestion du curseur custom
  React.useEffect(() => {
    if (!hoveredId && view === "grid") {
      document.body.style.cursor = "default";
      return;
    }
    // En mode list, le curseur pointer sur l'image centrale
    if (view === "list") {
      // géré via CSS class
      return;
    }

    const project = PROJECTS.find((p) => p.id === hoveredId);
    if (project) {
      document.body.style.cursor = `pointer`;
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [hoveredId, view]);

  // Auto-switch to list view on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (view !== "list") setView("list");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [view]);

  // Composant Controls (Filtres + Toggle View)
  const Controls = () => (
    <div className="flex flex-col items-start justify-start p-2 font-playfair md:h-full">
      <div className="flex gap-4 mb-4">
        <button
          className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
            view === "grid" ? "opacity-100" : "opacity-50 hover:opacity-100"
          }`}
          onClick={() => handleViewChange("grid")}
          aria-label="Grid view"
        >
          <img
            src="/icons/gridOff.png"
            alt="Grid View Off"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === "grid" ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src="/icons/gridOn.png"
            alt="Grid View On"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === "grid" ? "opacity-100" : "opacity-0"
            }`}
          />
        </button>
        <button
          className={`relative w-6 h-6 transition-opacity duration-300 ease-in-out ${
            view === "list" ? "opacity-100" : "opacity-50 hover:opacity-100"
          }`}
          onClick={() => handleViewChange("list")}
          aria-label="List view"
        >
          <img
            src="/icons/listOff.png"
            alt="List View Off"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === "list" ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src="/icons/listOn.png"
            alt="List View On"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              view === "list" ? "opacity-100" : "opacity-0"
            }`}
          />
        </button>
      </div>
      {view === "grid" && (
        <div className="flex flex-col gap-1 items-start">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`text-lg text-left relative group transition-opacity duration-300 ${
                filter === f.value
                  ? "font-bold opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span
                className={`absolute left-0 bottom-0 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                  filter === f.value ? "w-full" : "w-0 group-hover:w-full"
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
      <section id="works" className="relative w-full h-screen overflow-hidden">
        <div
          className={`w-full h-full flex flex-col justify-center items-center transition-opacity duration-300 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            style={{ width: "min(1100px, 90vw)", height: "min(1100px, 80vh)" }}
            className="relative flex flex-col justify-center items-start mt-12"
          >
            {view === "grid" ? (
              // --- MODE GRID ---
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-[minmax(160px,1fr)_repeat(4,1fr)] md:grid-rows-5 gap-8 overflow-y-auto pr-4">
                {gridItems.map((item, idx) => {
                  if (idx === 0) {
                    // Case filtres + view
                    return (
                      <div key="filters" className="">
                        <Controls />
                      </div>
                    );
                  }
                  if (!item) return <div key={idx} />;
                  // Case image d'un projet
                  const imgData = item;
                  const isHovered = hoveredId === imgData.projectId;
                  return (
                    <div
                      key={imgData.img}
                      className="relative group cursor-pointer"
                      onMouseEnter={() => setHoveredId(imgData.projectId)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        const projectData = PROJECTS.find(
                          (p) => p.id === imgData.projectId
                        );
                        setSelectedProject(projectData);
                      }}
                    >
                      <img
                        src={imgData.img}
                        alt={imgData.name}
                        className={`w-full h-full object-cover rounded shadow transition-opacity duration-300 ${
                          isHovered ? "opacity-100" : "opacity-40"
                        }`}
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              // --- MODE LIST ---
              <div className="w-full h-full flex flex-col md:flex-row">
                {/* Colonne gauche : Controls */}
                <div className="hidden md:block w-full md:w-[160px] flex-shrink-0 mb-4 md:mb-0">
                  <Controls />
                </div>

                {/* Colonne centrale : Liste projets + Slideshow */}
                <div className="flex-1 flex flex-col h-full relative">
                  {/* Liste des projets en haut */}
                  <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8 w-full">
                    {filteredProjects.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCurrentProjectIndex(idx);
                          setCurrentImageIndex(0);
                        }}
                        className={`text-lg font-playfair transition-all duration-300 ${
                          idx === currentProjectIndex
                            ? "font-bold underline underline-offset-4"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  {/* Zone centrale image (Slideshow) */}
                  <div className="flex-1 relative w-full h-full flex items-center justify-center bg-gray-50/50">
                    {filteredProjects.length > 0 && (
                      <img
                        src={
                          filteredProjects[currentProjectIndex].images[
                            currentImageIndex
                          ]
                        }
                        alt={filteredProjects[currentProjectIndex].name}
                        className={`max-w-full max-h-full object-contain shadow-lg cursor-pointer transition-opacity duration-300 ${
                          isTransitioning ? "opacity-0" : "opacity-100"
                        }`}
                        onClick={() =>
                          setSelectedProject(
                            filteredProjects[currentProjectIndex]
                          )
                        }
                      />
                    )}
                  </div>
                </div>

                {/* Spacer pour centrer le contenu */}
                <div className="hidden md:block w-[160px] flex-shrink-0" />
              </div>
            )}
          </div>

          {/* Footer commun */}
          <div
            style={{ width: "min(1100px, 90vw)" }}
            className="flex justify-between items-start mt-4"
          >
            <div className="text-xl font-playfair italic text-blackCustom h-8">
              {view === "grid"
                ? hoveredId && PROJECTS.find((p) => p.id === hoveredId)?.coords
                : filteredProjects[currentProjectIndex]?.coords}
            </div>
            {view === "grid" && (
              <button
                className="text-lg font-playfair italic text-accent hover:text-accentHover transition-colors"
                onClick={() => setOverlayOpen(true)}
              >
                see more
              </button>
            )}
          </div>
        </div>
      </section>
      <AnimatePresence>
        {overlayOpen && (
          <GalleryGridMore
            onClose={() => setOverlayOpen(false)}
            onProjectClick={(project) => setSelectedProject(project)}
            projects={PROJECTS}
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
    </>
  );
}
