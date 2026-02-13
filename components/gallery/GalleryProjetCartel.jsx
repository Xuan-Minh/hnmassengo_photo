'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { motion, animate, useMotionValue } from 'framer-motion';
import BaseOverlay from '../overlays/BaseOverlay';
const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => mod.AnimatePresence),
  { ssr: false }
);
import TextReveal from '../ui/TextReveal';
import { EVENTS, emitEvent } from '../../lib/events';
import { buildSanityImageUrl } from '../../lib/imageUtils';

// Composant CustomLightbox
function CustomLightbox({ open, onClose, images, project }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);
  const [hasCurrentError, setHasCurrentError] = useState(false);
  const decodedSrcsRef = useRef(new Set());

  const getDisplaySrcForIndex = useCallback(
    idx => {
      const raw = images?.[idx];
      return buildSanityImageUrl(raw, { w: 2200, q: 75, auto: 'format' });
    },
    [images]
  );

  const goToIndex = useCallback(
    nextIndex => {
      if (!images?.length) return;
      const safeIndex =
        ((nextIndex % images.length) + images.length) % images.length;
      const nextSrc = getDisplaySrcForIndex(safeIndex);

      // Important: on met à jour l'état de chargement AVANT le render suivant
      // pour éviter un frame d'opacité à 0 quand l'image est déjà décodée/cachée.
      setHasCurrentError(false);
      setIsCurrentLoaded(decodedSrcsRef.current.has(nextSrc));
      setCurrentIndex(safeIndex);
    },
    [images, getDisplaySrcForIndex]
  );

  const currentDisplaySrc = useMemo(() => {
    const raw = images?.[currentIndex];
    return buildSanityImageUrl(raw, { w: 2200, q: 75, auto: 'format' });
  }, [images, currentIndex]);

  useEffect(() => {
    if (open) {
      goToIndex(0);
    }
  }, [open, goToIndex]);

  useEffect(() => {
    if (!open) return;
    setHasCurrentError(false);

    // Évite un flash/blank si l'image est déjà en cache (et décodée).
    setIsCurrentLoaded(decodedSrcsRef.current.has(currentDisplaySrc));
  }, [open, currentIndex, currentDisplaySrc]);

  // Précharger réellement la version "centre" (haute résolution) et les voisins.
  // Les images sur les côtés sont souvent de plus petite taille / URL différente,
  // donc elles ne garantissent pas que la version centrale soit déjà en cache.
  useEffect(() => {
    if (!open) return;
    if (typeof window === 'undefined') return;
    if (!images?.length) return;

    let cancelled = false;

    const preload = src => {
      if (!src) return;
      const img = new window.Image();
      img.src = src;

      const markReady = () => {
        decodedSrcsRef.current.add(src);
        if (!cancelled && src === currentDisplaySrc) {
          setIsCurrentLoaded(true);
        }
      };

      // decode() réduit le micro délai "image visible mais pas encore rendue".
      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(markReady)
          .catch(() => {
            // Certaines images peuvent ne pas supporter decode() selon navigateur/format.
          });
      } else {
        img.onload = markReady;
      }
    };

    preload(currentDisplaySrc);

    if (images.length > 1) {
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;

      const nextSrc = buildSanityImageUrl(images[nextIndex], {
        w: 2200,
        q: 75,
        auto: 'format',
      });
      const prevSrc = buildSanityImageUrl(images[prevIndex], {
        w: 2200,
        q: 75,
        auto: 'format',
      });
      preload(nextSrc);
      preload(prevSrc);
    }

    return () => {
      cancelled = true;
    };
  }, [open, images, currentIndex, currentDisplaySrc]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToIndex(currentIndex + 1);
      if (e.key === 'ArrowLeft') goToIndex(currentIndex - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, images.length, currentIndex, goToIndex]);

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
          <div className="flex-1 flex flex-col items-center justify-center w-full max-h-[70vh] px-6 relative">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center flex-nowrap"
            >
              <Image
                src={currentDisplaySrc}
                alt={`${project.name} - Image ${currentIndex + 1} of ${images.length}`}
                width={900}
                height={700}
                className="max-h-[65vh] max-w-full w-auto object-contain shadow-2xl mx-auto"
                sizes="(max-width : 1200px) 100vw, 900px"
                unoptimized
                fetchPriority="high"
                decoding="async"
                onError={() => setHasCurrentError(true)}
                onLoadingComplete={() => setIsCurrentLoaded(true)}
                priority
              />
            </motion.div>
            {!isCurrentLoaded && !hasCurrentError && (
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}
            {hasCurrentError && (
              <div className="absolute inset-0 flex items-center justify-center text-white/70">
                image indisponible
              </div>
            )}
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
                onClick={() => goToIndex(idx)}
                className={`border-2 rounded transition-all duration-200 ${
                  idx === currentIndex
                    ? 'border-white/80 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
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
            src={buildSanityImageUrl(
              images[(currentIndex - 1 + images.length) % images.length],
              { w: 600, q: 60, auto: 'format' }
            )}
            alt={`${project.name} - Image précédente`}
            width={300}
            height={200}
            className="w-full h-full object-contain"
            sizes="(max-width: 768px) 100vw, 300px"
            priority={false}
            unoptimized
          />
        </div>

        {/* Image principale */}
        <div className="relative z-10 h-[60%] w-full max-w-[60%] flex items-center justify-center">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {!isCurrentLoaded && !hasCurrentError && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              )}
              {hasCurrentError && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70">
                  image indisponible
                </div>
              )}
              <Image
                src={currentDisplaySrc}
                alt={`${project.name} - Image ${currentIndex + 1} sur ${images.length}`}
                width={1100}
                height={800}
                className={`max-h-[75vh] max-w-[60vw] object-contain transition-opacity duration-300 ${
                  isCurrentLoaded && !hasCurrentError
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
                sizes="(max-width: 1200px) 70vw, 1100px"
                unoptimized
                fetchPriority="high"
                decoding="async"
                onError={() => setHasCurrentError(true)}
                onLoadingComplete={() => setIsCurrentLoaded(true)}
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Image suivante */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none">
          <Image
            src={buildSanityImageUrl(
              images[(currentIndex + 1) % images.length],
              {
                w: 600,
                q: 60,
                auto: 'format',
              }
            )}
            alt="suivante"
            width={300}
            height={200}
            className="w-full h-full object-contain"
            sizes="(max-width: 768px) 100vw, 300px"
            priority={false}
            unoptimized
          />
        </div>

        {/* Contrôles de navigation - Zone gauche */}
        <div
          className="absolute left-0 top-0 h-full w-[20%] z-30 flex items-center justify-start pl-8 md:pl-16 group cursor-pointer"
          onClick={() => goToIndex(currentIndex - 1)}
        >
          <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            précédent &larr;
          </span>
        </div>

        {/* Contrôles de navigation - Zone droite */}
        <div
          className="absolute right-0 top-0 h-full w-[20%] z-30 flex items-center justify-end pr-8 md:pr-16 group cursor-pointer"
          onClick={() => goToIndex(currentIndex + 1)}
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
  return (
    <div
      className={`w-full h-full relative bg-whiteCustom flex items-center overflow-x-auto snap-x snap-mandatory touch-pan-x scroll-smooth ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-12 px-10">
        {images.map((img, index) => (
          <div
            key={img + index}
            className="flex-shrink-0 flex justify-center items-center snap-center"
          >
            <Image
              src={buildSanityImageUrl(img, { w: 400, q: 60, auto: 'format' })}
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
      </div>
    </div>
  );
}

// Composant pour le carrousel d'images vertical (desktop)
function ImageMarquee({ images, onClick }) {
  // On duplique les images pour créer une boucle parfaite
  const allImages = [...images, ...images];

  const trackRef = useRef(null);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!images?.length) return;
    if (images.length < 2) return;

    let controls;
    let rafId;

    const start = () => {
      if (!trackRef.current) return;

      // La hauteur totale = 2x, on boucle sur la moitié
      const halfHeight = trackRef.current.scrollHeight / 2;
      if (!Number.isFinite(halfHeight) || halfHeight <= 0) return;

      if (controls) controls.stop();
      y.set(0);
      controls = animate(y, -halfHeight, {
        ease: 'linear',
        duration: images.length * 8,
        repeat: Infinity,
        repeatType: 'loop',
      });
    };

    // Attendre le layout (images) avant de mesurer
    rafId = window.requestAnimationFrame(start);
    window.addEventListener('resize', start);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', start);
      if (controls) controls.stop();
    };
  }, [images, y]);

  return (
    <aside
      className="hidden md:flex flex-col w-[45%] h-full relative bg-whiteCustom cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-full overflow-hidden relative">
        <motion.div ref={trackRef} className="flex flex-col" style={{ y }}>
          {allImages.map((img, index) => (
            <div
              key={index}
              className="w-full pb-16 flex-shrink-0 flex justify-center items-center"
            >
              <Image
                src={buildSanityImageUrl(img, {
                  w: 400,
                  q: 60,
                  auto: 'format',
                })}
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

export default function GalleryProjetCartel({ project, onClose }) {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fermeture avec la touche Echap
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleLogoClick = () => {
    onClose(); // Déclenche l'animation de sortie

    // Après un délai pour laisser l'animation se jouer, on navigue et on lance l'intro
    setTimeout(() => {
      emitEvent(EVENTS.INTRO_SHOW);
      router.push('/');
    }, 800); // Délai légèrement inférieur à la durée de l'animation (1s)
  };
  if (!project) return null;

  // Placeholder pour la description
  const description =
    project.description ||
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl. Vestibulum congue lacinia mi volutpat bibendum. Proin vitae odio est. Vivamus tempus pretium commodo. Nulla facilisi.

Nam dui metus, interdum vitae lobortis vel, viverra consequat neque. Praesent sagittis aliquet posuere. Aenean suscipit, mi quis viverra pulvinar, purus nulla placerat mi, quis mollis lectus ipsum vitae velit. Sed vehicula est in lobortis tincidunt.`;

  const paragraphs = description.split('\n\n');

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
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
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
            <ImageMarqueeHorizontal images={project.images} />
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

GalleryProjetCartel.propTypes = {
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
