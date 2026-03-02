'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { SITE_CONFIG } from '../../lib/constants';
import { EVENTS, addEventHandler } from '../../lib/events';
import { useParams } from 'next/navigation';
import NewsletterSignup from '../ui/NewsletterSignup';
import LegalOverlay from './LegalOverlay';

// Composant pour le formulaire de contact réutilisable
function ContactForm({ idSuffix = '', onSubmitSuccess, defaultSubject = '' }) {
  const t = useTranslations('contact');
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);
  const { locale } = useParams();

  const handleSubmit = async e => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      newsletterOptIn: formData.get('newsletterOptIn') === 'on',
      locale,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Validation API réussie, on déclenche maintenant l'envoi réel du mail via Netlify Forms
        const encodedBody = new URLSearchParams(formData);
        encodedBody.set('form-name', 'contact'); // Sécurité absolue pour Netlify

        await fetch('/contact.html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodedBody.toString(),
        });
        setShowSuccess(true);
        // Réinitialiser le formulaire
        form.reset();
        if (onSubmitSuccess) onSubmitSuccess();
        // Redirection après 2 secondes (laisse le temps de voir le message)
        setTimeout(() => {
          window.location.href = '/success.html';
        }, 2000);
      } else {
        const details = Array.isArray(result?.errors)
          ? `\n\n${result.errors.join('\n')}`
          : '';
        alert((result?.message || t('form.validationError')) + details);
      }
    } catch {
      alert(t('form.submissionError'));
    }
  };

  return (
    <form
      ref={formRef}
      className="space-y-4 md:space-y-6"
      name="contact"
      aria-label="Contact form"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="bot-field" style={{ display: 'none' }} />
      <input type="hidden" name="locale" value={locale || ''} />

      {showSuccess && (
        <div className="bg-green-600/20 border border-green-500 text-green-300 p-3 md:p-4 rounded mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <span className="text-lg md:text-xl">✅</span>
            <div>
              <h3 className="font-semibold text-sm md:text-base">
                {t('form.success.title')}
              </h3>
              <p className="text-xs md:text-sm opacity-90">
                {t('form.success.message')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor={`fullName${idSuffix}`}
          className="block text-whiteCustom/90 font-playfair text-sm mb-2"
        >
          {t('form.fullName')} *
        </label>
        <input
          id={`fullName${idSuffix}`}
          name="fullName"
          type="text"
          required
          minLength={2}
          className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm md:text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label
            htmlFor={`email${idSuffix}`}
            className="block text-whiteCustom/90 font-playfair text-sm mb-2"
          >
            {t('form.email')} *
          </label>
          <input
            id={`email${idSuffix}`}
            name="email"
            type="email"
            required
            className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm md:text-base"
          />
        </div>
        <div>
          <label
            htmlFor={`subject${idSuffix}`}
            className="block text-whiteCustom/90 font-playfair text-sm mb-2"
          >
            {t('form.subject')} *
          </label>
          <input
            id={`subject${idSuffix}`}
            name="subject"
            type="text"
            required
            maxLength={100}
            defaultValue={defaultSubject}
            className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm md:text-base"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`message${idSuffix}`}
          className="block text-whiteCustom/90 font-playfair text-sm mb-2"
        >
          {t('form.message')} *
        </label>
        <textarea
          id={`message${idSuffix}`}
          name="message"
          rows={5}
          required
          minLength={10}
          className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 resize-y text-sm md:text-base"
        />
      </div>

      <div className="flex items-center justify-between gap-4 w-full">
        <label className="inline-flex items-center gap-2 text-whiteCustom/80 font-playfair text-sm select-none">
          <input
            type="checkbox"
            name="newsletterOptIn"
            className="accent-whiteCustom"
          />
          <span>{t('form.newsletterOptIn')}</span>
        </label>

        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium font-playfair text-whiteCustom/85 hover:text-whiteCustom transition-all duration-300 border border-whiteCustom/60"
        >
          <span>{t('form.send')}</span>
        </button>
      </div>
    </form>
  );
}

// Composant pour les informations de contact
function ContactInfo({ onOpenLegal, onCopyLink }) {
  const t = useTranslations();
  const contactT = useTranslations('contact');

  return (
    <div className="text-whiteCustom/90 flex flex-col h-full">
      {/* Titre aligné avec "Contact" */}
      <h3 className="font-playfair italic text-xl md:text-2xl lg:text-3xl leading-tight mb-6 md:mb-8">
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

      {/* Contenu aligné avec le formulaire */}
      <div className="space-y-4 md:space-y-6">
        <NewsletterSignup className="" />
        <div className="font-playfair leading-relaxed">
          <p className="text-sm md:text-3xl italic">STUDIO 42</p>
          <p>14 Rue de Marignan, 75008 PARIS. FRANCE</p>
        </div>
        <div className="font-playfair leading-relaxed space-y-4">
          <p className="font-playfair text-sm md:text-[16px] leading-relaxed">
            {contactT('info.copyright', { author: SITE_CONFIG.author })}
          </p>
          <p className="font-playfair text-sm md:text-[16px] leading-relaxed">
            {contactT('info.credits', { developer: SITE_CONFIG.developer })}
          </p>
        </div>

        <p className="font-playfair text-sm md:text-[16px] leading-relaxed flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenLegal}
            className="hover:text-whiteCustom transition-colors underline cursor-pointer"
          >
            {t('legal.link')}
          </button>
          <button
            type="button"
            onClick={onCopyLink}
            className="ml-2 px-3 py-1 border border-whiteCustom/40 text-sm hover:bg-whiteCustom/5 transition-colors"
          >
            Copy link
          </button>
        </p>
      </div>
    </div>
  );
}

// Composant pour le contenu principal (formulaire + informations)
export function ContactContent({
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
        <h2
          id={headingId}
          onClick={handleCopyLink}
          className="cursor-pointer text-whiteCustom font-playfair italic text-[32px] sm:text-[36px] md:text-[42px] lg:text-[46px] xl:text-[48px] leading-none mb-6 md:mb-8"
        >
          {t('title')}
        </h2>
        <ContactForm idSuffix={idSuffix} defaultSubject={defaultSubject} />
      </div>

      <div className="lg:col-span-5 md:mt-6 lg:mt-0">
        <ContactInfo onOpenLegal={onOpenLegal} onCopyLink={handleCopyLink} />
      </div>
    </div>
  );
}

// Composant séparé pour le marquee
export function ContactMarquee({ mode = 'absolute' } = {}) {
  const wrapperClassName =
    mode === 'inline'
      ? 'flex-shrink-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none'
      : 'absolute inset-x-0 bottom-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none';

  const MarqueeBlock = ({ ariaHidden = false } = {}) => (
    <div
      className="flex items-center gap-6 sm:gap-6 md:gap-6 lg:gap-6 pr-10 sm:pr-12 md:pr-14 lg:pr-16"
      aria-hidden={ariaHidden}
    >
      <span className="inline-block">{SITE_CONFIG.copyright}</span>
      <span className="inline-block">{SITE_CONFIG.copyright}</span>
      <span className="inline-block">{SITE_CONFIG.copyright}</span>
      <span className="inline-block">{SITE_CONFIG.copyright}</span>
    </div>
  );

  return (
    <div className={wrapperClassName}>
      <motion.div
        className="flex w-max whitespace-nowrap text-whiteCustom/90 font-playfair text-[18px] sm:text-[24px] md:text-[32px] lg:text-[38px] xl:text-[44px] py-1 sm:py-1.5 md:py-2 -tracking-normal"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 30,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
        style={{ willChange: 'transform' }}
      >
        <MarqueeBlock />
        <MarqueeBlock ariaHidden />
      </motion.div>
    </div>
  );
}

export default function ContactOverlay({
  open: openProp,
  onClose: onCloseProp,
  defaultSubject = '',
} = {}) {
  const [openState, setOpenState] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const panelRef = useRef(null);
  const t = useTranslations('contact');

  // Utiliser la prop si fournie, sinon utiliser l'état interne
  const open = openProp !== undefined ? openProp : openState;
  const handleClose = useCallback(() => {
    if (typeof onCloseProp === 'function') return onCloseProp();
    setOpenState(false);
  }, [onCloseProp]);

  const handleOpenLegal = useCallback(() => {
    setLegalOpen(true);
  }, []);

  const handleCloseLegal = useCallback(() => {
    setLegalOpen(false);
  }, []);

  // Ouvrir/fermer via les événements globaux (seulement si non contrôlé par les props)
  useEffect(() => {
    if (openProp !== undefined) return; // Ignorer si contrôlé
    const onShow = () => setOpenState(true);
    const onHide = () => setOpenState(false);
    const cleanupShow = addEventHandler(EVENTS.CONTACT_SHOW, onShow);
    const cleanupHide = addEventHandler(EVENTS.CONTACT_HIDE, onHide);
    return () => {
      cleanupShow();
      cleanupHide();
    };
  }, [openProp]);

  // Fermer avec Échap quand ouvert (seulement si le LegalOverlay n'est pas ouvert)
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape' && !legalOpen) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, legalOpen, handleClose]);

  // Verrouillage du scroll, focus initial et piège de focus quand l'overlay est ouvert
  useEffect(() => {
    if (!open) return;

    const root = document.getElementById('scroll-root');
    const prevOverflow = root ? root.style.overflow : undefined;
    const prevPaddingRight = root ? root.style.paddingRight : undefined;

    // Calculer la largeur de la barre de défilement pour éviter le décalage de mise en page
    if (root) {
      const scrollbarWidth = root.offsetWidth - root.clientWidth;
      root.style.overflow = 'hidden';
      root.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    // Focus initial sur le premier élément focusable (préférer fullName-overlay)
    const raf = requestAnimationFrame(() => {
      const explicit = document.getElementById('fullName-overlay');
      if (explicit && typeof explicit.focus === 'function') {
        explicit.focus();
        return;
      }
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = panel.querySelectorAll(focusSelectors);
      if (nodes.length > 0) {
        const first = nodes[0];
        if (first && typeof first.focus === 'function') first.focus();
      }
    });

    // Piéger la touche Tab dans le panneau
    const onKeyDown = e => {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = Array.from(panel.querySelectorAll(focusSelectors));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      if (root) {
        root.style.overflow = prevOverflow || '';
        root.style.paddingRight = prevPaddingRight || '';
      }
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          key="contact-overlay-modal"
          id="info-overlay"
          className="fixed inset-0 z-[200]"
          aria-label={t('overlay.ariaLabel')}
          exit={{ opacity: 0, transition: { delay: 0.5, duration: 0.1 } }}
        >
          <motion.button
            type="button"
            aria-label={t('overlay.closeAriaLabel')}
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title-overlay"
            className="absolute inset-x-0 bottom-0 bg-blackCustom border-t-2 border-whiteCustom max-h-[85vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            onClick={e => e.stopPropagation()}
            ref={panelRef}
          >
            {/* Contenu principal - prend l'espace disponible */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
                <ContactContent
                  idSuffix="-overlay"
                  headingId="contact-title-overlay"
                  variant="overlay"
                  defaultSubject={defaultSubject}
                  onOpenLegal={handleOpenLegal}
                />
              </div>
            </div>

            {/* Marquee en position relative - fait partie du flux */}
            <ContactMarquee mode="inline" />
          </motion.div>

          {/* Legal Overlay */}
          <LegalOverlay open={legalOpen} onClose={handleCloseLegal} />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
