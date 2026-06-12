'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useParams } from 'next/navigation';
import { usePathname } from '../../src/i18n/navigation';
import { MENU_ITEMS, LANGUAGES } from '../../lib/constants';
import { EVENTS, emitEvent } from '../../lib/events';
import { useEffectEvent } from '../../lib/hooks';

// ==========================================
// 1. ÉTAT & RÉDUCTEUR
// ==========================================

const initialState = {
  active: null,
  hydrated: false,
  isDarkBg: false,
  hideMenu: false,
  isMobile: false,
  mobileMenuOpen: false,
  touchStart: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// ==========================================
// 2. HOOKS LOGIQUES (MÉTIER)
// ==========================================

function useMenuInitialization(dispatch) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        active: sessionStorage.getItem('menuActiveSection') || 'home',
        hydrated: true,
        isMobile: window.innerWidth < 1024,
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
  }, [dispatch]);
}

function useMenuScrollTracking(dispatch, desktopItems, active, isDarkBg) {
  const handleIntersect = useEffectEvent((entries, ratioMap) => {
    entries.forEach(e => ratioMap.set(e.target.id, e.intersectionRatio));

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
  });

  useEffect(() => {
    const root = document.getElementById('scroll-root');
    if (!root) return;

    const allSections = Array.from(root.querySelectorAll('section[id]'));
    const ratioMap = new Map(allSections.map(s => [s.id, 0]));

    const io = new IntersectionObserver(
      entries => handleIntersect(entries, ratioMap),
      { root, threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    allSections.forEach(sec => io.observe(sec));
    return () => io.disconnect();
  }, [desktopItems]);
}

function useMenuVisibility(dispatch) {
  const updateHideMenu = useEffectEvent(() => {
    const root = document.getElementById('scroll-root');
    const infoEl = document.getElementById('info');
    if (!root || !infoEl) return;

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

    dispatch({
      type: 'UPDATE_STATE',
      payload: { hideMenu: isInfoVisible && intersectionRatio > 0.2 },
    });
  });

  useEffect(() => {
    const root = document.getElementById('scroll-root');
    const infoEl = document.getElementById('info');
    if (!root || !infoEl) return;

    const io = new IntersectionObserver(() => updateHideMenu(), {
      root,
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
    });
    io.observe(infoEl);

    const handleHashChange = () => updateHideMenu();
    window.addEventListener('hashchange', handleHashChange);
    updateHideMenu();

    return () => {
      io.disconnect();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
}

function useMobileGestures(mobileMenuOpen, touchStart, dispatch) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!mobileMenuOpen || !overlayRef.current) return;
    const overlay = overlayRef.current;
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
      } else if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    overlay.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    return () => overlay.removeEventListener('keydown', handleTabKey);
  }, [mobileMenuOpen]);

  const handleTouchMove = useEffectEvent(e => {
    if (!touchStart) return;
    const diff = touchStart - e.touches[0].clientY;
    if (diff > 50) {
      dispatch({
        type: 'UPDATE_STATE',
        payload: { mobileMenuOpen: false, touchStart: null },
      });
    }
  });

  useEffect(() => {
    if (!mobileMenuOpen || !overlayRef.current) return;
    const overlay = overlayRef.current;

    const onTouchStart = e =>
      dispatch({
        type: 'UPDATE_STATE',
        payload: { touchStart: e.touches[0].clientY },
      });
    const onTouchMove = e => handleTouchMove(e);
    const onTouchEnd = () =>
      dispatch({ type: 'UPDATE_STATE', payload: { touchStart: null } });

    overlay.addEventListener('touchstart', onTouchStart, { passive: true });
    overlay.addEventListener('touchmove', onTouchMove, { passive: true });
    overlay.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      overlay.removeEventListener('touchstart', onTouchStart);
      overlay.removeEventListener('touchmove', onTouchMove);
      overlay.removeEventListener('touchend', onTouchEnd);
    };
  }, [mobileMenuOpen, dispatch]); // <-- CORRECTION : dispatch est maintenant inclus dans le tableau !

  return overlayRef;
}

// ==========================================
// 3. SOUS-COMPOSANTS UI
// ==========================================

function MobileMenu({
  shouldHideMobileMenu,
  mobileMenuOpen,
  isDarkBg,
  desktopItems,
  locale,
  dispatch,
  scrollToId,
  handleChangeLang,
  touchStart,
}) {
  const mobileOverlayRef = useMobileGestures(
    mobileMenuOpen,
    touchStart,
    dispatch
  );

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
          dispatch({ type: 'UPDATE_STATE', payload: { mobileMenuOpen: true } })
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

        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-greyCustom font-liberation italic text-[32px]">
            Han-Noah
          </span>
          <span className="text-greyCustom font-liberation text-[32px]">
            MASSENGO
          </span>
        </div>

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

        <div className="flex items-center gap-2 text-[20px]">
          {LANGUAGES.map((lang, i) => (
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
              {i < LANGUAGES.length - 1 && (
                <span className="text-whiteCustom/60">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

function DesktopMenu({
  shouldHideDesktopMenu,
  desktopItems,
  active,
  isDarkBg,
  scrollToId,
}) {
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
                onClick={() =>
                  it.id === 'info'
                    ? emitEvent(EVENTS.CONTACT_SHOW)
                    : scrollToId(it.id)
                }
                onWheel={e => {
                  const root = document.getElementById('scroll-root');
                  if (root) root.scrollBy({ top: e.deltaY });
                }}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'pointer-events-auto uppercase tracking-wide transition-all duration-200 ease-out text-right origin-right',
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

// ==========================================
// 4. COMPOSANT PRINCIPAL
// ==========================================

export default function Menu() {
  const desktopItems = useMemo(() => MENU_ITEMS, []);

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

  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale;

  // Activation des comportements globaux
  useMenuInitialization(dispatch);
  useMenuScrollTracking(dispatch, desktopItems, active, isDarkBg);
  useMenuVisibility(dispatch);

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

  const handleChangeLang = useCallback(
    lang => {
      if (lang !== locale) window.location.href = `/${lang}${pathname}`;
    },
    [locale, pathname]
  );

  // Rendu de sécurité avant l'hydratation
  if (!hydrated || !active) return null;

  if (isMobile) {
    return (
      <MobileMenu
        shouldHideMobileMenu={hideMenu}
        mobileMenuOpen={mobileMenuOpen}
        isDarkBg={isDarkBg}
        desktopItems={desktopItems}
        locale={locale}
        dispatch={dispatch}
        scrollToId={scrollToId}
        handleChangeLang={handleChangeLang}
        touchStart={touchStart}
      />
    );
  }

  return (
    <DesktopMenu
      shouldHideDesktopMenu={hideMenu || active === 'home'}
      desktopItems={desktopItems}
      active={active}
      isDarkBg={isDarkBg}
      scrollToId={scrollToId}
    />
  );
}
