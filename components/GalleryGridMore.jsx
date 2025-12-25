"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const FILTERS = [
  { label: "all", value: "all" },
  { label: "artworks", value: "artwork" },
  { label: "commissions", value: "commission" },
];

export default function GalleryGridMore({
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

  // Find hovered project to display coords
  const hoveredProject = projects.find((p) => p.id === hoveredId);

  return (
    <motion.div
      className="fixed inset-0 bg-whiteCustom z-[100] flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="relative w-full h-24 flex items-center justify-center px-8 md:px-16 shrink-0">
        <button
          onClick={onClose}
          className="absolute left-8 md:left-16 text-lg font-playfair text-blackCustom/60 hover:text-blackCustom transition-colors"
        >
          back
        </button>
        <h2 className="text-4xl font-playfair italic text-blackCustom/20">
          Gallery
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden px-8 md:px-16 pb-16">
        {/* Sidebar Filters */}
        <div className="w-48 flex flex-col gap-2 pt-8 shrink-0">
          {FILTERS.map((f) => (
            <motion.button
              layout
              key={f.value}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.5, type: "spring" }}
              className={`text-lg text-left font-playfair transition-colors duration-300 ${
                filter === f.value
                  ? "font-bold text-blackCustom"
                  : "text-blackCustom/60 hover:text-blackCustom"
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pl-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-16">
            {allImages.map((imgData, index) => {
              const isHovered = hoveredId === imgData.projectId;
              return (
                <motion.div
                  layout
                  exit={{ opacity: 0, scale: 0.7 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  key={imgData.projectId + "-" + index}
                  className="relative group cursor-pointer flex items-center justify-center w-full h-full overflow-hidden"
                  onMouseEnter={() => setHoveredId(imgData.projectId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleImageClick(imgData.project)}
                >
                  <img
                    src={imgData.src}
                    alt={imgData.name}
                    className={`max-w-[90%] max-h-[90%] 2xl:max-w-[98%] 2xl:max-h-[98%] object-contain shadow transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-40"
                    }`}
                    draggable={false}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Coords */}
      <div className="absolute bottom-8 left-8 md:left-16 text-xl font-playfair italic text-blackCustom pointer-events-none">
        {hoveredProject ? hoveredProject.coords : ""}
      </div>
    </motion.div>
  );
}
