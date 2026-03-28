'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import Logo from '../ui/Logo';
import { useSanityImages } from '../../lib/hooks';
import { HOME_FALLBACK_IMAGES } from '../../lib/constants';
import { isSanityCdnUrl } from '../../lib/imageUtils';
import client from '../../lib/sanity.client';

function localizeField(value, locale, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.fr || value?.en || value?.de || fallback;
}

export default function HomeSection() {
  const { locale = 'fr' } = useParams();
  const t = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const [bioDoc, setBioDoc] = useState(null);
  const [showScrollCta, setShowScrollCta] = useState(true);

  // On garde les images du schema homeSectionImage et on affiche la premiere.
  const isProduction = process.env.NODE_ENV === 'production';
  const homeImages = useSanityImages('homeSectionImage', HOME_FALLBACK_IMAGES, {
    width: isProduction ? 900 : 1200,
    quality: isProduction ? 55 : 70,
    dpr: 1,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchHomeBio = async () => {
      try {
        const data = await client.fetch(
          'coalesce(*[_type == "homeBio" && _id in ["homeBio", "drafts.homeBio"]][0]{ title, bio }, *[_type == "homeBio"] | order(_updatedAt desc)[0]{ title, bio })'
        );
        if (!cancelled) setBioDoc(data || null);
      } catch {
        if (!cancelled) setBioDoc(null);
      }
    };

    fetchHomeBio();

    return () => {
      cancelled = true;
    };
  }, []);

  const heroImage = homeImages[0] || HOME_FALLBACK_IMAGES[0];
  const bioTitle = useMemo(() => {
    const value = localizeField(bioDoc?.title, locale, '');
    return typeof value === 'string' ? value.trim() : '';
  }, [bioDoc, locale]);

  const bioText = useMemo(
    () => localizeField(bioDoc?.bio, locale, t('home.welcome')),
    [bioDoc, locale, t]
  );

  const scrollToWorks = useCallback(() => {
    const root = document.getElementById('scroll-root');
    const worksEl = document.getElementById('works');

    if (root && worksEl) {
      const top =
        root.scrollTop +
        (worksEl.getBoundingClientRect().top -
          root.getBoundingClientRect().top);
      root.scrollTo({ top, behavior: 'smooth' });
      return;
    }

    worksEl?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const root = document.getElementById('scroll-root');
    const homeEl = document.getElementById('home');
    if (!root || !homeEl) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setShowScrollCta(
          entry.isIntersecting && entry.intersectionRatio > 0.45
        );
      },
      { root, threshold: [0, 0.2, 0.45, 0.7, 1] }
    );

    io.observe(homeEl);
    return () => io.disconnect();
  }, []);

  const scrollCtaLabel = useMemo(() => {
    if (locale === 'fr') return 'Descendre vers la section suivante';
    if (locale === 'de') return 'Zur nachsten Sektion scrollen';
    return 'Scroll to next section';
  }, [locale]);

  return (
    <section
      id="home"
      className="relative min-h-screen snap-start bg-background overflow-hidden"
      aria-label="Home Bio"
    >
      <Logo />

      <div className="mx-auto flex w-full max-w-[1200px] 2xl:max-w-[2000px] flex-col gap-10 px-6 pt-24 2xl:mt-10 pb-12 sm:px-8 lg:flex-row lg:items-center lg:gap-14 lg:px-12 lg:pt-32 lg:pb-16 xl:px-16">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[550px] 2xl:max-w-[700px] lg:mx-0 lg:w-[42%] 2xl:w-[35%]">
          <Image
            src={heroImage}
            alt="Han-Noah portrait"
            fill
            sizes="(max-width: 1024px) 92vw, 42vw"
            className="object-cover"
            priority
            unoptimized={isSanityCdnUrl(heroImage)}
            quality={70}
          />
        </div>

        <div className="w-full lg:w-[58%]">
          {bioTitle ? (
            <h2 className="mb-5 font-playfair text-[40px] leading-[1.05] text-blackCustom sm:text-[46px] lg:text-[54px] 2xl:text-[62px]">
              {bioTitle}
            </h2>
          ) : null}
          <p className="whitespace-pre-line font-playfair italic leading-[1.3] text-blackCustom text-[16px] xl:text-[18px] 2xl:text-[28px]">
            {bioText}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToWorks}
        aria-label={scrollCtaLabel}
        title={scrollCtaLabel}
        className={[
          'fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-opacity duration-300',
          showScrollCta
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <motion.span
          className="block"
          animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 1.8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }
          }
        >
          <svg
            width="52"
            height="32"
            viewBox="0 0 52 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blackCustom"
            aria-hidden="true"
          >
            <path
              d="M2 2L26 27L50 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>
    </section>
  );
}
