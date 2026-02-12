'use client';
import { useTranslations } from 'next-intl';
import { HomeImageRotation, TextScramble, Logo } from './';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import client from '../lib/sanity.client';

// Hook utilitaire pour fade-in à la première apparition
function useFadeInOnScreen(resetKey) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [resetKey]);
  return [ref, visible];
}

// Fallback local si Sanity ne retourne rien
const fallbackImageFiles = [
  '/home/home1.webp',
  '/home/home2.webp',
  '/home/home3.webp',
  '/home/home4.webp',
];

export default function HomeSection() {
  const t = useTranslations();
  const { locale } = useParams();

  const [homeImages, setHomeImages] = useState(() => {
    // Par défaut: on utilise Sanity. Le fallback local est optionnel.
    return process.env.NEXT_PUBLIC_USE_LOCAL_HOME_FALLBACK === 'true'
      ? fallbackImageFiles
      : [];
  });

  const [ref, visible] = useFadeInOnScreen(locale);

  useEffect(() => {
    let cancelled = false;
    const fetchHomeImages = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "homeSectionImage"] | order(order asc) { image{asset->{url}}, order }`
        );

        const urls = (data || [])
          .map(d => d?.image?.asset?.url)
          .filter(Boolean);

        if (!cancelled && urls.length > 0) setHomeImages(urls);
      } catch {
        // On conserve l'état actuel (fallback optionnel uniquement)
      }
    };
    fetchHomeImages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.section
      ref={ref}
      id="home"
      className="relative h-screen snap-start bg-whiteCustom overflow-hidden flex flex-col lg:block justify-around"
      aria-label="Hero"
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      <Logo />
      {/* Bloc rotation image - centré et plus grand sur mobile, positionnable sur desktop */}
      <div className="flex items-center justify-center pt-20 pb-8 lg:absolute lg:top-[40%] lg:left-0 lg:-translate-y-1/2 w-full lg:w-full z-20 pointer-events-none lg:pt-0 lg:pb-0">
        <HomeImageRotation images={homeImages} />
      </div>

      {/* Bloc texte - juste en dessous de l'image sur mobile/tablet, bas gauche sur desktop */}
      <div className="px-4 pb-4 lg:absolute lg:bottom-16 lg:left-16 lg:right-auto lg:px-0 lg:pb-0">
        <p className="text-xl lg:text-2xl xl:text-[30px] font-playfair text-neutral-300 tracking-[-0.05em]">
          {t('home.title')}
        </p>
        <div className="mt-2 lg:mt-4">
          <TextScramble
            text="Han-Noah"
            className="text-[52px] lg:text-[64px] xl:text-[80px] leading-none font-playfair italic tracking-[-0.05em] block"
            delay={500}
          />
          <TextScramble
            text="MASSENGO"
            className="mt-0 text-[56px] lg:text-[72px] xl:text-[88px] leading-none font-lexend font-semibold tracking-tight block"
            delay={1000}
          />
        </div>
      </div>

      {/* Rôle - en dessous du nom sur mobile/tablet, à droite sur desktop */}
      <div className="px-4 pb-8 lg:absolute lg:bottom-20 lg:right-[20%] lg:px-0 lg:pb-0 flex justify-end">
        <p className="text-xl lg:text-[28px] xl:text-[36px] font-playfair italic text-neutral-300 tracking-[-0.05em]">
          {t('home.role')}
        </p>
      </div>
    </motion.section>
  );
}
