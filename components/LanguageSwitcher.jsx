"use client";
import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({ isDarkBackground }) {
  const langs = ["fr", "en", "de"];
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = params.locale;
  const [autoDark, setAutoDark] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [hideSelector, setHideSelector] = useState(false);

  useEffect(() => {
    const root = document.getElementById("scroll-root");
    if (!root) return;
    const sections = Array.from(root.querySelectorAll("section[id]"));

    function computeIsDark(element) {
      if (!element) return false;
      const bg = window.getComputedStyle(element).backgroundColor;
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!match) return false;
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 110;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) {
          const sectionId = visible.target.id;
          setActiveSection(sectionId);
          // Correction : blog fond foncé, works et shop fond blanc
          if (sectionId === "blog") {
            setAutoDark(true);
          } else if (["works", "shop"].includes(sectionId)) {
            setAutoDark(false);
          } else {
            setAutoDark(computeIsDark(visible.target));
          }
        }
      },
      { root, threshold: [0.4, 0.6, 0.8] }
    );
    sections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, []);

  // Hide language selector when the bottom contact section (#info) is visible in viewport
  useEffect(() => {
    const root = document.getElementById("scroll-root");
    const infoEl = document.getElementById("info");
    if (!root || !infoEl) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Hide when at least ~20% visible
        setHideSelector(entry.isIntersecting && entry.intersectionRatio > 0.2);
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    io.observe(infoEl);
    return () => io.disconnect();
  }, []);

  // Utilisation directe de autoDark calculé par l'observer
  const activeClass = autoDark ? "text-[#F4F3F2]" : "text-blackCustom";
  const inactiveClass = autoDark ? "text-[#F4F3F2]/60" : "text-accent";
  const hoverClass = autoDark
    ? "hover:text-[#F4F3F2]"
    : "hover:text-blackCustom";

  const handleChangeLang = (lang) => {
    if (lang === locale) return;
    const current = pathname || "/";
    let base = current.replace(/^\/(fr|en|de)(?=\/|$)/, "");
    if (base === "") base = "/";
    const href = `/${lang}${base === "/" ? "" : base}`;
    router.replace(href, { scroll: false });
  };

  return (
    <div
      className={`fixed text-[20px] bottom-10 right-20 z-50 flex items-center space-x-2 transition-opacity duration-300 ${
        hideSelector ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {langs.map((lang, i) => (
        <React.Fragment key={lang}>
          <button
            className={`uppercase font-bold transition-all duration-300 ease-in-out relative ${hoverClass} ${
              locale === lang ? activeClass : inactiveClass
            }`}
            onClick={() => handleChangeLang(lang)}
            aria-current={locale === lang ? "true" : undefined}
            style={{ transitionProperty: "color, background-color, transform" }}
          >
            {lang}
          </button>
          {i < langs.length - 1 && (
            <span
              className={`mx-1 transition-colors duration-300 ease-in-out ${inactiveClass}`}
            >
              |
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
