'use client';

import Menu from './Menu';
import LanguageSwitcher from './LanguageSwitcher';
import { useUIVisibility } from '../lib/useUIVisibility';

export function UIControlBar() {
  const showUI = useUIVisibility(true); // true pour inclure l'exception shop

  if (!showUI) return null;

  return (
    <>
      <Menu />
      <LanguageSwitcher />
    </>
  );
}
