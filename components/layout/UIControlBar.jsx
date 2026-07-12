'use client';
import { useState, useEffect } from 'react';
import Menu from '../ui/Menu';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useUIVisibility, useIsMobile } from '../../lib/hooks';

export function UIControlBar() {
  const showUI = useUIVisibility(true);
  const isMobile = useIsMobile(1024); // On ramène le hook ici
  const [hideForFooter, setHideForFooter] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setHideForFooter(false);
      return;
    }

    const root = document.getElementById('scroll-root');
    const infoEl = document.getElementById('info');
    if (!root || !infoEl || !showUI) return;

    const io = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        setHideForFooter(entry.isIntersecting && entry.intersectionRatio > 0.2);
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    io.observe(infoEl);
    return () => io.disconnect();
  }, [showUI, isMobile]);

  if (!showUI) return null;

  return (
    <div
      className={`transition-opacity duration-300 z-50 ${
        hideForFooter ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <Menu />
      <LanguageSwitcher />
    </div>
  );
}
