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

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [hoveredId, setHoveredId] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Filtrage des projets
  const filteredProjects = PROJECTS.filter(
    (p) => filter === "all" || p.type === filter
  );

  // On veut toutes les images de tous les projets filtrés
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
    if (!hoveredId) {
      document.body.style.cursor = "default";
      return;
    }
    const project = PROJECTS.find((p) => p.id === hoveredId);
    if (project) {
      document.body.style.cursor = `pointer`;
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [hoveredId]);

  return (
    <section
      id="works"
      className="relative w-full h-full flex flex-col justify-center items-center"
    >
      <div
        className="grid grid-cols-5 grid-rows-5 gap-8 mr-auto p-4"
        style={{ width: "min(1100px, 90vw)" }}
      >
        {gridItems.map((item, idx) => {
          if (idx === 0) {
            // Case filtres + view
            return (
              <div
                key="filters"
                className="flex flex-col items-start justify-start p-2"
              >
                <div className="flex gap-2 mb-4">
                  <button
                    className={`text-2xl ${view === "grid" ? "font-bold" : "opacity-40"}`}
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                  >
                    <span
                      className="inline-block w-6 h-6 bg-black/80"
                      style={{
                        mask: "url(/icons/grid.svg) center/contain no-repeat",
                      }}
                    />
                  </button>
                  <button
                    className={`text-2xl ${view === "list" ? "font-bold" : "opacity-40"}`}
                    onClick={() => setView("list")}
                    aria-label="List view"
                  >
                    <span
                      className="inline-block w-6 h-6 bg-black/80"
                      style={{
                        mask: "url(/icons/list.svg) center/contain no-repeat",
                      }}
                    />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      className={`text-lg text-left ${filter === f.value ? "font-bold" : "opacity-60"}`}
                      onClick={() => setFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
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
                /* ouvrir cartel projet */
              }}
            >
              <img
                src={imgData.img}
                alt={imgData.name}
                className={`w-full h-full object-cover rounded shadow transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-40"}`}
                draggable={false}
              />
            </div>
          );
        })}
      </div>
      {/* Coordonnées projet hover */}
      {hoveredId && (
        <div className="absolute left-8 bottom-8 text-xl font-playfair italic text-blackCustom bg-transparent px-4 py-2">
          {PROJECTS.find((p) => p.id === hoveredId)?.coords}
        </div>
      )}
      {/* Bouton see more */}
      <button
        className="absolute right-12 bottom-8 text-lg font-playfair italic text-blackCustom underline underline-offset-2"
        onClick={() => setOverlayOpen(true)}
      >
        see more →
      </button>
      {/* Overlay gallery */}
    </section>
  );
}
