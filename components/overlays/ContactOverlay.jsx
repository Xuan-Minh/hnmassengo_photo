/* eslint-disable react-doctor/prefer-use-effect-event */
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, m } from 'framer-motion';
import { EVENTS, addEventHandler } from '../../lib/events';
import LegalOverlay from './LegalOverlay';
import ContactContent from './ContactContent';
import ContactMarquee from './ContactMarquee';

export default function ContactOverlay({
  open: openProp,
  onClose: onCloseProp,
  defaultSubject = '',
} = {}) {
  const [openState, setOpenState] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const panelRef = useRef(null);
  const t = useTranslations('contact');

  const open = openProp !== undefined ? openProp : openState;

  const handleClose = useCallback(() => {
    if (typeof onCloseProp === 'function') return onCloseProp();
    setOpenState(false);
  }, [onCloseProp]);

  const handleOpenLegal = useCallback(() => setLegalOpen(true), []);
  const handleCloseLegal = useCallback(() => setLegalOpen(false), []);

  useEffect(() => {
    if (openProp !== undefined) return;
    const onShow = () => setOpenState(true);
    const onHide = () => setOpenState(false);
    const cleanupShow = addEventHandler(EVENTS.CONTACT_SHOW, onShow);
    const cleanupHide = addEventHandler(EVENTS.CONTACT_HIDE, onHide);
    return () => {
      cleanupShow();
      cleanupHide();
    };
  }, [openProp]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape' && !legalOpen) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, legalOpen, handleClose]);

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
      'area[href]',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

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
        <m.section
          key="contact-overlay-modal"
          id="info-overlay"
          className="fixed inset-0 z-[200]"
          aria-label={t('overlay.ariaLabel')}
          exit={{ opacity: 0, transition: { delay: 0.5, duration: 0.1 } }}
        >
          <m.button
            type="button"
            aria-label={t('overlay.closeAriaLabel')}
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <m.div
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
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
                <ContactContent
                  idSuffix="-overlay"
                  headingId="contact-title-overlay"
                  variant="overlay"
                  defaultSubject={defaultSubject}
                  onOpenLegal={handleOpenLegal}
                />
                <ContactMarquee mode="inline" />
              </div>
            </div>
          </m.div>

          <LegalOverlay open={legalOpen} onClose={handleCloseLegal} />
        </m.section>
      )}
    </AnimatePresence>
  );
}
