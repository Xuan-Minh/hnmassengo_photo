"use client";
import React from "react";
export default function LanguageSwitcher({
  locale,
  onChange,
  isDarkBackground,
}) {
  const langs = ["fr", "en", "de"];
  const activeColor = isDarkBackground ? "text-background" : "text-blackCustom";
  // Accentuation au hover selon le fond
  const inactiveColor = isDarkBackground
    ? "text-accentHover hover:text-background"
    : "text-accent hover:text-blackCustom";

  return (
    <div className="fixed text-[20px] bottom-10 right-10 z-50 flex items-center space-x-2">
      {langs.map((lang, i) => (
        <React.Fragment key={lang}>
          <button
            className={`uppercase font-bold transition-colors duration-300 ease-in-out ${locale === lang ? activeColor : inactiveColor}`}
            onClick={() => onChange(lang)}
            aria-current={locale === lang ? "true" : undefined}
            style={{
              transitionProperty: "color, background-color, border-color",
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
