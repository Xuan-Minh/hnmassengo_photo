"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TextReveal from "./TextReveal";
import { EVENTS, emitEvent } from "../lib/events";

// Composant CustomLightbox
function CustomLightbox({ open, onClose, images, project }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setCurrentIndex((prev) => (prev + 1) % images.length);
      if (e.key === "ArrowLeft")
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, images.length]);

  if (!open) return null;

  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-[#1a1a1a] text-[#e5e5e5] font-playfair flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="absolute top-8 left-8 md:left-16 z-40">
        <div className="text-lg mb-2 opacity-0 pointer-events-none">
          Placeholder
        </div>{" "}
        {/* Spacer to match logo height if needed, or just place back button */}
        <button
          onClick={onClose}
          className="text-lg hover:text-white transition-colors"
        >
          back
        </button>
      </div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 text-lg italic">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden w-full h-full">
        {/* Prev Image */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none hidden md:block">
          <img
            src={images[prevIndex]}
            className="w-full h-full object-contain"
            alt="previous"
          />
        </div>

        {/* Main Image */}
        <div className="relative z-10 h-[60%] md:h-[80%] w-full max-w-[60%] flex items-center justify-center">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            className="max-h-full max-w-full object-contain shadow-2xl"
            alt="current"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Next Image */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none hidden md:block">
          <img
            src={images[nextIndex]}
            className="w-full h-full object-contain"
            alt="next"
          />
        </div>

        {/* Navigation Controls - Left Zone */}
        <div
          className="absolute left-0 top-0 h-full w-[20%] z-30 flex items-center justify-start pl-8 md:pl-16 group cursor-pointer"
          onClick={() =>
            setCurrentIndex(
              (prev) => (prev - 1 + images.length) % images.length
            )
          }
        >
          <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            previous &larr;
          </span>
        </div>

        {/* Navigation Controls - Right Zone */}
        <div
          className="absolute right-0 top-0 h-full w-[20%] z-30 flex items-center justify-end pr-8 md:pr-16 group cursor-pointer"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        >
          <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            &rarr; next
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-20 left-0 w-full h-[1px] bg-white/20 z-20" />
      <div className="absolute bottom-8 left-8 md:left-16 text-xl italic z-40">
        {project.coords}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xl z-40">
        {project.name} - 2024
      </div>
    </motion.div>
  );
}

// Composant pour le carrousel d'images vertical
function ImageMarquee({ images, onClick }) {
  // On duplique les images pour créer une boucle parfaite
  const allImages = [...images, ...images];

  return (
    <aside
      className="hidden md:flex flex-col w-[45%] h-full relative bg-whiteCustom cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-full overflow-hidden relative">
        <motion.div
          className="flex flex-col"
          animate={{
            y: ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: images.length * 8, // Ralentit la durée du défilement
            repeat: Infinity,
          }}
        >
          {allImages.map((img, index) => (
            <div
              key={index}
              className="w-full pb-16 flex-shrink-0 flex justify-center items-center"
            >
              <img
                src={img}
                alt={`Project image ${index + 1}`}
                className="w-3/5 h-auto object-contain"
                draggable={false}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </aside>
  );
}

export default function ProjetCartel({ project, onClose }) {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fermeture avec la touche Echap
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleLogoClick = () => {
    onClose(); // Déclenche l'animation de sortie

    // Après un délai pour laisser l'animation se jouer, on navigue et on lance l'intro
    setTimeout(() => {
      emitEvent(EVENTS.INTRO_SHOW);
      router.push("/");
    }, 800); // Délai légèrement inférieur à la durée de l'animation (1s)
  };

  if (!project) return null;

  const slides = project.images.map((src) => ({ src }));

  // Placeholder pour la description
  const description =
    project.description ||
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl. Vestibulum congue lacinia mi volutpat bibendum. Proin vitae odio est. Vivamus tempus pretium commodo. Nulla facilisi.

Nam dui metus, interdum vitae lobortis vel, viverra consequat neque. Praesent sagittis aliquet posuere. Aenean suscipit, mi quis viverra pulvinar, purus nulla placerat mi, quis mollis lectus ipsum vitae velit. Sed vehicula est in lobortis tincidunt.`;

  const paragraphs = description.split("\n\n");

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-whiteCustom/80 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      ></motion.div>
      <motion.section
        className="fixed top-0 right-0 w-screen h-screen bg-whiteCustom z-50 flex shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} // Augmentation de la durée à 1s
        aria-modal="true"
        role="dialog"
        aria-labelledby="project-title"
      >
        {/* Colonne de gauche: Infos projet */}
        <main className="w-full md:w-[55%] h-full border-r border-blackCustom p-8 md:p-16 flex flex-col justify-between overflow-y-auto">
          <div>
            <div
              className="flex items-center gap-2 text-lg text-accent mb-2 cursor-pointer"
              onClick={handleLogoClick}
              title="Retour à l'accueil"
            >
              <span className="font-playfair italic">Han-Noah</span>
              <span className="font-lexend">MASSENGO</span>
            </div>
            <button
              onClick={onClose}
              className="font-playfair text-lg text-blackCustom/60 hover:text-blackCustom transition-colors"
            >
              back
            </button>
          </div>

          <section className="flex flex-col items-start justify-center my-8">
            <h2 id="project-title" className="mb-8">
              <TextReveal
                text={project.name}
                className="text-3xl md:text-5xl font-playfair"
              />
            </h2>
            <div className="font-playfair text-base md:text-lg max-w-2xl leading-relaxed space-y-4">
              {paragraphs.map((p, i) => (
                <div key={i} className="relative">
                  <TextReveal text={p} delay={0.2 + i * 0.1} />
                </div>
              ))}
            </div>
          </section>

          <div className="font-playfair text-xl italic text-blackCustom">
            <TextReveal text={project.coords} delay={0.5} />
          </div>
        </main>

        {/* Colonne de droite: Carrousel d'images */}
        <ImageMarquee
          images={project.images}
          onClick={() => setLightboxOpen(true)}
        />
      </motion.section>

      {/* Lightbox pour afficher toutes les images */}
      <AnimatePresence>
        {lightboxOpen && (
          <CustomLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            images={project.images}
            project={project}
          />
        )}
      </AnimatePresence>
    </>
  );
}
