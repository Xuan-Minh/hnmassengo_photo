// =================================
// HOOKS REACT PERSONNALISÉS
// =================================

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook pour fade-in à la première apparition au scroll
 * Utilise IntersectionObserver pour déclencher une animation
 * @param {*} resetKey - Clé pour réinitialiser l'observation (ex: locale pour i18n)
 * @returns [ref, visible] - Ref du DOM et booléen d'apparition
 */
export const useFadeInOnScreen = resetKey => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  // Adjust state inline when the prop changes
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setVisible(false);
  }

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === 'undefined') return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [resetKey]);

  return [ref, visible];
};

/**
 * Hook pour récupérer les images depuis Sanity avec fallback local
 * Optimise automatiquement les images pour les performances
 * @param {string} type - Type Sanity (ex: 'homeSectionImage')
 * @param {string[]} fallback - Images de fallback si local est activé
 * @param {Object} options - Options d'optimisation {width, quality}
 * @returns {string[]} URLs des images optimisées
 */
export const useSanityImages = (type, fallback = [], options = {}) => {
  const [images, setImages] = useState(() => {
    return process.env.NEXT_PUBLIC_USE_LOCAL_HOME_FALLBACK === 'true'
      ? fallback
      : [];
  });

  useEffect(() => {
    let cancelled = false;

    const fetchImages = async () => {
      try {
        const { buildSanityImageUrl } = await import('./imageUtils');
        const client = (await import('./sanity.client')).default;
        const data = await client.fetch(
          `*[_type == "${type}" && isActive == true] | order(_createdAt asc) { image{asset->{url}}, isActive }`
        );

        const urls = (data || [])
          .flatMap(d => (d?.image?.asset?.url ? [d.image.asset.url] : []))
          .reduce((acc, url) => {
            const optimized = buildSanityImageUrl(url, {
              w: options.width || 1200,
              q:
                options.quality !== undefined
                  ? options.quality
                  : process.env.NODE_ENV === 'production'
                    ? 40
                    : 50,
              auto: 'format',
            });
            if (!acc.includes(optimized)) acc.push(optimized);
            return acc;
          }, []);

        if (!cancelled && urls.length > 0) {
          setImages(urls);
        }
      } catch (error) {
        // Garder l'état actuel (fallback optionnel)
        console.error(`Erreur chargement images ${type}:`, error);
      }
    };

    fetchImages();
    return () => {
      cancelled = true;
    };
  }, [type, options.width, options.quality]);

  return images;
};

/**
 * Hook pour déterminer si les éléments UI (Logo, Menu, LanguageSwitcher) doivent être visibles
 * Masque ces éléments sur les pages légales, studio, et quand Snipcart est ouvert
 * @param {boolean} includeShopException - Si true, affiche sur la page shop même avec Snipcart ouvert
 */
export function useUIVisibility(includeShopException = false) {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const updateHash = () => {
      setHash(typeof window !== 'undefined' ? window.location.hash : '');
    };

    updateHash();

    if (typeof window === 'undefined') return;

    const handleHashChange = () => updateHash();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const shouldShow = useMemo(() => {
    const isLegalPage = pathname.includes('/legal');
    const isStudioPage = pathname.includes('/studio');
    const isShopPage =
      includeShopException &&
      (pathname.includes('/shop') ||
        pathname === '/fr' ||
        pathname === '/en' ||
        pathname === '/de');
    const isSnipcartUrl =
      hash.includes('#/cart') ||
      hash.includes('#/checkout') ||
      hash.includes('#snipcart');

    // Ne pas afficher si on est sur une page légale ou studio
    if (isLegalPage || isStudioPage) return false;

    // Snipcart masque l'UI sauf sur la page shop
    if (isSnipcartUrl && !isShopPage) return false;

    return true;
  }, [pathname, hash, includeShopException]);

  return shouldShow;
}

/**
 * Get optimized image parameters based on environment
 * @param {'lcp'|'secondary'|'gallery'|'gallery-grid'|'shop'|'loading'} imageType
 * @param {boolean} isMobile - Adapt width for mobile
 */
export function getOptimizedImageParams(
  imageType = 'secondary',
  isMobile = false
) {
  const params = {
    lcp: { w: isMobile ? 800 : 1200, q: 75 },
    secondary: { w: isMobile ? 600 : 800, q: 75 },
    // Profil pour le plein écran
    gallery: { w: isMobile ? 1000 : 1600, q: 80 },
    // Profil pour les vignettes (Nouveau !)
    'gallery-grid': { w: isMobile ? 400 : 600, q: 65 },
    shop: { w: isMobile ? 500 : 800, q: 80 },
    loading: {
      w: isMobile ? 600 : 1200,
      q: 60,
      blur: 10,
    },
  };

  return params[imageType] || params.secondary;
}

export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export function useEffectEvent(callback) {
  const ref = useRef(callback);
  ref.current = callback;
  return useCallback((...args) => {
    const fn = ref.current;
    return fn?.(...args);
  }, []);
}
