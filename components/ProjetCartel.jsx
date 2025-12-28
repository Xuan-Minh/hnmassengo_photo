"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false }
);
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

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-[#1a1a1a] text-[#e5e5e5] font-playfair flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* En-tête */}
      <div className="absolute top-8 left-8 md:left-16 z-40">
        <button
          onClick={onClose}
          className="text-lg hover:text-white transition-colors"
        >
          back
        </button>
      </div>

      {/* Contenu principal (MOBILE) */}
      <div className="flex-1 flex flex-col w-full h-full md:hidden">
        <div className="flex-1 flex flex-col w-full justify-center">
          <div className="flex-1 flex flex-col items-center justify-center w-full max-h-[70vh] px-6">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center flex-nowrap"
            >
              <Image
                src={images[currentIndex]}
                alt={`${project.name} - Image ${currentIndex + 1} of ${images.length}`}
                width={900}
                height={700}
                className="max-h-[65vh] max-w-full w-auto object-contain shadow-2xl mx-auto"
                sizes="(max-width : 1200px) 100vw, 900px"
                priority
              />
            </motion.div>
            <div className="text-center w-full z-40 text-lg italic mt-2">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full px-4 py-4 text-base">
          <span className="italic">{project.coords}</span>
          <span>{project.name} - 20XX</span>
        </div>
      </div>
      <section className="md:hidden">
        {/* Séparateur */}
        <div className="w-full border-t border-white/20 my-4" />
        {/* Marquee horizontal des miniatures */}
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-4 px-4">
            {images.map((img, idx) => (
              <button
                key={img + idx}
                onClick={() => setCurrentIndex(idx)}
                className={`border-2 rounded transition-all duration-200 ${
                  idx === currentIndex
                    ? "border-white/80 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                style={{ minWidth: 80, minHeight: 80 }}
              >
                <Image
                  src={img}
                  alt={`Miniature ${idx + 1}`}
                  width={80}
                  height={80}
                  className="object-contain max-h-20 max-w-20"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content (DESKTOP) : version d'origine */}
      <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden w-full h-full">
        {/* Image précédente */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none">
          <Image
            src={images[(currentIndex - 1 + images.length) % images.length]}
            alt={`${project.name} - Image précédente`}
            width={300}
            height={200}
            className="w-full h-full object-contain"
            sizes="(max-width: 768px) 100vw, 300px"
            priority={false}
          />
        </div>

        {/* Image principale */}
        <div className="relative z-10 h-[60%] w-full max-w-[50%] flex items-center justify-center">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={images[currentIndex]}
              alt={`${project.name} - Image ${currentIndex + 1} sur ${images.length}`}
              width={800}
              height={600}
              className="max-h-[70vh] max-w-[50vw] object-contain "
              sizes="(max-width: 1200px) 50vw, 800px"
              priority
            />
          </motion.div>
        </div>

        {/* Image suivante */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none">
          <Image
            src={images[(currentIndex + 1) % images.length]}
            alt="suivante"
            width={300}
            height={200}
            className="w-full h-full object-contain"
            sizes="(max-width: 768px) 100vw, 300px"
            priority={false}
          />
        </div>

        {/* Contrôles de navigation - Zone gauche */}
        <div
          className="absolute left-0 top-0 h-full w-[20%] z-30 flex items-center justify-start pl-8 md:pl-16 group cursor-pointer"
          onClick={() =>
            setCurrentIndex(
              (prev) => (prev - 1 + images.length) % images.length
            )
          }
        >
          <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            précédent &larr;
          </span>
        </div>

        {/* Contrôles de navigation - Zone droite */}
        <div
          className="absolute right-0 top-0 h-full w-[20%] z-30 flex items-center justify-end pr-8 md:pr-16 group cursor-pointer"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        >
          <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            &rarr; suivant
          </span>
        </div>

        {/* Pied de page */}
        <div className="absolute bottom-20 left-0 w-full h-[1px] bg-white/20 z-20" />
        <div className="absolute bottom-8 left-8 md:left-16 text-xl italic z-40">
          {project.coords}
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xl z-40">
          {project.name} - 2024
        </div>
      </div>
    </motion.div>
  );
}

// Composant pour le carrousel d'images horizontal (mobile)
function ImageMarqueeHorizontal({ images, onClick }) {
  const allImages = [...images, ...images];

  return (
    <div
      className="w-full h-full relative bg-whiteCustom cursor-pointer overflow-hidden flex items-center"
      onClick={onClick}
    >
      <motion.div
        className="flex items-center"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          ease: "linear",
          duration: images.length * 4,
          repeat: Infinity,
        }}
      >
        {allImages.map((img, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex justify-center items-center px-8"
          >
            <Image
              src={img}
              alt={`Project image ${index + 1}`}
              width={400}
              height={300}
              className="h-[30vh] w-auto object-contain"
              draggable={false}
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Composant pour le carrousel d'images vertical (desktop)
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
              <Image
                src={img}
                alt={`Project image ${index + 1}`}
                width={400}
                height={300}
                className="w-3/5 h-auto object-contain"
                draggable={false}
                sizes="(max-width: 1200px) 100vw, 400px"
                priority={false}
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
        className="fixed top-0 right-0 w-screen h-screen bg-whiteCustom z-50 flex flex-col md:flex-row shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="project-title"
      >
        {/* Version Mobile : Mise en page verticale */}
        <div className="md:hidden w-full h-full flex flex-col relative">
          {/* Bouton retour en position absolue */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 z-10 font-playfair text-lg text-blackCustom/60 hover:text-blackCustom transition-colors"
            aria-label="Fermer l'overlay du projet"
          >
            back
          </button>

          {/* Section supérieure : Marquee horizontal - 50vh */}
          <div className="h-[50vh] flex-shrink-0 flex items-center">
            <ImageMarqueeHorizontal
              images={project.images}
              onClick={() => setLightboxOpen(true)}
            />
          </div>

          {/* Ligne de séparation */}
          <div className="border-t border-blackCustom/20"></div>

          {/* Section inférieure : Cartel - reste de l'espace */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Contenu texte */}
            <div className="p-6 flex-1">
              <div className="font-playfair text-lg italic text-blackCustom mb-4">
                <TextReveal text={project.coords} />
              </div>
              <h2 id="project-title" className="mb-6">
                <TextReveal
                  text={project.name}
                  className="text-3xl font-playfair italic"
                />
              </h2>
              <div className="font-playfair text-base leading-relaxed space-y-4">
                {paragraphs.map((p, i) => (
                  <div key={i} className="relative">
                    <TextReveal text={p} delay={0.2 + i * 0.1} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Version Desktop : Mise en page horizontale */}
        <main className="hidden md:flex w-[55%] h-full border-r border-blackCustom p-16 flex-col justify-between overflow-y-auto">
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
              aria-label="Fermer l'overlay du projet"
            >
              back
            </button>
          </div>

          <section className="flex flex-col items-start justify-center my-8">
            <h2 id="project-title" className="mb-8">
              <TextReveal
                text={project.name}
                className="text-5xl font-playfair"
              />
            </h2>
            <div className="font-playfair text-lg max-w-2xl leading-relaxed space-y-4">
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

        {/* Colonne de droite : Carrousel d'images vertical (desktop uniquement) */}
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

ProjetCartel.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    coords: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
