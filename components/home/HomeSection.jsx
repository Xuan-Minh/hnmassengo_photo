'use client';
import { useTranslations } from 'next-intl';
import HomeImageRotation from './HomeImageRotation';
import TextScramble from '../ui/TextScramble';
import Logo from '../ui/Logo';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useFadeInOnScreen, useSanityImages } from '../../lib/hooks';
import { HOME_FALLBACK_IMAGES } from '../../lib/constants';

export default function HomeSection() {
  const t = useTranslations();
  const { locale } = useParams();

  // En production (Netlify), utiliser une qualité optimisée (35) et width très réduit (380)
  // pour améliorer LCP au maximum sans trop sacrifier la qualité
  const isProduction = process.env.NODE_ENV === 'production';
  const homeImages = useSanityImages('homeSectionImage', HOME_FALLBACK_IMAGES, {
    width: isProduction ? 380 : 800,
    quality: isProduction ? 35 : 50,
    dpr: 1, // Désactiver les versions haute-DPI pour réduire taille
  });
  const [ref, visible] = useFadeInOnScreen(locale);

  return (
    <motion.section
      ref={ref}
      id="home"
      className="relative h-screen snap-start bg-background overflow-hidden flex flex-col lg:block justify-around"
      aria-label="Hero"
      initial={false}
      animate={visible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      suppressHydrationWarning
    >
      <Logo />
      {/* Bloc rotation image - centré et plus grand sur mobile, positionnable sur desktop */}
      <div className="flex items-center justify-center pt-20 pb-8 lg:absolute lg:top-[40%] lg:left-0 lg:-translate-y-1/2 w-full lg:w-full z-20 pointer-events-none lg:pt-0 lg:pb-0">
        <HomeImageRotation images={homeImages} />
      </div>

      {/* Bloc texte - juste en dessous de l'image sur mobile/tablet, bas gauche sur desktop */}
      <div className="px-4 pb-4 lg:absolute lg:bottom-16 lg:left-16 lg:right-auto lg:px-0 lg:pb-0">
        <p className="text-xl text-blackCustom lg:text-2xl xl:text-[30px] font-playfair tracking-[-0.05em]">
          {t('home.title')}
        </p>
        <div className="mt-2 lg:mt-4">
          <TextScramble
            text="Han-Noah"
            className=" text-blackCustom text-[52px] lg:text-[64px] xl:text-[80px] leading-none font-playfair italic tracking-[-0.05em] block"
            delay={500}
          />
          <TextScramble
            text="MASSENGO"
            className=" text-blackCustom mt-0 text-[56px] lg:text-[72px] xl:text-[88px] leading-none font-lexend font-semibold tracking-tight block"
            delay={1000}
          />
        </div>
      </div>

      {/* Rôle - en dessous du nom sur mobile/tablet, à droite sur desktop */}
      <div className="px-4 pb-8 lg:absolute lg:bottom-20 lg:right-[20%] lg:px-0 lg:pb-0 flex justify-end">
        <p className="text-xl lg:text-[28px] xl:text-[36px] text-blackCustom/20 font-playfair italic tracking-[-0.05em]">
          {t('home.role')}
        </p>
      </div>
    </motion.section>
  );
}
