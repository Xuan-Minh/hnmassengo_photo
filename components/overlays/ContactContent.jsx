'use client';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';

export default function ContactContent({
  idSuffix = '',
  headingId,
  variant: _variant = 'default',
  defaultSubject = '',
  onOpenLegal,
}) {
  const t = useTranslations('contact');
  const handleCopyLink = useCallback(() => {
    try {
      const mail = 'contact@hnmassengo.com';
      if (mail && navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(mail);
        alert('Contact email copied to clipboard');
      } else if (mail) {
        window.prompt('Copy this email', mail);
      }
    } catch {
      alert('Unable to copy link');
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 xl:gap-14">
      <div className="lg:col-span-7">
        <button
          type="button"
          id={headingId}
          onClick={handleCopyLink}
          onKeyPress={e => {
            if (e.key === 'Enter') handleCopyLink();
          }}
          className="cursor-pointer text-whiteCustom/90 hover:text-whiteCustom transition-colors font-liberation italic text-[32px] sm:text-[36px] md:text-[42px] lg:text-[46px] xl:text-[48px] leading-none mb-6 md:mb-8"
        >
          {t('title')}
        </button>
        <ContactForm idSuffix={idSuffix} defaultSubject={defaultSubject} />
      </div>

      <div className="lg:col-span-5 md:mt-6 lg:mt-0">
        <ContactInfo onOpenLegal={onOpenLegal} />
      </div>
    </div>
  );
}
