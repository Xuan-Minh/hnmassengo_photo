"use client";
import React from "react";

import { useParams, usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({ isDarkBackground }) {
  const langs = ["fr", "en", "de"];
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = params.locale;
  const activeColor = isDarkBackground ? "text-background" : "text-blackCustom";
  const inactiveColor = isDarkBackground
    ? "text-accentHover hover:text-background"
    : "text-accent hover:text-blackCustom";

  const handleChangeLang = (lang) => {
    if (lang === locale) return;
    // Calcule le chemin sans préfixe locale, puis laisse next-intl router ajouter la nouvelle locale
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
            className={`uppercase font-bold transition-all duration-300 ease-in-out relative
              ${locale === lang ? activeColor : inactiveColor}`}
            onClick={() => handleChangeLang(lang)}
            aria-current={locale === lang ? "true" : undefined}
            style={{
              transitionProperty:
                "color, background-color, border-color, transform",
            }}
          >
            {lang}
          </button>
          {i < langs.length - 1 && (
            <span
              className={`mx-1 transition-colors duration-300 ease-in-out ${inactiveColor}`}
            >
              |
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
