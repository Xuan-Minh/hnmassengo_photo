'use client';
import { useTranslations } from 'next-intl';
import TextReveal from '../ui/TextReveal';

export default function HomePresentation() {
  const t = useTranslations();
  return (
    <>
      <section
        className="h-[40vh] flex flex-col items-center justify-center bg-whiteCustom px-6 lg:px-8"
        aria-label="Section de présentation"
      >
        <TextReveal
          text={t('presentation.line1')}
          className="text-lg lg:text-2xl xl:text-3xl text-center font-playfair italic mb-3 lg:mb-4 text-blackCustom  max-w-[90vw] lg:max-w-none"
        />
        <TextReveal
          delay={0.7}
          text={t('presentation.line2')}
          className="text-lg lg:text-2xl xl:text-3xl text-left font-playfair italic mb-3 lg:mb-4 text-blackCustom self-start pl-[5vw] lg:pl-[10vw] max-w-[90vw] lg:max-w-none"
        />
        <TextReveal
          delay={1}
          text={t('presentation.line3')}
          className="text-lg lg:text-2xl xl:text-3xl text-center font-playfair italic mb-3 lg:mb-4 text-blackCustom self-center max-w-[90vw] lg:max-w-none"
        />
      </section>
    </>
  );
}
