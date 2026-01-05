'use client';
import { useRouter, usePathname } from 'next/navigation';
import { EVENTS, emitEvent } from '../lib/events';

export default function Logo({ visible = true }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    // Si on n'est pas sur la page d'accueil, on y retourne
    if (pathname !== '/') {
      router.push('/');
    }

    // On lance l'animation immédiatement
    emitEvent(EVENTS.INTRO_SHOW);
  };

  return (
    <div
      data-layer="HAN-NOAH MASSENGO"
      className={`absolute top-0 left-1/2 transform -translate-x-1/2 justify-center gap-2 items-center space-x-2 z-50 bg-transparent pointer-events-none hidden sm:flex md:text-[36px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span
        onClick={handleLogoClick}
        className="text-accent font-normal font-playfair italic pointer-events-auto cursor-pointer"
        title="Retour à l'accueil"
      >
        Han-Noah
      </span>
      <span
        onClick={handleLogoClick}
        className="text-accent font-normal font-lexend pointer-events-auto cursor-pointer"
        title="Retour à l'accueil"
      >
        MASSENGO
      </span>
    </div>
  );
}
