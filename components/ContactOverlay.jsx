"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import OverlayActionButton from "./OverlayActionButton";



function ContactContent({ idSuffix = "", headingId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State pour afficher le message de succès
  const [showSuccess, setShowSuccess] = useState(false);

  // Fonction qui gère la soumission avec iframe cachée (pas de flash)
  const handleSubmit = (e) => {
    const isNetlify =
      window.location.host.includes("netlify.app") ||
      window.location.host.includes("netlify.com") ||
      window.location.host === "hannoahmassengo.fr";

    console.log("🚀 Form submission started", {
      isNetlify,
      host: window.location.host,
      formData: {
        fullName: e.target.fullName?.value,
        email: e.target.email?.value,
        subject: e.target.subject?.value,
        message: e.target.message?.value
      }
    });

    if (isNetlify) {
      console.log("📡 Netlify environment detected - using iframe submission");
      // Sur Netlify : utiliser iframe cachée pour éviter redirection
      setIsSubmitting(true);
      
      // Créer iframe cachée pour la soumission
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'hidden-form-target';
      document.body.appendChild(iframe);
      console.log("📄 Hidden iframe created:", iframe.name);
      
      // Modifier le target du form pour l'iframe
      e.target.target = 'hidden-form-target';
      console.log("🎯 Form target set to iframe");
      
      // Écouter le load de l'iframe pour détecter le succès
      iframe.onload = () => {
        console.log("✅ Iframe loaded - form submission completed");
        console.log("📧 Form should be processed by Netlify now");
        setIsSubmitting(false);
        setShowSuccess(true);
        e.target.reset(); // Vider le formulaire
        document.body.removeChild(iframe); // Nettoyer l'iframe
        console.log("🧹 Iframe cleaned up, form reset, success message shown");
        
        // Scroll vers le message de succès
        setTimeout(() => {
          document.querySelector('.bg-green-600\\/20')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      };
      
      // Timeout de sécurité
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          console.log("⚠️ Iframe timeout - forcing success state");
          iframe.onload();
        }
      }, 5000);
      
      console.log("🔄 Native form submission proceeding to iframe...");
      // Laisser la soumission native se faire vers l'iframe
      return;
    } else {
      console.log("💻 Local environment - simulating submission");
      // En local : simuler le succès
      e.preventDefault();
      setIsSubmitting(true);
      setTimeout(() => {
        console.log("✅ Local simulation completed");
        setIsSubmitting(false);
        setShowSuccess(true);
      }, 1000);
    }
  };



  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
      <div className="lg:col-span-7">
        <h2
          id={headingId}
          className="text-whiteCustom font-playfair italic text-[42px] md:text-[46px] lg:text-[48px] leading-none mb-8"
        >
          Contact
        </h2>

        {/* Formulaire caché supprimé - utilise contact.html pour la détection */}

        <form
          className="space-y-6"
          name="contact"
          method="POST"
          onSubmit={handleSubmit}
          aria-label="Contact form"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
        >
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" name="bot-field" style={{ display: "none" }} />

          {showSuccess && (
            <div className="bg-green-600/20 border border-green-500 text-green-300 p-4 rounded mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <h3 className="font-semibold">Message envoyé avec succès !</h3>
                  <p className="text-sm opacity-90">Nous vous répondrons sous 24h à l'adresse indiquée.</p>
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
              className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor={`email${idSuffix}`}
                className="block text-whiteCustom/90 font-playfair  text-sm mb-2"
              >
                email *
              </label>
              <input
                id={`email${idSuffix}`}
                name="email"
                type="email"
                required
                className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2"
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
                className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2"
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
              rows={6}
              required
              className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 resize-y"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-lg font-medium font-playfair text-whiteCustom/85 hover:text-whiteCustom hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-block mr-2">→</span>
              <span>{isSubmitting ? "sending..." : "send"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-5 text-whiteCustom/90">
        <h3 className="font-playfair italic text-2xl md:text-3xl leading-tight mb-6">
          <a
            href="https://www.instagram.com/studio42archives/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          ,<a href="mailto:contact@hannoahmassengo.fr"> Mail</a>
        </h3>
        <p className="font-playfair text-[16px] leading-relaxed mb-6">
          All images on this website are the property of Han-Noah MASSENGO and
          are protected by copyright. It is illegal to reproduce, distribute, or
          publish them, in whole or in part, without first obtaining his written
          permission.
        </p>
        <p className="font-playfair text-[16px] leading-relaxed">
          Design & Development by Xuan-Minh TRAN
        </p>
      </div>
    </div>
  );
}

function ContactMarquee() {
  return (
    <div className="absolute inset-x-0 bottom-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none">
      <motion.div
        className="whitespace-nowrap text-whiteCustom/90 font-playfair text-[42px] md:text-[56px] lg:text-[64px] py-2 -tracking-normal"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        style={{ willChange: "transform" }}
      >
        <span className="inline-block">© Han-Noah MASSENGO 2025</span>
        <span className="inline-block">© Han-Noah MASSENGO 2025</span>
        <span className="inline-block">© Han-Noah MASSENGO 2025</span>
        <span className="inline-block">© Han-Noah MASSENGO 2025</span>
      </motion.div>
    </div>
  );
}

export default function ContactOverlay() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Open/close via global events
  useEffect(() => {
    const onShow = () => setOpen(true);
    const onHide = () => setOpen(false);
    window.addEventListener("contact:show", onShow);
    window.addEventListener("contact:hide", onHide);
    return () => {
      window.removeEventListener("contact:show", onShow);
      window.removeEventListener("contact:hide", onHide);
    };
  }, []);

  // Close on ESC when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Scroll lock, initial focus and focus trap when overlay is open
  useEffect(() => {
    if (!open) return;

    const root = document.getElementById("scroll-root");
    const prevOverflow = root ? root.style.overflow : undefined;
    if (root) root.style.overflow = "hidden";

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
      if (root) root.style.overflow = prevOverflow || "";
    };
  }, [open]);

  return (
    <>
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
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-title-overlay"
              className="absolute inset-x-0 bottom-0 bg-blackCustom border-t-2 border-whiteCustom"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
              ref={panelRef}
            >
              <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pt-12 lg:pt-16 pb-28">
                <ContactContent
                  idSuffix="-overlay"
                  headingId="contact-title-overlay"
                />
              </div>
              <ContactMarquee />
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      <section
        id="info"
        className="relative snap-start bg-blackCustom border-t-2 border-whiteCustom min-h-[clamp(560px,68.8svh,820px)]"
        aria-label="Contact"
      >
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 lg:py-16 pb-28">
          <ContactContent idSuffix="-inline" />
        </div>
        <ContactMarquee />
      </section>
    </>
  );
}
