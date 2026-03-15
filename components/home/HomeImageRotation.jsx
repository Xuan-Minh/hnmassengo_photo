'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { TIMING } from '../../lib/constants';
import { isSanityCdnUrl } from '../../lib/imageUtils';

// Composant simple de rotation d'images. Passer un tableau de noms de fichiers relatifs à /public/home.
// position: "center" | "left" | "right"
export default function HomeImageRotation({
  images = [],
  interval = TIMING.IMAGE_ROTATION_INTERVAL,
  position = 'left',
}) {
  const [index, setIndex] = useState(0);
  const [transitionStep, setTransitionStep] = useState(0);
  const [imgPosition, setImgPosition] = useState(position);
  const lastPosition = useRef(position);
  const pendingPosition = useRef(null);
  const [isNarrowLayout, setIsNarrowLayout] = useState(false);

  const [loadedImages, setLoadedImages] = useState({});

  // Détection du layout (mobile + tablette)
  useEffect(() => {
    const checkMobile = () => {
      // En dessous de lg (1024px), on garde une mise en page "stack" sans décalage
      // pour éviter que l'image empiète visuellement sur le texte.
      setIsNarrowLayout(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const normalizeImageSrc = value => {
    if (typeof value !== 'string') return '';
    const raw = value.trim();
    if (!raw) return '';

    // URL absolue (ex: Sanity CDN) — conserver les params CDN
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    // Normalise les chemins "public"
    const withoutLeading = raw.replace(/^\/+/, '');
    if (withoutLeading.startsWith('home/')) return `/${withoutLeading}`;
    if (/^home\d+\.(?:avif|webp|png|jpe?g)$/i.test(withoutLeading)) {
      return `/home/${withoutLeading}`;
    }
    if (raw.startsWith('/')) return raw;

    return `/${withoutLeading}`;
  };

  const normalizedImages = (Array.isArray(images) ? images : [])
    .map(normalizeImageSrc)
    .filter(Boolean);

  const current = normalizedImages[index];
  const imgSrc = current || '';

  // L'image courante est considérée comme chargée si elle est dans notre dictionnaire
  const isCurrentLoaded = loadedImages[imgSrc] || false;

  // Sécurité : marquer l'image comme chargée après un délai si onLoad ne se déclenche pas
  useEffect(() => {
    if (isCurrentLoaded || !imgSrc) return;
    const timeout = setTimeout(() => {
      setLoadedImages(prev => ({ ...prev, [imgSrc]: true }));
    }, 2000); // 2 secondes max d'attente
    return () => clearTimeout(timeout);
  }, [imgSrc, isCurrentLoaded]);

  useEffect(() => {
    if (normalizedImages.length === 0) {
      if (index !== 0) setIndex(0);
      return;
    }

    if (index >= normalizedImages.length) {
      setIndex(0);
    }
  }, [index, normalizedImages.length]);

  useEffect(() => {
    if (normalizedImages.length <= 1) return;

    const id = setTimeout(() => {
      if (isNarrowLayout) {
        pendingPosition.current = 'center';
        lastPosition.current = 'center';
      } else {
        const positions = ['left', 'center'];
        let nextPos = lastPosition.current;
        let tries = 0;
        while (nextPos === lastPosition.current && tries < 10) {
          nextPos = positions[Math.floor(Math.random() * positions.length)];
          tries++;
        }
        pendingPosition.current = nextPos;
        lastPosition.current = nextPos;
      }
      setTransitionStep(prev => prev + 1);
      setIndex(prev => (prev + 1) % normalizedImages.length);
    }, interval);
    return () => clearTimeout(id);
  }, [normalizedImages.length, interval, isNarrowLayout, index]);

  if (!imgSrc) {
    return null;
  }

  // Positionnement horizontal dynamique (changement instantané, sans slide)
  let justify = 'justify-center';
  let marginClass = '';

  if (isNarrowLayout) {
    justify = 'justify-center';
    marginClass = '';
  } else {
    if (imgPosition === 'left') {
      justify = 'justify-start';
      marginClass = 'lg:pl-[280px]';
    }
    if (imgPosition === 'center') {
      marginClass = 'lg:pl-[150px]';
    }
  }

  return (
    <div className={`flex ${justify} w-full ${marginClass}`}>
      <div className="relative h-[40vh] md:h-[42vh] lg:h-[50vh] aspect-[3/4] overflow-hidden mx-auto lg:mx-0">
        {/* Placeholder visible pendant le chargement */}
        {!isCurrentLoaded && <div className="absolute inset-0 animate-pulse" />}
        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            // Applique le changement de position entre le fade-out et le fade-in
            if (pendingPosition.current !== null) {
              setImgPosition(pendingPosition.current);
              pendingPosition.current = null;
            }
          }}
        >
          <motion.div
            key={`${imgSrc}-${transitionStep}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isCurrentLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <Image
              src={imgSrc}
              alt="Han-Noah profile illustration"
              fill
              sizes="(max-width: 1024px) 80vw, 40vw"
              className="object-contain"
              priority
              fetchPriority="high"
              unoptimized={isSanityCdnUrl(imgSrc)}
              quality={50}
              onLoad={() => {
                // On ajoute l'image au dictionnaire sans écraser les précédentes
                setLoadedImages(prev => ({ ...prev, [imgSrc]: true }));
              }}
              onError={() => {
                // En cas d'erreur, on la marque comme chargée pour ne pas bloquer la rotation
                setLoadedImages(prev => ({ ...prev, [imgSrc]: true }));
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
