'use client';

import Menu from '../ui/Menu';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useUIVisibility } from '../../lib/hooks';

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
