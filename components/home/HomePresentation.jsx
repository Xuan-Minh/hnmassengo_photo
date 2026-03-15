'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import TextReveal from '../ui/TextReveal';
import client from '../../lib/sanity.client';

function localizeField(value, locale, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.fr || value?.en || value?.de || fallback;
}

export default function HomePresentation() {
  const t = useTranslations();
  const { locale = 'fr' } = useParams();
  const [sanityContent, setSanityContent] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPresentation = async () => {
      try {
        const data = await client.fetch(
          'coalesce(*[_type == "homePresentation" && _id in ["homePresentation", "drafts.homePresentation"]][0]{ line1, line2, line3 }, *[_type == "homePresentation"] | order(_updatedAt desc)[0]{ line1, line2, line3 })'
        );
        if (!cancelled) setSanityContent(data || null);
      } catch {
        if (!cancelled) setSanityContent(null);
      }
    };

    fetchPresentation();

    return () => {
      cancelled = true;
    };
  }, []);

  const lines = useMemo(
    () => ({
      line1: localizeField(
        sanityContent?.line1,
        locale,
        t('presentation.line1')
      ),
      line2: localizeField(
        sanityContent?.line2,
        locale,
        t('presentation.line2')
      ),
      line3: localizeField(
        sanityContent?.line3,
        locale,
        t('presentation.line3')
      ),
    }),
    [locale, sanityContent, t]
  );

  return (
    <section
      className="h-[40vh] flex flex-col items-center justify-center bg-background px-6 lg:px-8"
      aria-label={t('presentation.ariaLabel')}
    >
      <TextReveal
        text={lines.line1}
        className="text-lg lg:text-2xl xl:text-3xl text-center font-playfair italic mb-3 lg:mb-4 text-blackCustom  max-w-[90vw] lg:max-w-none"
      />
      <TextReveal
        delay={0.7}
        text={lines.line2}
        className="text-lg lg:text-2xl xl:text-3xl text-left font-playfair italic mb-3 lg:mb-4 text-blackCustom self-start pl-[5vw] lg:pl-[10vw] max-w-[90vw] lg:max-w-none"
      />
      <TextReveal
        delay={1}
        text={lines.line3}
        className="text-lg lg:text-2xl xl:text-3xl text-center font-playfair italic mb-3 lg:mb-4 text-blackCustom self-center max-w-[90vw] lg:max-w-none"
      />
    </section>
  );
}
