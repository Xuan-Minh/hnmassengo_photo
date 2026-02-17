'use client';
import { useEffect } from 'react';
import { computeIsDark } from '../../lib/utils';

export default function ScrollbarTheme() {
  useEffect(() => {
    const root = document.getElementById('scroll-root');
    if (!root) return;

    const allSections = Array.from(root.querySelectorAll('section[id]'));

    const io = new IntersectionObserver(
      entries => {
        const sorted = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = sorted[0]?.target;
        if (top) {
          let isDarkBg = false;

          // blog (Spaces) fond foncé; works & shop fond blanc; autres calcul auto
          if (top.id === 'blog') {
            isDarkBg = true;
          } else if (['works', 'shop'].includes(top.id)) {
            isDarkBg = false;
          } else {
            isDarkBg = computeIsDark(top);
          }

          // Appliquer la classe au body pour adapter la scrollbar
          if (isDarkBg) {
            document.body.classList.add('dark-bg');
          } else {
            document.body.classList.remove('dark-bg');
          }
        }
      },
      { root, threshold: [0.4, 0.6, 0.8] }
    );

    allSections.forEach(sec => io.observe(sec));
    return () => io.disconnect();
  }, []);

  return null;
}
