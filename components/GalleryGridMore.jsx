"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import OverlayActionButton from "./OverlayActionButton";

const FILTERS = [
  { label: "all", value: "all" },
  { label: "artworks", value: "artwork" },
  { label: "commissions", value: "commission" },
];

export default function GalleryGridMore({
  open,
  onClose,
  onProjectClick,
  projects = [],
}) {
  const t = useTranslations();
  const [filter, setFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState(null);

  // Filtrage des projets
  const filteredProjects = projects.filter(
    (p) => filter === "all" || p.type === filter
  );

  // On veut toutes les images de tous les projets filtrés
  const allImages = filteredProjects.flatMap((p) =>
    p.images.map((img, idx) => ({
      projectId: p.id,
      project: p, // Pass the whole project object
      name: p.name,
      type: p.type,
      src: img,
      coords: p.coords,
      isFirst: idx === 0,
    }))
  );

  const handleImageClick = (project) => {
    onProjectClick(project);
    onClose(); // Close the grid more overlay to show the cartel
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-whiteCustom z-[100] overflow-y-auto">
      <OverlayActionButton
        onClick={onClose}
        position="fixed top-8 right-8"
        label="close"
      />

      <div className="p-16 pt-24">
        <div className="w-full max-w-7xl mx-auto">
          {/* Filtres */}
          <div className="flex justify-center gap-8 mb-12 font-playfair">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`text-xl relative group transition-opacity duration-300 ${
                  filter === f.value
                    ? "font-bold opacity-100"
                    : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
                <span
                  className={`absolute left-0 -bottom-1 h-[1px] bg-current transition-all duration-300 ease-in-out ${
                    filter === f.value ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Grille d'images */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {allImages.map((imgData, index) => {
              const isHovered = hoveredId === imgData.projectId;
              return (
                <div
                  key={imgData.src + index}
                  className="relative group cursor-pointer aspect-square"
                  onMouseEnter={() => setHoveredId(imgData.projectId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleImageClick(imgData.project)}
                >
                  <img
                    src={imgData.src}
                    alt={imgData.name}
                    className={`w-full h-full object-cover rounded shadow-md transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-60"
                    }`}
                    draggable={false}
                  />
                  {isHovered && (
                    <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded text-sm font-playfair">
                      {imgData.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
