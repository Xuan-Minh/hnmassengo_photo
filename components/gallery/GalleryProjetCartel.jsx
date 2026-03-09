'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';
// IMPORT MODIFIÉ : On importe AnimatePresence normalement pour activer le SSR
import {
  motion,
  animate,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';
import { useTranslations } from 'next-intl';

import { buildSanityImageUrl } from '../../lib/imageUtils';
import { getOptimizedImageParams } from '../../lib/hooks';

// Composant CustomLightbox
function CustomLightbox({ open, onClose, images, project }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);
  const [hasCurrentError, setHasCurrentError] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const decodedSrcsRef = useRef(new Set());

  const getDisplaySrcForIndex = useCallback(
    idx => {
      const raw = images?.[idx];
      return buildSanityImageUrl(raw, {
        ...getOptimizedImageParams('gallery'),
        auto: 'format',
      });
    },
    [images]
  );

  const goToIndex = useCallback(
    nextIndex => {
      if (!images?.length) return;
      const safeIndex =
        ((nextIndex % images.length) + images.length) % images.length;
      const nextSrc = getDisplaySrcForIndex(safeIndex);

      setHasCurrentError(false);
      setIsCurrentLoaded(decodedSrcsRef.current.has(nextSrc));
      setCurrentIndex(safeIndex);
    },
    [images, getDisplaySrcForIndex]
  );

  const currentDisplaySrc = useMemo(() => {
    const raw = images?.[currentIndex];
    return buildSanityImageUrl(raw, {
      ...getOptimizedImageParams('gallery'),
      auto: 'format',
    });
  }, [images, currentIndex]);

  useEffect(() => {
    if (open) {
      goToIndex(0);
    }
  }, [open, goToIndex]);

  useEffect(() => {
    if (!open) return;
    setHasCurrentError(false);
    setIsCurrentLoaded(decodedSrcsRef.current.has(currentDisplaySrc));
  }, [open, currentIndex, currentDisplaySrc]);

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

      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(markReady)
          .catch(() => {});
      } else {
        img.onload = markReady;
      }
    };

    preload(currentDisplaySrc);

    if (images.length > 1) {
      // Précharger les 3 images suivantes pour une navigation fluide
      for (let i = 1; i <= 3; i++) {
        const nextIndex = (currentIndex + i) % images.length;
        const nextSrc = buildSanityImageUrl(images[nextIndex], {
          ...getOptimizedImageParams('gallery'),
          auto: 'format',
        });
        preload(nextSrc);
      }

      // Précharger l'image précédente
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      const prevSrc = buildSanityImageUrl(images[prevIndex], {
        ...getOptimizedImageParams('gallery'),
        auto: 'format',
      });
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

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const handleTouchStart = e => {
      setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = e => {
      if (touchStart === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToIndex(currentIndex + 1);
        } else {
          goToIndex(currentIndex - 1);
        }
      }
      setTouchStart(null);
    };

    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, false);
      window.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [open, touchStart, currentIndex, goToIndex]);

  if (!open) return null;

  return (
    <motion.div
      // MODIFICATION : Utilisation de h-[100dvh] pour garantir que le footer reste visible
      className="fixed inset-0 h-[100dvh] w-full z-[60] bg-blackCustom text-[#e5e5e5] font-playfair flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* En-tête (mobile uniquement) */}
      <div className="absolute top-8 landscape:top-2 left-8 z-40 md:hidden">
        <button
          onClick={onClose}
          className="text-lg hover:text-white transition-colors"
        >
          back
        </button>
      </div>

      {/* Contenu principal (MOBILE) */}
      <div className="flex-1 flex flex-col w-full relative bg-blackCustom md:hidden min-h-0">
        <div
          className="absolute left-0 top-14 bottom-12 w-[20%] z-30"
          onClick={() => goToIndex(currentIndex - 1)}
        />
        <div
          className="absolute right-0 top-14 bottom-12 w-[20%] z-30"
          onClick={() => goToIndex(currentIndex + 1)}
        />

        <div
          className="flex-1 min-h-0 flex items-center justify-center px-4 pt-14 landscape:pt-2 landscape:pb-1"
          style={{
            paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
          }}
        >
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
          >
            <Image
              src={currentDisplaySrc}
              alt={`${project.name} - Image ${currentIndex + 1} of ${images.length}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              sizes="100vw"
              unoptimized
              fetchPriority="high"
              decoding="async"
              onError={() => setHasCurrentError(true)}
              onLoad={() => setIsCurrentLoaded(true)}
              priority
            />
          </motion.div>
        </div>

        <div
          className="flex-shrink-0 text-center italic text-sm py-3 landscape:py-1"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 12px) + 14px)',
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>

        {!isCurrentLoaded && !hasCurrentError && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        {hasCurrentError && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            image unavailable
          </div>
        )}
      </div>

      {/* Main Content (DESKTOP) */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 w-full pt-16 pr-16 pl-16">
        <div>
          <button
            onClick={onClose}
            className="font-playfair text-lg hover:text-white transition-colors"
          >
            back
          </button>
        </div>
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {/* Image précédente */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none">
            <Image
              src={buildSanityImageUrl(
                images[(currentIndex - 1 + images.length) % images.length],
                { w: 600, q: 40, auto: 'format' }
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
                    image unavailable
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
                  onLoad={() => setIsCurrentLoaded(true)}
                  priority
                />
              </div>
            </motion.div>
          </div>

          {/* Image suivante */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none">
            <Image
              src={buildSanityImageUrl(
                images[(currentIndex + 1) % images.length],
                {
                  w: 600,
                  q: 40,
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

          <div
            className="absolute left-0 top-0 h-full w-[20%] z-30 flex items-center justify-start pl-8 md:pl-0 group cursor-pointer"
            onClick={() => goToIndex(currentIndex - 1)}
          >
            <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              previous
            </span>
          </div>

          <div
            className="absolute right-0 top-0 h-full w-[20%] z-30 flex items-center justify-end pr-8 md:pr-0 group cursor-pointer"
            onClick={() => goToIndex(currentIndex + 1)}
          >
            <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              next
            </span>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <footer className="hidden md:flex w-full flex-shrink-0 border-t border-whiteCustom/20 px-8 md:px-16 py-6 items-center justify-between mt-auto">
        <div className="text-xl italic">{project.coords}</div>
        <div className="text-xl">{project.name}</div>
      </footer>
    </motion.div>
  );
}

// Composant pour le carrousel d'images horizontal (mobile)
function ImageMarqueeHorizontal({ images, onClick }) {
  return (
    <div
      className={`w-full h-full relative bg-background flex items-center overflow-x-auto snap-x snap-mandatory touch-pan-x scroll-smooth ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-center gap-12 px-10">
        {images.map((img, index) => (
          <div
            key={img + index}
            className="flex-shrink-0 flex justify-center items-center snap-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={onClick}
          >
            <Image
              src={buildSanityImageUrl(img, { w: 400, q: 40, auto: 'format' })}
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
      className="hidden md:flex flex-col w-[45%] h-full relative bg-background cursor-pointer"
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
                  w: 800,
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
  const t = useTranslations('gallery');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape' && !lightboxOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, lightboxOpen]);

  if (!project) return null;

  const description = project.description || t('project.defaultDescription');
  const paragraphs = description.split('\n\n');

  return (
    <motion.div
      key="gallery-cartel-wrapper"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      ></motion.div>
      <motion.section
        className="fixed inset-0 h-[100dvh] w-full bg-background z-50 flex flex-col md:flex-row shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="project-title"
      >
        {/* Version Mobile */}
        <div className="md:hidden w-full h-full flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-6 left-6 z-10 font-playfair text-lg text-accent hover:text-blackCustom transition-colors"
            aria-label={t('project.closeOverlayLabel')}
          >
            back
          </button>

          <div className="h-[50vh] flex-shrink-0 flex items-center">
            <ImageMarqueeHorizontal
              images={project.images}
              onClick={() => setLightboxOpen(true)}
            />
          </div>

          <div className="border-t border-blackCustom/20 flex-shrink-0"></div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="font-playfair text-lg italic text-blackCustom mb-4">
              {project.coords}
            </div>
            <h2
              id="project-title"
              className="text-3xl font-playfair italic mb-6"
            >
              {project.name}
            </h2>
            <div className="font-playfair text-base leading-relaxed space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Version Desktop */}
        <main className="hidden md:flex w-[55%] h-full border-r border-blackCustom p-16 flex-col justify-between overflow-y-auto">
          <div>
            <button
              onClick={onClose}
              className="font-playfair text-lg text-accent hover:text-blackCustom transition-colors"
              aria-label={t('project.closeOverlayLabel')}
            >
              back
            </button>
          </div>

          <section className="flex flex-col items-start justify-center my-8">
            <h2 id="project-title" className="text-5xl font-playfair mb-8">
              {project.name}
            </h2>
            <div className="font-playfair text-lg max-w-2xl leading-relaxed space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <div className="font-playfair text-xl italic text-blackCustom flex-shrink-0">
            {project.coords}
          </div>
        </main>

        {/* Colonne de droite : Carrousel (desktop uniquement) */}
        <ImageMarquee
          images={project.images}
          onClick={() => setLightboxOpen(true)}
        />
      </motion.section>

      {/* Lightbox */}
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
    </motion.div>
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
