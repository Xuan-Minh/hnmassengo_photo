'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { EVENTS, addEventHandler } from '../../lib/events';
import { SITE_CONFIG } from '../../lib/constants';

// Composant pour une section des mentions légales
function LegalSection({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl md:text-3xl font-playfair text-whiteCustom italic mb-4">
        {title}
      </h2>
      <div className="font-playfair text-base md:text-lg leading-relaxed text-whiteCustom">
        {children}
      </div>
    </section>
  );
}

// Contenu des mentions légales exportable
export function LegalContent() {
  const t = useTranslations('legalPage');

  return (
    <div className="space-y-6">
      {/* Éditeur du site */}
      <LegalSection title={t('editor.title')}>
        <p>
          {t('editor.name')}
          <br />
          {t('editor.status')}
          <br />
          {t('editor.address')}
          <br />
          {t('editor.email')}
          <br />
          {t('editor.phone')}
          <br />
          {t('editor.website')}
        </p>
      </LegalSection>

      {/* Numéros d'identification */}
      <LegalSection title={t('registration.title')}>
        <p>
          {t('registration.siret')}
          <br />
          {t('registration.rne')}
          <br />
          {t('registration.vat')}
        </p>
      </LegalSection>

      {/* Directeur de la publication */}
      <LegalSection title={t('director.title')}>
        <p>{t('director.name')}</p>
      </LegalSection>

      {/* Hébergement */}
      <LegalSection title={t('hosting.title')}>
        <p>
          {t('hosting.name')}
          <br />
          {t('hosting.address')}
          <br />
          {t('hosting.city')}
          <br />
          {t('hosting.country')}
          <br />
          {t('hosting.phone')}
          <br />
          {t('hosting.website')}
        </p>
      </LegalSection>

      {/* Propriété intellectuelle */}
      <LegalSection title={t('ip.title')}>
        <p className="mb-4">{t('ip.text1')}</p>
        <p>{t('ip.text2')}</p>
      </LegalSection>

      {/* Données personnelles */}
      <LegalSection title={t('data.title')}>
        <p className="mb-4">{t('data.text1')}</p>
        <p className="mb-4">{t('data.text2')}</p>
        <p>{t('data.text3')}</p>
      </LegalSection>

      {/* Cookies */}
      <LegalSection title={t('cookies.title')}>
        <p>{t('cookies.text')}</p>
      </LegalSection>

      {/* Droit applicable */}
      <LegalSection title={t('law.title')}>
        <p>{t('law.text')}</p>
      </LegalSection>

      {/* Crédits */}
      <LegalSection title={t('credits.title')}>
        <p>{t('credits.text', { developer: SITE_CONFIG.developer })}</p>
      </LegalSection>
    </div>
  );
}

export default function LegalOverlay({
  open: openProp,
  onClose: onCloseProp,
} = {}) {
  const [openState, setOpenState] = useState(false);
  const panelRef = useRef(null);
  const t = useTranslations('legal');

  // Utiliser la prop si fournie, sinon utiliser l'état interne
  const open = openProp !== undefined ? openProp : openState;
  const handleClose = useCallback(() => {
    if (typeof onCloseProp === 'function') return onCloseProp();
    setOpenState(false);
  }, [onCloseProp]);

  // Ouvrir/fermer via les événements globaux (seulement si non contrôlé par les props)
  useEffect(() => {
    if (openProp !== undefined) return;
    const onShow = () => setOpenState(true);
    const onHide = () => setOpenState(false);
    const cleanupShow = addEventHandler(EVENTS.LEGAL_SHOW, onShow);
    const cleanupHide = addEventHandler(EVENTS.LEGAL_HIDE, onHide);
    return () => {
      cleanupShow();
      cleanupHide();
    };
  }, [openProp]);

  // Fermer avec Échap (et arrêter la propagation pour ne pas fermer le ContactOverlay parent)
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey, true); // capture phase
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, handleClose]);

  // Verrouillage du scroll et piège de focus
  useEffect(() => {
    if (!open) return;

    const root = document.getElementById('scroll-root');
    const prevOverflow = root ? root.style.overflow : undefined;
    const prevPaddingRight = root ? root.style.paddingRight : undefined;

    if (root) {
      const scrollbarWidth = root.offsetWidth - root.clientWidth;
      root.style.overflow = 'hidden';
      root.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusSelectors = [
      'a[href]',
      'button:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    // Focus initial
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const closeBtn = panel.querySelector('button');
      if (closeBtn) closeBtn.focus();
    });

    // Piège Tab
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
        <motion.div
          key="legal-overlay-wrapper"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Panel principal */}
          <motion.section
            ref={panelRef}
            className="fixed inset-0 h-[100dvh] w-full bg-blackCustom z-[201] flex flex-col grid-cols-2 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="legal-title"
          >
            {/* En-tête fixe */}
            <header className="flex-shrink-0 p-6 md:p-12 lg:p-16 pb-0 md:pb-0 lg:pb-0">
              <button
                onClick={handleClose}
                className="font-playfair text-lg text-whiteCustom/80 hover:text-whiteCustom transition-colors"
                aria-label={t('overlay.closeAriaLabel')}
              >
                back
              </button>
            </header>

            {/* Contenu scrollable */}
            <main className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-16 py-6 md:py-8">
              <div className="max-w-4xl">
                <h1
                  id="legal-title"
                  className="text-4xl md:text-5xl lg:text-6xl font-playfair italic mb-8 md:mb-12 leading-tight text-whiteCustom"
                >
                  {t('title')}
                </h1>

                <LegalContent />
              </div>
            </main>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
