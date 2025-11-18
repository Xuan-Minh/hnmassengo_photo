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
        if (visible?.target) setAutoDark(computeIsDark(visible.target));
      },
      { root, threshold: [0.4, 0.6, 0.8] }
    );
    sections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, []);

  // Ne laisser l'override que si isDarkBackground === true; false ne force pas clair.
  const effectiveDark = isDarkBackground === true ? true : autoDark;
  const activeClass = effectiveDark ? "text-[#F4F3F2]" : "text-blackCustom";
  const inactiveClass = effectiveDark ? "text-[#F4F3F2]/60" : "text-accent";
  const hoverClass = effectiveDark
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
    <div className="fixed text-[20px] bottom-10 right-20 z-50 flex items-center space-x-2">
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
