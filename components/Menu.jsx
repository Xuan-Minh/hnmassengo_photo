"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { MENU_ITEMS, LANGUAGES, THEME } from "../lib/constants";
import { computeIsDark } from "../lib/utils";
import { EVENTS, emitEvent } from "../lib/events";

// Menu one-page: scroll interne vers des sections dans #scroll-root
export default function Menu() {
  const items = useMemo(() => MENU_ITEMS.slice(0, -1), []); // Tous sauf contact pour mobile

  const desktopItems = useMemo(() => MENU_ITEMS, []);

  const [active, setActive] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [hideMenu, setHideMenu] = useState(false);

  // Logique mobile
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const mobileOverlayRef = React.useRef(null);

  // Logique du sélecteur de langue
  const langs = LANGUAGES;
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = params.locale;

  const handleChangeLang = (lang) => {
    if (lang === locale) return;
    const current = pathname || "/";
    let base = current.replace(/^\/(fr|en|de)(?=\/|$)/, "");
    if (base === "") base = "/";
    const href = `/${lang}${base === "/" ? "" : base}`;
    router.replace(href, { scroll: false });
    setMobileMenuOpen(false); // Fermer le menu après changement de langue
  };

  // Trap focus dans le menu mobile
  useEffect(() => {
    if (!mobileMenuOpen || !mobileOverlayRef.current) return;

    const overlay = mobileOverlayRef.current;
    const focusableElements = overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    overlay.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => overlay.removeEventListener("keydown", handleTabKey);
  }, [mobileMenuOpen]);

  // Swipe up pour fermer le menu mobile
  useEffect(() => {
    if (!mobileMenuOpen || !mobileOverlayRef.current) return;

    const overlay = mobileOverlayRef.current;

    const handleTouchStart = (e) => {
      setTouchStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
      if (!touchStart) return;

      const touchEnd = e.touches[0].clientY;
      const diff = touchStart - touchEnd;

      // Swipe up (diff positif) d'au moins 50px
      if (diff > 50) {
        setMobileMenuOpen(false);
        setTouchStart(null);
      }
    };

    const handleTouchEnd = () => {
      setTouchStart(null);
    };

    overlay.addEventListener("touchstart", handleTouchStart);
    overlay.addEventListener("touchmove", handleTouchMove);
    overlay.addEventListener("touchend", handleTouchEnd);

    return () => {
      overlay.removeEventListener("touchstart", handleTouchStart);
      overlay.removeEventListener("touchmove", handleTouchMove);
      overlay.removeEventListener("touchend", handleTouchEnd);
    };
  }, [mobileMenuOpen, touchStart]);

  // Initialisation au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setActive(sessionStorage.getItem("menuActiveSection") || "home");
      setHydrated(true);
      const handleResize = () => setIsMobile(window.innerWidth < 1024);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const scrollToId = useCallback((targetId) => {
    const root = document.getElementById("scroll-root");
    const el = document.getElementById(targetId);
    if (!root || !el) return;
    const top =
      root.scrollTop +
      (el.getBoundingClientRect().top - root.getBoundingClientRect().top);
    root.scrollTo({ top, behavior: "smooth" });
    setMobileMenuOpen(false); // Fermer le menu mobile
  }, []);

  useEffect(() => {
    const root = document.getElementById("scroll-root");
    if (!root) return;

    // Récupère toutes les sections (y compris celles pas dans le menu, ex: blog)
    const allSections = Array.from(root.querySelectorAll("section[id]"));

    const io = new IntersectionObserver(
      (entries) => {
        const sorted = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = sorted[0]?.target;
        if (top) {
          // Active uniquement si section présente dans le menu
          if (desktopItems.some((i) => i.id === top.id)) {
            setActive((prev) => {
              if (prev !== top.id) {
                sessionStorage.setItem("menuActiveSection", top.id);
              }
              return top.id;
            });
          }
          // blog (Spaces) fond foncé; works & shop fond blanc; autres calcul auto
          if (top.id === "blog") {
            setIsDarkBg(true);
          } else if (["works", "shop"].includes(top.id)) {
            setIsDarkBg(false);
          } else {
            setIsDarkBg(computeIsDark(top));
          }
        }
      },
      { root, threshold: [0.4, 0.6, 0.8] }
    );

    allSections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, [desktopItems]);

  // Masquer le menu quand la section contact du bas (#info) est visible dans le viewport
  useEffect(() => {
    const root = document.getElementById("scroll-root");
    const infoEl = document.getElementById("info");
    if (!root || !infoEl) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Masquer quand au moins ~20% visible
        setHideMenu(entry.isIntersecting && entry.intersectionRatio > 0.2);
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    io.observe(infoEl);
    return () => io.disconnect();
  }, []);

  if (!hydrated || !active) return null;

  // --- MOBILE RENDER ---
  if (isMobile) {
    return (
      <>
        {/* Bouton MENU fixe */}
        <button
          className={`fixed top-8 right-8 z-50 text-xl font-playfair italic tracking-wider mix-blend-difference text-white transition-opacity duration-300 ${
            hideMenu && !mobileMenuOpen
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
          onClick={() => setMobileMenuOpen(true)}
          style={{ color: isDarkBg ? "#F4F3F2" : "#1a1a1a" }} // Couleur de secours si mix-blend ne fonctionne pas bien
        >
          menu
        </button>

        {/* Overlay Mobile */}
        <div
          ref={mobileOverlayRef}
          className={`fixed inset-0 z-[60] bg-[#333] text-[#F4F3F2] flex flex-col items-center justify-center transition-transform duration-500 ease-in-out ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Close button */}
          <button
            className="absolute top-8 right-8 text-xl font-playfair italic"
            onClick={() => setMobileMenuOpen(false)}
          >
            close
          </button>

          {/* Logo - centré avec les sections du menu */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-accent font-playfair italic text-[32px]">
              Han-Noah
            </span>
            <span className="text-accent font-lexend text-[32px]">
              MASSENGO
            </span>
          </div>

          {/* Links */}
          <ul className="flex flex-col items-center gap-2 mb-12">
            {desktopItems.map((it) => (
              <li key={it.id}>
                <button
                  onClick={() => {
                    if (it.id === "info") {
                      emitEvent(EVENTS.CONTACT_SHOW);
                      setMobileMenuOpen(false);
                    } else {
                      scrollToId(it.id);
                    }
                  }}
                  className="text-4xl font-lexend font-normal uppercase tracking-wide hover:text-gray-400 transition-colors"
                >
                  {it.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Language Switcher - même style que la version desktop */}
          <div className="flex items-center gap-2 text-[20px]">
            {langs.map((lang, i) => (
              <React.Fragment key={lang}>
                <button
                  onClick={() => handleChangeLang(lang)}
                  className={`uppercase font-bold transition-colors ${
                    locale === lang ? "text-[#F4F3F2]" : "text-[#F4F3F2]/60"
                  } hover:text-[#F4F3F2]`}
                >
                  {lang}
                </button>
                {i < langs.length - 1 && (
                  <span className="text-[#F4F3F2]/60">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </>
    );
  }

  // --- DESKTOP RENDER ---
  return (
    <nav
      className={[
        "fixed right-8 top-1/2 -translate-y-1/2 z-50 select-none transition-opacity duration-300",
        hideMenu
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto",
      ].join(" ")}
      aria-hidden={hideMenu ? "true" : undefined}
    >
      <ul className="flex flex-col items-end pr-2">
        {desktopItems.map((it, idx) => {
          const isActive = active === it.id;
          const activeColor = isDarkBg ? "text-[#F4F3F2]" : "text-blackCustom";
          const inactiveColor = isDarkBg ? "text-[#F4F3F2]/60" : "text-accent";
          return (
            <li key={it.id} className={idx > 0 ? "-mt-[8px]" : undefined}>
              <button
                type="button"
                onClick={() => {
                  if (it.id === "info") {
                    emitEvent(EVENTS.CONTACT_SHOW);
                  } else {
                    scrollToId(it.id);
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "uppercase tracking-wide transition-all duration-200 ease-out",
                  "text-right origin-right",
                  isActive
                    ? `font-bold ${activeColor} scale-110`
                    : `font-normal ${inactiveColor}`,
                  isDarkBg
                    ? "hover:scale-110 hover:text-[#F4F3F2]"
                    : "hover:scale-110 hover:text-blackCustom",
                  "text-[28px] md:text-[32px] lg:text-[40px] xl:text-[48px] 2xl:text-[56px] leading-none",
                ].join(" ")}
              >
                {it.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
