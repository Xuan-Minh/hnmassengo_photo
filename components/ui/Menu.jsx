'use client';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useParams } from 'next/navigation';
import { usePathname } from '../../src/i18n/navigation';
import { MENU_ITEMS, LANGUAGES } from '../../lib/constants';
import { EVENTS, emitEvent } from '../../lib/events';

// 1. Define Initial State
const initialState = {
  active: null,
  hydrated: false,
  isDarkBg: false,
  hideMenu: false,
  isMobile: false,
  mobileMenuOpen: false,
  touchStart: null,
};

// 2. Define Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default function Menu() {
  const desktopItems = useMemo(() => MENU_ITEMS, []);

  // 3. Initialize Reducer
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    active,
    hydrated,
    isDarkBg,
    hideMenu,
    isMobile,
    mobileMenuOpen,
    touchStart,
  } = state;

  const shouldHideDesktopMenu = hideMenu || active === 'home';
  const shouldHideMobileMenu = hideMenu;

  const mobileOverlayRef = React.useRef(null);

  // Logique du sélecteur de langue
  const langs = LANGUAGES;
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale;

  const handleChangeLang = lang => {
    if (lang === locale) return;
    window.location.href = `/${lang}${pathname}`;
  };

  // Trap focus dans le menu mobile
  useEffect(() => {
    if (!mobileMenuOpen || !mobileOverlayRef.current) return;

    const overlay = mobileOverlayRef.current;
    const focusableElements = overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = e => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    overlay.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => overlay.removeEventListener('keydown', handleTabKey);
  }, [mobileMenuOpen]);

  // Swipe up pour fermer le menu mobile
  useEffect(() => {
    if (!mobileMenuOpen || !mobileOverlayRef.current) return;

    const overlay = mobileOverlayRef.current;

    const handleTouchStart = e => {
      dispatch({
        type: 'UPDATE_STATE',
        payload: { touchStart: e.touches[0].clientY },
      });
    };

    const handleTouchMove = e => {
      if (!touchStart) return;

      const touchEnd = e.touches[0].clientY;
      const diff = touchStart - touchEnd;

      if (diff > 50) {
        // Grouping updates
        dispatch({
          type: 'UPDATE_STATE',
          payload: { mobileMenuOpen: false, touchStart: null },
        });
      }
    };

    const handleTouchEnd = () => {
      dispatch({ type: 'UPDATE_STATE', payload: { touchStart: null } });
    };

    overlay.addEventListener('touchstart', handleTouchStart, { passive: true });
    overlay.addEventListener('touchmove', handleTouchMove, { passive: true });
    overlay.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      overlay.removeEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      overlay.removeEventListener('touchmove', handleTouchMove, {
        passive: true,
      });
      overlay.removeEventListener('touchend', handleTouchEnd, {
        passive: true,
      });
    };
  }, [mobileMenuOpen, touchStart]);

  // Initialisation au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMob = window.innerWidth < 1024;
      // Grouping initialization states
      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          active: sessionStorage.getItem('menuActiveSection') || 'home',
          hydrated: true,
          isMobile: isMob,
        },
      });

      const handleResize = () => {
        dispatch({
          type: 'UPDATE_STATE',
          payload: { isMobile: window.innerWidth < 1024 },
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const scrollToId = useCallback(targetId => {
    const root = document.getElementById('scroll-root');
    const el = document.getElementById(targetId);
    if (!root || !el) return;
    const top =
      root.scrollTop +
      (el.getBoundingClientRect().top - root.getBoundingClientRect().top);
    root.scrollTo({ top, behavior: 'smooth' });
    dispatch({ type: 'UPDATE_STATE', payload: { mobileMenuOpen: false } });
  }, []);

  useEffect(() => {
    const root = document.getElementById('scroll-root');
    if (!root) return;

    const allSections = Array.from(root.querySelectorAll('section[id]'));
    const ratioMap = new Map(allSections.map(s => [s.id, 0]));

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          ratioMap.set(e.target.id, e.intersectionRatio);
        });

        let bestMenuId = null;
        let bestMenuRatio = -1;
        let bestOverallId = null;
        let bestOverallRatio = -1;

        ratioMap.forEach((ratio, id) => {
          if (ratio > bestOverallRatio) {
            bestOverallRatio = ratio;
            bestOverallId = id;
          }
          if (ratio > bestMenuRatio && desktopItems.some(i => i.id === id)) {
            bestMenuRatio = ratio;
            bestMenuId = id;
          }
        });

        // Batch updates to avoid consecutive renders
        const updates = {};
        let shouldUpdate = false;

        if (bestMenuId && bestMenuRatio > 0 && bestMenuId !== active) {
          sessionStorage.setItem('menuActiveSection', bestMenuId);
          updates.active = bestMenuId;
          shouldUpdate = true;
        }

        if (bestOverallId) {
          const dark = bestOverallId === 'blog';
          if (dark !== isDarkBg) {
            updates.isDarkBg = dark;
            shouldUpdate = true;
          }
        }

        if (shouldUpdate) {
          dispatch({ type: 'UPDATE_STATE', payload: updates });
        }
      },
      { root, threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    allSections.forEach(sec => io.observe(sec));
    return () => io.disconnect();
  }, [desktopItems, active, isDarkBg]); // Added active and isDarkBg to dependencies

  // Logique unifiée pour masquer le menu (section #info OU URLs Snipcart)
  useEffect(() => {
    const root = document.getElementById('scroll-root');
    const infoEl = document.getElementById('info');
    if (!root || !infoEl) return;

    const updateHideMenu = () => {
      const hash = window.location.hash;
      const isSnipcartUrl =
        hash.includes('#/cart') ||
        hash.includes('#/checkout') ||
        hash.includes('#snipcart');

      if (isSnipcartUrl) {
        dispatch({ type: 'UPDATE_STATE', payload: { hideMenu: true } });
        return;
      }

      const rect = infoEl.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const isInfoVisible =
        rect.top < rootRect.bottom && rect.bottom > rootRect.top;
      const intersectionRatio = Math.max(
        0,
        Math.min(
          1,
          (Math.min(rect.bottom, rootRect.bottom) -
            Math.max(rect.top, rootRect.top)) /
            rect.height
        )
      );

      const newHideMenu = isInfoVisible && intersectionRatio > 0.2;
      dispatch({ type: 'UPDATE_STATE', payload: { hideMenu: newHideMenu } });
    };

    const io = new IntersectionObserver(
      _entries => {
        updateHideMenu();
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    io.observe(infoEl);

    const handleHashChange = () => {
      updateHideMenu();
    };
    window.addEventListener('hashchange', handleHashChange);

    updateHideMenu();

    return () => {
      io.disconnect();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (!hydrated || !active) return null;

  // --- MOBILE RENDER ---
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className={`fixed top-8 right-8 z-50 text-xl font-liberation italic tracking-wider transition-opacity duration-300 ${
            shouldHideMobileMenu && !mobileMenuOpen
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100'
          } ${isDarkBg ? 'text-whiteCustom' : 'text-blackCustom'}`}
          onClick={() =>
            dispatch({
              type: 'UPDATE_STATE',
              payload: { mobileMenuOpen: true },
            })
          }
        >
          menu
        </button>

        <div
          ref={mobileOverlayRef}
          className={`fixed inset-0 z-[60] bg-blackCustom text-whiteCustom flex flex-col items-center justify-center transition-transform duration-500 ease-in-out ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-8 right-8 text-xl font-liberation italic"
            onClick={() =>
              dispatch({
                type: 'UPDATE_STATE',
                payload: { mobileMenuOpen: false },
              })
            }
          >
            close
          </button>

          {/* Logo - centré avec les sections du menu */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-greyCustom font-liberation italic text-[32px]">
              Han-Noah
            </span>
            <span className="text-greyCustom font-liberation text-[32px]">
              MASSENGO
            </span>
          </div>

          {/* Links */}
          <ul className="flex flex-col items-center gap-2 mb-12">
            {desktopItems.map(it => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (it.id === 'info') {
                      emitEvent(EVENTS.CONTACT_SHOW);
                      dispatch({
                        type: 'UPDATE_STATE',
                        payload: { mobileMenuOpen: false },
                      });
                    } else {
                      scrollToId(it.id);
                    }
                  }}
                  className="text-4xl font-liberation font-normal uppercase tracking-wide hover:text-gray-400 transition-colors"
                >
                  {it.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Language Switcher - même style que la version desktop */}
          <div className="flex items-center gap-2 text-[20px]">
            {langs.map((lang, i) => (
              <React.Fragment key={lang}>
                <button
                  type="button"
                  onClick={() => handleChangeLang(lang)}
                  className={`uppercase font-bold transition-colors ${
                    locale === lang ? 'text-whiteCustom' : 'text-whiteCustom/60'
                  } hover:text-whiteCustom`}
                >
                  {lang}
                </button>
                {i < langs.length - 1 && (
                  <span className="text-whiteCustom/60">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </>
    );
  }

  // --- DESKTOP RENDER ---
  return (
    <nav
      className={[
        'fixed right-8 top-1/2 -translate-y-1/2 z-50 select-none transition-opacity duration-300',
        shouldHideDesktopMenu
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100 pointer-events-auto',
      ].join(' ')}
      aria-hidden={shouldHideDesktopMenu ? 'true' : undefined}
    >
      <ul className="flex flex-col items-end pr-2">
        {desktopItems.map((it, idx) => {
          const isActive = active === it.id;
          const activeColor = isDarkBg
            ? 'text-whiteCustom'
            : 'text-blackCustom';
          const inactiveColor = isDarkBg
            ? 'text-whiteCustom/60'
            : 'text-accent';
          return (
            <li key={it.id} className={idx > 0 ? '-mt-[8px]' : undefined}>
              <button
                type="button"
                onClick={() => {
                  if (it.id === 'info') {
                    emitEvent(EVENTS.CONTACT_SHOW);
                  } else {
                    scrollToId(it.id);
                  }
                }}
                onWheel={e => {
                  const root = document.getElementById('scroll-root');
                  if (root) root.scrollBy({ top: e.deltaY });
                }}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'pointer-events-auto',
                  'uppercase tracking-wide transition-all duration-200 ease-out',
                  'text-right origin-right',
                  isActive
                    ? `font-bold ${activeColor} scale-110`
                    : `font-normal ${inactiveColor}`,
                  isDarkBg
                    ? 'hover:scale-110 hover:text-whiteCustom'
                    : 'hover:scale-110 hover:text-blackCustom',
                  'text-[28px] md:text-[32px] lg:text-[40px] xl:text-[48px] 2xl:text-[56px] leading-none',
                ].join(' ')}
              >
                {it.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
