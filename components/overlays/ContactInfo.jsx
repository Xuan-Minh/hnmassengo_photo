'use client';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SITE_CONFIG } from '../../lib/constants';
import NewsletterSignup from '../ui/NewsletterSignup';
import AnimatedUnderlineLink from '../ui/AnimatedUnderlineLink';
import LegalOverlay from './LegalOverlay';
import { useState } from 'react';

export default function ContactInfo({ onOpenLegal }) {
  const [legalOpen, setLegalOpen] = useState(false);
  const handleOpenLegal = useCallback(() => setLegalOpen(true), []);
  const handleCloseLegal = useCallback(() => setLegalOpen(false), []);
  const t = useTranslations();
  const contactT = useTranslations('contact');

  const handleLegalClick = useCallback(() => {
    if (typeof onOpenLegal === 'function') {
      onOpenLegal();
      return;
    }
    handleOpenLegal();
  }, [handleOpenLegal, onOpenLegal]);

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
          <button
            type="button"
            onClick={handleLegalClick}
            className="group hover:[--bg-size:100%_1px] inline-block text-whiteCustom transition-colors cursor-pointer"
          >
            <span
              className="font-liberation text-sm md:text-[16px] leading-relaxed inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out"
              style={{ backgroundSize: 'var(--bg-size, 0% 1px)' }}
            >
              {t('legal.link')}
            </span>
          </button>
        </p>

        <LegalOverlay open={legalOpen} onClose={handleCloseLegal} />
      </div>
    </div>
  );
}
