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
  const loadedSrcsRef = useRef(new Set());
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);

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

  useEffect(() => {
    if (!images.length) return;
    const id = setInterval(() => {
      // Calcule la prochaine position mais ne l'applique pas encore.
      // Elle sera appliquée dans onExitComplete, entre le fade-out et le fade-in.
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
    return () => clearInterval(id);
  }, [images, interval, isNarrowLayout]);

  const normalizeImageSrc = value => {
    if (typeof value !== 'string') return '';
    const raw = value.trim();
    if (!raw) return '';

    // URL absolue (ex: Sanity CDN)
    if (/^https?:\/\//i.test(raw)) {
      // Nettoie les paramètres Sanity (w, q, auto=format) pour éviter les conflits avec Next.js Image
      // Next.js ajoutera ses propres paramètres via quality={38} et sizes
      return raw.split('?')[0]; // Garder simplement l'URL de base
    }

    // Normalise les chemins "public"
    const withoutLeading = raw.replace(/^\/+/, '');

    // Cas: "home/home1.webp" -> "/home/home1.webp"
    if (withoutLeading.startsWith('home/')) return `/${withoutLeading}`;

    // Cas: "home1.webp" -> "/home/home1.webp"
    if (/^home\d+\.(?:avif|webp|png|jpe?g)$/i.test(withoutLeading)) {
      return `/home/${withoutLeading}`;
    }

    // Déjà un chemin absolu ("/something")
    if (raw.startsWith('/')) return raw;

    // Fallback: force un chemin absolu pour éviter les résolutions relatives (ex: /fr/...)
    return `/${withoutLeading}`;
  };

  const current = images[index];

  const imgSrc = normalizeImageSrc(current);

  // Au premier affichage (et à chaque changement), on évite un "pop" en faisant
  // dépendre l'opacité du vrai état de chargement de l'image.
  useEffect(() => {
    if (!imgSrc) return;
    setIsCurrentLoaded(loadedSrcsRef.current.has(imgSrc));
  }, [imgSrc]);

  // Précharge l'image suivante pour que la transition soit déjà chaude.
  useEffect(() => {
    if (!images.length) return;
    if (typeof window === 'undefined') return;
    if (!imgSrc) return;

    const next = normalizeImageSrc(images[(index + 1) % images.length]);
    if (!next || loadedSrcsRef.current.has(next)) return;

    const img = new window.Image();
    img.src = next;
    if (typeof img.decode === 'function') {
      img
        .decode()
        .then(() => loadedSrcsRef.current.add(next))
        .catch(() => {
          // ignore
        });
    } else {
      img.onload = () => loadedSrcsRef.current.add(next);
    }
  }, [images, index, imgSrc]);

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
        {!isCurrentLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 animate-pulse" />
        )}
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
            initial={index === 0 ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: index === 0 ? 0 : 0.8, ease: 'easeInOut' }}
          >
            <Image
              src={imgSrc}
              alt="Han-Noah profile illustration"
              fill
              sizes="(max-width: 1024px) 40vh, 55vh"
              className="object-contain"
              priority
              fetchPriority="high"
              quality={38}
              onLoad={() => {
                loadedSrcsRef.current.add(imgSrc);
                setIsCurrentLoaded(true);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
