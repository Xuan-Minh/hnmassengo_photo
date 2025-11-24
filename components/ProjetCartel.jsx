"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from "framer-motion";

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
          className="flex flex-col space-y-8"
          animate={{
            y: ["0%", `-${100 * (images.length / allImages.length)}%`],
          }}
          transition={{
            ease: "linear",
            duration: images.length * 8, // Ralentit la durée du défilement
            repeat: Infinity,
          }}
        >
          {allImages.map((img, index) => (
            <div key={index} className="w-full px-16 flex-shrink-0">
              <img
                src={img}
                alt={`Project image ${index + 1}`}
                className="w-full h-auto object-contain"
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
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("intro:show"));
      }
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
            <h2
              id="project-title"
              className="text-3xl md:text-5xl font-playfair mb-8"
            >
              {project.name}
            </h2>
            <div className="font-playfair text-base md:text-lg max-w-2xl leading-relaxed space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="relative">
                  {p}
                  {i === paragraphs.length - 1 && (
                    <span className="absolute -bottom-1 -right-4 w-10 h-10 border-b border-r border-blackCustom/50"></span>
                  )}
                </p>
              ))}
            </div>
          </section>

          <div className="font-playfair text-xl italic text-blackCustom">
            {project.coords}
          </div>
        </main>

        {/* Colonne de droite: Carrousel d'images */}
        <ImageMarquee
          images={project.images}
          onClick={() => setLightboxOpen(true)}
        />
      </motion.section>

      {/* Lightbox pour afficher toutes les images */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .8)" } }}
      />
    </>
  );
}
