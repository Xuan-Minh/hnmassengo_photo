'use client';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { SITE_CONFIG } from '../../lib/constants';
import { routing } from '../../src/i18n/routing';
import NewsletterSignup from '../ui/NewsletterSignup';
import AnimatedUnderlineLink from '../ui/AnimatedUnderlineLink';

export default function ContactInfo({ onOpenLegal }) {
  const t = useTranslations();
  const contactT = useTranslations('contact');
  const { locale } = useParams();

  const handleLegalClick = useCallback(
    e => {
      if (typeof onOpenLegal !== 'function') return;
      e.preventDefault();
      onOpenLegal();
    },
    [onOpenLegal]
  );

  return (
    <div className="text-whiteCustom/90 flex flex-col h-full">
      <h3 className="font-liberation italic text-xl md:text-2xl lg:text-3xl leading-tight mb-6 md:mb-8">
        <a
          href={SITE_CONFIG.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-whiteCustom transition-colors"
        >
          Instagram
        </a>
        ,{' '}
        <a
          href={`mailto:${SITE_CONFIG.email}`}
          className="hover:text-whiteCustom transition-colors"
        >
          Mail
        </a>
      </h3>

      <div className="space-y-4 md:space-y-6">
        <NewsletterSignup className="" />
        <div className="font-liberation leading-relaxed">
          <p className="text-3xl italic">© STUDIO 42 - 2026</p>
          <p>14 Rue de Marignan, 75008 PARIS. FRANCE</p>
        </div>
        <div className="font-liberation leading-relaxed space-y-4">
          <p className="font-liberation text-sm md:text-[16px] leading-relaxed">
            {contactT('info.copyright', { author: SITE_CONFIG.author })}
          </p>
          <AnimatedUnderlineLink
            href="mailto:naux.pro@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {contactT('info.credits', { developer: SITE_CONFIG.developer })}
          </AnimatedUnderlineLink>
        </div>

        <p className="font-liberation text-sm md:text-[16px] leading-relaxed flex items-center gap-4">
          <AnimatedUnderlineLink
            href={`/${locale || routing.defaultLocale}/legal`}
            onClick={handleLegalClick}
            className="cursor-pointer"
          >
            {t('legal.link')}
          </AnimatedUnderlineLink>
        </p>
      </div>
    </div>
  );
}
