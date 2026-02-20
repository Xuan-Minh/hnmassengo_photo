// =================================
// HOOKS REACT PERSONNALISÉS
// =================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { debounce } from './utils';

/**
 * Hook for managing responsive breakpoints
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    const debouncedUpdate = debounce(updateBreakpoint, 100);

    updateBreakpoint();
    window.addEventListener('resize', debouncedUpdate);

    return () => window.removeEventListener('resize', debouncedUpdate);
  }, []);

  return breakpoint;
};

/**
 * Hook for detecting scroll direction and position
 */
export const useScroll = () => {
  const [scrollData, setScrollData] = useState({
    y: 0,
    direction: 'up',
    isAtTop: true,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollData = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      setScrollData({
        y: scrollY,
        direction,
        isAtTop: scrollY === 0,
      });

      lastScrollY = scrollY;
    };

    const debouncedUpdate = debounce(updateScrollData, 10);

    window.addEventListener('scroll', debouncedUpdate);
    return () => window.removeEventListener('scroll', debouncedUpdate);
  }, []);

  return scrollData;
};

/**
 * Hook for intersection observer (viewport detection)
 */
export const useIntersection = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
};

/**
 * Hook for managing local storage state
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    value => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
};

/**
 * Hook for managing focus trap in modals
 */
export const useFocusTrap = isActive => {
  const ref = useRef();

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = ref.current.querySelectorAll(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = e => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    firstElement?.focus();
    window.addEventListener('keydown', handleTabKey);

    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return ref;
};

/**
 * Hook pour fade-in à la première apparition au scroll
 * Utilise IntersectionObserver pour déclencher une animation
 * @param {*} resetKey - Clé pour réinitialiser l'observation (ex: locale pour i18n)
 * @returns [ref, visible] - Ref du DOM et booléen d'apparition
 */
export const useFadeInOnScreen = resetKey => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
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
        const { buildSanityImageUrl } = await import('../lib/imageUtils');
        const client = (await import('../lib/sanity.client')).default;
        const data = await client.fetch(
          `*[_type == "${type}"] | order(order asc) { image{asset->{url}}, order }`
        );

        const urls = (data || [])
          .map(d => d?.image?.asset?.url)
          .filter(Boolean)
          // Optimiser les images avec paramètres Sanity
          .map(url =>
            buildSanityImageUrl(url, {
              w: options.width || 1200,
              q:
                options.quality !== undefined
                  ? options.quality
                  : process.env.NODE_ENV === 'production'
                    ? 40
                    : 50,
              auto: 'format',
            })
          );

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
 * @param {'lcp'|'secondary'|'gallery'|'shop'} imageType - Type of image
 * @returns {Object} - Optimized parameters {w, q, dpr}
 */
export function getOptimizedImageParams(imageType = 'secondary') {
  const isProduction = process.env.NODE_ENV === 'production';

  const params = {
    lcp: isProduction
      ? { w: 600, q: 40, dpr: 1 } // Hero image - most aggressively optimized
      : { w: 800, q: 50, dpr: 1 },
    secondary: isProduction
      ? { w: 600, q: 45, dpr: 1 } // Blog/post images
      : { w: 600, q: 50, dpr: 1 },
    gallery: isProduction
      ? { w: 1600, q: 45, dpr: 1 } // Gallery full-width carousel
      : { w: 2000, q: 55, dpr: 1 },
    shop: isProduction
      ? { w: 400, q: 40, dpr: 1 } // Product thumbnails
      : { w: 500, q: 55, dpr: 1 },
  };

  return params[imageType] || params.secondary;
}
