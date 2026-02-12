// =================================
// HOOKS REACT PERSONNALISÉS
// =================================

import { useState, useEffect, useRef, useCallback } from 'react';
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
    if (!node) return;

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
 * @param {string} type - Type Sanity (ex: 'homeSectionImage')
 * @param {string[]} fallback - Images de fallback si local est activé
 * @returns {string[]} URLs des images
 */
export const useSanityImages = (type, fallback = []) => {
  const [images, setImages] = useState(() => {
    return process.env.NEXT_PUBLIC_USE_LOCAL_HOME_FALLBACK === 'true'
      ? fallback
      : [];
  });

  useEffect(() => {
    let cancelled = false;

    const fetchImages = async () => {
      try {
        const client = (await import('../lib/sanity.client')).default;
        const data = await client.fetch(
          `*[_type == "${type}"] | order(order asc) { image{asset->{url}}, order }`
        );

        const urls = (data || [])
          .map(d => d?.image?.asset?.url)
          .filter(Boolean);

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
  }, [type]);

  return images;
};
