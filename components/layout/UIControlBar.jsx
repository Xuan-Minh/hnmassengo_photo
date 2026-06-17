'use client';
import { useState, useEffect } from 'react';
import Menu from '../ui/Menu';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useUIVisibility } from '../../lib/hooks';

export function UIControlBar() {
  const showUI = useUIVisibility(true);
  const [hideForFooter, setHideForFooter] = useState(false);

  // Le seul et unique Observer pour toute l'interface !
  useEffect(() => {
    const root = document.getElementById('scroll-root');
    const infoEl = document.getElementById('info');
    if (!root || !infoEl || !showUI) return;

    const io = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        // On masque si on voit plus de 20% du footer
        setHideForFooter(entry.isIntersecting && entry.intersectionRatio > 0.2);
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    io.observe(infoEl);
    return () => io.disconnect();
  }, [showUI]);

  // Si useUIVisibility dit non (ex: on est dans le panier), on ne rend RIEN
  if (!showUI) return null;

  return (
    // On englobe les composants dans une div qui gère l'opacité globale
    <div
      className={`transition-opacity duration-300 ${
        hideForFooter ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <Menu />
      <LanguageSwitcher />
    </div>
  );
}
