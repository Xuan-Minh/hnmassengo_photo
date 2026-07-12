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
import { useEffectEvent, useIsMobile } from '../../lib/hooks';

// ==========================================
// 1. ÉTAT & RÉDUCTEUR
// ==========================================

const initialState = {
  active: null,
  hydrated: false,
  isDarkBg: false,
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
      },
    });
  }, [dispatch]);
}

function useMenuScrollTracking(dispatch, state, desktopItems) {
  const { active, isDarkBg } = state;

  const handleScroll = useEffectEvent(() => {
    const root = document.getElementById('scroll-root');
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const rootCenter = rootRect.top + rootRect.height / 2;

    const allSections = Array.from(
      root.querySelectorAll('section[id], #home, #info')
    );
    let newlyActiveId = active;

    for (const sec of allSections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= rootCenter && rect.bottom >= rootCenter) {
        newlyActiveId = sec.id;
        break;
      }
    }

    const isDark = newlyActiveId === 'blog';

    const updates = {};

    if (
      newlyActiveId !== active &&
      (desktopItems.some(i => i.id === newlyActiveId) ||
        newlyActiveId === 'home')
    ) {
      sessionStorage.setItem('menuActiveSection', newlyActiveId);
      updates.active = newlyActiveId;
    }
    if (isDark !== isDarkBg) {
      updates.isDarkBg = isDark;
    }

    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'UPDATE_STATE', payload: updates });
    }
  });

  useEffect(() => {
    const root = document.getElementById('scroll-root');
    if (!root) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();

    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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
  }, [mobileMenuOpen, dispatch]);

  return overlayRef;
}

// ==========================================
// 3. SOUS-COMPOSANTS UI
// ==========================================

function MobileMenu({
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
      {/* Bouton Menu (Volant)*/}
      <button
        type="button"
        className={`fixed top-4 right-8 z-50 text-xl font-liberation italic tracking-wider transition-opacity duration-300 opacity-100 ${
          isDarkBg ? 'text-whiteCustom' : 'text-blackCustom'
        }`}
        onClick={() =>
          dispatch({ type: 'UPDATE_STATE', payload: { mobileMenuOpen: true } })
        }
      >
        menu
      </button>

      {/* Overlay Plein Écran */}
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
  const { active, hydrated, isDarkBg, mobileMenuOpen, touchStart } = state;

  const isMobile = useIsMobile(1024);

  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale;

  useMenuInitialization(dispatch);
  useMenuScrollTracking(dispatch, state, desktopItems);

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

  if (!hydrated || !active) return null;

  // On garde la logique de disparition UNIQUEMENT pour le desktop
  const isHiddenState = active === 'home';

  if (isMobile) {
    return (
      <MobileMenu
        // Plus besoin de lui passer shouldHideMobileMenu
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
      shouldHideDesktopMenu={isHiddenState}
      desktopItems={desktopItems}
      active={active}
      isDarkBg={isDarkBg}
      scrollToId={scrollToId}
    />
  );
}
