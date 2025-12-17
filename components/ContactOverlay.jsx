"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { SITE_CONFIG } from "../lib/constants";
import { EVENTS, addEventHandler } from "../lib/events";

// Composant pour le formulaire de contact réutilisable
function ContactForm({ idSuffix = "", onSubmitSuccess, defaultSubject = "" }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    // Créer une iframe cachée pour soumettre le formulaire
    const iframe = document.createElement("iframe");
    iframe.name = "hidden-iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Configurer le formulaire pour soumettre dans l'iframe
    form.target = "hidden-iframe";

    // Soumettre le formulaire
    form.submit();

    // Afficher le message de succès
    setShowSuccess(true);
    if (onSubmitSuccess) onSubmitSuccess();

    // Réinitialiser le formulaire après un court délai
    setTimeout(() => {
      form.reset();
      // Vérifier que l'iframe existe toujours avant de la supprimer
      if (iframe && iframe.parentNode === document.body) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  return (
    <form
      ref={formRef}
      className="space-y-4 md:space-y-6"
      name="contact"
      method="POST"
      action="/success.html"
      aria-label="Contact form"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="bot-field" style={{ display: "none" }} />

      {showSuccess && (
        <div className="bg-green-600/20 border border-green-500 text-green-300 p-3 md:p-4 rounded mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <span className="text-lg md:text-xl">✅</span>
            <div>
              <h3 className="font-semibold text-sm md:text-base">
                Message envoyé avec succès !
              </h3>
              <p className="text-xs md:text-sm opacity-90">
                Nous vous répondrons sous 24h à l'adresse indiquée.
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
          full name *
        </label>
        <input
          id={`fullName${idSuffix}`}
          name="fullName"
          type="text"
          required
          className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm md:text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label
            htmlFor={`email${idSuffix}`}
            className="block text-whiteCustom/90 font-playfair text-sm mb-2"
          >
            email *
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
            subject *
          </label>
          <input
            id={`subject${idSuffix}`}
            name="subject"
            type="text"
            required
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
          message *
        </label>
        <textarea
          id={`message${idSuffix}`}
          name="message"
          rows={5}
          required
          className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 resize-y text-sm md:text-base"
        />
      </div>

      <div>
        <button
          type="submit"
          className="px-6 py-3 text-lg font-medium font-playfair text-whiteCustom/85 hover:text-whiteCustom hover:opacity-100 transition-all duration-300"
        >
          <span className="inline-block mr-2">→</span>
          <span>send</span>
        </button>
      </div>
    </form>
  );
}

// Composant pour les informations de contact
function ContactInfo() {
  return (
    <div className="text-whiteCustom/90 space-y-4 md:space-y-6">
      <h3 className="font-playfair italic text-xl md:text-2xl lg:text-3xl leading-tight">
        <a
          href={SITE_CONFIG.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-whiteCustom transition-colors"
        >
          Instagram
        </a>
        ,{" "}
        <a
          href={`mailto:${SITE_CONFIG.email}`}
          className="hover:text-whiteCustom transition-colors"
        >
          Mail
        </a>
      </h3>
      <p className="font-playfair text-sm md:text-[16px] leading-relaxed">
        All images on this website are the property of {SITE_CONFIG.author} and
        are protected by copyright. It is illegal to reproduce, distribute, or
        publish them, in whole or in part, without first obtaining his written
        permission.
      </p>
      <p className="font-playfair text-sm md:text-[16px] leading-relaxed">
        Design & Development by {SITE_CONFIG.developer}
      </p>
    </div>
  );
}

// Composant pour le contenu principal (formulaire + informations)
function ContactContent({ idSuffix = "", headingId, variant = "default", defaultSubject = "" }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 xl:gap-14">
      <div className="lg:col-span-7">
        <h2
          id={headingId}
          className="text-whiteCustom font-playfair italic text-[32px] sm:text-[36px] md:text-[42px] lg:text-[46px] xl:text-[48px] leading-none mb-6 md:mb-8"
        >
          Contact
        </h2>
        <ContactForm idSuffix={idSuffix} defaultSubject={defaultSubject} />
      </div>

      <div className="lg:col-span-5 md:mt-6 lg:mt-0">
        <ContactInfo />
      </div>
    </div>
  );
}

// Composant séparé pour le marquee
function ContactMarquee() {
  return (
    <div className="absolute inset-x-0 bottom-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none">
      <motion.div
        className="whitespace-nowrap text-whiteCustom/90 font-playfair text-[18px] sm:text-[24px] md:text-[32px] lg:text-[38px] xl:text-[44px] py-1 sm:py-1.5 md:py-2 -tracking-normal"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        style={{ willChange: "transform" }}
      >
        <span className="inline-block">{SITE_CONFIG.copyright}</span>
        <span className="inline-block">{SITE_CONFIG.copyright}</span>
        <span className="inline-block">{SITE_CONFIG.copyright}</span>
        <span className="inline-block">{SITE_CONFIG.copyright}</span>
      </motion.div>
    </div>
  );
}

export default function ContactOverlay({ open: openProp, onClose: onCloseProp, defaultSubject = "" } = {}) {
  const t = useTranslations();
  const [openState, setOpenState] = useState(false);
  const panelRef = useRef(null);

  // Use prop if provided, otherwise use internal state
  const open = openProp !== undefined ? openProp : openState;
  const handleClose = onCloseProp || (() => setOpenState(false));

  // Open/close via global events (only if not controlled by props)
  useEffect(() => {
    if (openProp !== undefined) return; // Skip if controlled
    const onShow = () => setOpenState(true);
    const onHide = () => setOpenState(false);
    const cleanupShow = addEventHandler(EVENTS.CONTACT_SHOW, onShow);
    const cleanupHide = addEventHandler(EVENTS.CONTACT_HIDE, onHide);
    return () => {
      cleanupShow();
      cleanupHide();
    };
  }, [openProp]);

  // Close on ESC when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  // Scroll lock, initial focus and focus trap when overlay is open
  useEffect(() => {
    if (!open) return;

    const root = document.getElementById("scroll-root");
    const prevOverflow = root ? root.style.overflow : undefined;
    const prevPaddingRight = root ? root.style.paddingRight : undefined;
    
    // Calculate scrollbar width to prevent layout shift
    if (root) {
      const scrollbarWidth = root.offsetWidth - root.clientWidth;
      root.style.overflow = "hidden";
      root.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusSelectors = [
      "a[href]",
      "area[href]",
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    // Initial focus on first focusable element (prefer fullName-overlay)
    const raf = requestAnimationFrame(() => {
      const explicit = document.getElementById("fullName-overlay");
      if (explicit && typeof explicit.focus === "function") {
        explicit.focus();
        return;
      }
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = panel.querySelectorAll(focusSelectors);
      if (nodes.length > 0) {
        const first = nodes[0];
        if (first && typeof first.focus === "function") first.focus();
      }
    });

    // Trap Tab key within panel
    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
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
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      if (root) {
        root.style.overflow = prevOverflow || "";
        root.style.paddingRight = prevPaddingRight || "";
      }
    };
  }, [open]);

  return (
    <>
      {/* Contact Overlay Modal */}
      <AnimatePresence>
        {open && (
          <section
            id="info-overlay"
            className="fixed inset-0 z-[130]"
            aria-label="Contact Overlay"
          >
            <motion.button
              type="button"
              aria-label="Close contact overlay"
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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
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
                  />
                </div>
              </div>

              {/* Marquee en position relative - fait partie du flux */}
              <div className="flex-shrink-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none">
                <motion.div
                  className="whitespace-nowrap text-whiteCustom/90 font-playfair text-[18px] sm:text-[24px] md:text-[32px] lg:text-[38px] xl:text-[44px] py-1 sm:py-1.5 md:py-2 -tracking-normal"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                  style={{ willChange: "transform" }}
                >
                  <span className="inline-block">{SITE_CONFIG.copyright}</span>
                  <span className="inline-block">{SITE_CONFIG.copyright}</span>
                  <span className="inline-block">{SITE_CONFIG.copyright}</span>
                  <span className="inline-block">{SITE_CONFIG.copyright}</span>
                </motion.div>
              </div>
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      {/* Section Contact Inline */}
      <section
        id="info"
        className="relative snap-start bg-blackCustom border-t-2 border-whiteCustom min-h-[clamp(600px,75vh,900px)]"
        aria-label="Contact"
      >
        {/* Contenu principal avec padding pour éviter le marquee */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-8 md:pt-12 lg:pt-16 pb-20 sm:pb-24 md:pb-32 lg:pb-36 xl:pb-40">
          <ContactContent
            idSuffix="-inline"
            headingId="contact-title-inline"
            variant="section"
            defaultSubject={defaultSubject}
          />
        </div>

        {/* Marquee séparé en bas */}
        <ContactMarquee />
      </section>
    </>
  );
}
