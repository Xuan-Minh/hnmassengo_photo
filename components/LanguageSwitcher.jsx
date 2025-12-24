"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { computeIsDark } from "../lib/utils";

// Sélecteur de langue avec adaptation de couleur + disparition sur la section contact
export default function LanguageSwitcher() {
  const langs = ["fr", "en", "de"];
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = params.locale;
  const [autoDark, setAutoDark] = useState(false);
  // activeSection n'est plus nécessaire (uniquement adaptation colorimétrique)
  const [hideSelector, setHideSelector] = useState(false);

  useEffect(() => {
    const root = document.getElementById("scroll-root");
    if (!root) return;
    const sections = Array.from(root.querySelectorAll("section[id]"));

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) {
          const sectionId = visible.target.id;
          // blog (Spaces) forcé clair, works/shop forcés noir, sinon calcul auto
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
      className={`hidden lg:flex fixed text-[20px] bottom-10 right-20 z-50 items-center space-x-2 transition-opacity duration-300 ${
        hideSelector ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {langs.map((lang, i) => (
        <React.Fragment key={"frag-" + lang}>
          <button
            key={lang}
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
              key={"sep-" + lang}
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
