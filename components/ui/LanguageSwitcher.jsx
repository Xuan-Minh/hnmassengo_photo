'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePathname } from '../../src/i18n/navigation';

const langs = ['fr', 'en', 'de'];

// Sélecteur de langue avec adaptation de couleur (la disparition globale est gérée par UIControlBar)
export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale;
  const [isDarkBg, setIsDarkBg] = useState(false);

  useEffect(() => {
    const root = document.getElementById('scroll-root');
    if (!root) return;
    const sections = Array.from(root.querySelectorAll('section[id]'));

    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .reduce(
            (max, e) =>
              max && max.intersectionRatio > e.intersectionRatio ? max : e,
            null
          );

        if (visible?.target) {
          const sectionId = visible.target.id;
          // Synchronisation stricte : blanc uniquement sur blog
          setIsDarkBg(sectionId === 'blog');
        }
      },
      { root, threshold: [0.4, 0.6, 0.8] }
    );

    sections.forEach(sec => io.observe(sec));
    return () => io.disconnect();
  }, []);

  const activeClass = isDarkBg ? 'text-whiteCustom' : 'text-blackCustom';
  const inactiveClass = isDarkBg ? 'text-whiteCustom/60' : 'text-accent ';
  const hoverClass = isDarkBg
    ? 'hover:text-whiteCustom'
    : 'hover:text-blackCustom';

  const handleChangeLang = lang => {
    if (lang === locale) return;
    window.location.href = `/${lang}${pathname}`;
  };

  return (
    <div className="hidden lg:flex fixed text-[20px] bottom-10 right-20 z-50 items-center space-x-2">
      {langs.map((lang, i) => (
        <React.Fragment key={'frag-' + lang}>
          <button
            type="button"
            className={`uppercase font-bold transition-all duration-300 ease-in-out relative ${hoverClass} ${
              locale === lang ? activeClass : inactiveClass
            }`}
            onPointerDown={e => {
              e.preventDefault();
              e.stopPropagation();
              handleChangeLang(lang);
            }}
            aria-current={locale === lang ? 'true' : undefined}
            style={{ transitionProperty: 'color, background-color, transform' }}
          >
            {lang}
          </button>
          {i < langs.length - 1 && (
            <span
              key={'sep-' + lang}
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
