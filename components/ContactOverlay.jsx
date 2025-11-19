"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

function ContactContent({ idSuffix = "", headingId }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
      <div className="lg:col-span-7">
        <h2
          id={headingId}
          className="text-whiteCustom font-playfair italic text-[42px] md:text-[46px] lg:text-[48px] leading-none mb-8"
        >
          Contact
        </h2>
        <form
          className="space-y-6"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Contact form"
        >
          <div>
            <label
              htmlFor={`fullName${idSuffix}`}
              className="block text-whiteCustom/90 font-playfair text-sm mb-2"
            >
              full name
            </label>
            <input
              id={`fullName${idSuffix}`}
              name={`fullName${idSuffix}`}
              type="text"
              className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor={`email${idSuffix}`}
                className="block text-whiteCustom/90 font-playfair  text-sm mb-2"
              >
                email
              </label>
              <input
                id={`email${idSuffix}`}
                name={`email${idSuffix}`}
                type="email"
                className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2"
              />
            </div>
            <div>
              <label
                htmlFor={`subject${idSuffix}`}
                className="block text-whiteCustom/90 font-playfair text-sm mb-2"
              >
                subject
              </label>
              <input
                id={`subject${idSuffix}`}
                name={`subject${idSuffix}`}
                type="text"
                className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`message${idSuffix}`}
              className="block text-whiteCustom/90 font-playfair text-sm mb-2"
            >
              message
            </label>
            <textarea
              id={`message${idSuffix}`}
              name={`message${idSuffix}`}
              rows={6}
              className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 resize-y"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-3 text-whiteCustom/90 hover:text-whiteCustom transition-colors font-playfair  text-xl"
              aria-label="Submit"
            >
              <span aria-hidden>→</span>
              <span>submit</span>
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
