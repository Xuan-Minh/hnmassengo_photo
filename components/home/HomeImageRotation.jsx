'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { TIMING } from '../../lib/constants';

// Composant simple de rotation d'images. Passer un tableau de noms de fichiers relatifs à /public/home.
// position: "center" | "left" | "right"
export default function HomeImageRotation({
  images = [],
  interval = TIMING.IMAGE_ROTATION_INTERVAL,
  position = 'left',
}) {
  const [index, setIndex] = useState(0);
  const [imgPosition, setImgPosition] = useState(position);
  const lastPosition = useRef(position);
  const pendingPosition = useRef(null);
  const [isNarrowLayout, setIsNarrowLayout] = useState(false);

  // CORRECTION : Un dictionnaire pour mémoriser définitivement les images chargées
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

    // URL absolue (ex: Sanity CDN)
    if (/^https?:\/\//i.test(raw)) {
      // Nettoie les paramètres Sanity pour éviter les conflits avec Next.js Image
      return raw.split('?')[0];
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

  const current = images[index];
  const imgSrc = normalizeImageSrc(current);

  // L'image courante est considérée comme chargée si elle est dans notre dictionnaire
  const isCurrentLoaded = loadedImages[imgSrc] || false;

  // Sécurité : marquer l'image comme chargée après un délai si onLoad ne se déclenche pas
  useEffect(() => {
    if (isCurrentLoaded || !imgSrc) return;
    const timeout = setTimeout(() => {
      console.log('[HomeImageRotation] Timeout - marking as loaded:', imgSrc);
      setLoadedImages(prev => ({ ...prev, [imgSrc]: true }));
    }, 2000); // 2 secondes max d'attente
    return () => clearTimeout(timeout);
  }, [imgSrc, isCurrentLoaded]);

  // Debug
  useEffect(() => {
    console.log('[HomeImageRotation] State:', {
      imagesCount: images.length,
      index,
      imgSrc,
      isCurrentLoaded,
      loadedImages,
    });
  }, [images.length, index, imgSrc, isCurrentLoaded, loadedImages]);

  useEffect(() => {
    if (!images.length) {
      console.log('[HomeImageRotation] No images');
      return;
    }
    if (!isCurrentLoaded) {
      console.log('[HomeImageRotation] Waiting for image to load');
      return;
    }

    console.log('[HomeImageRotation] Starting rotation timer');
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
      setIndex(prev => (prev + 1) % images.length);
    }, interval);
    return () => clearTimeout(id);
  }, [images, interval, isNarrowLayout, isCurrentLoaded]);

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
            key={imgSrc}
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
