'use client';

import { useEffect, useMemo, useRef, useCallback, useReducer } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { buildSanityImageUrl } from '../../../lib/imageUtils';
import { getOptimizedImageParams } from '../../../lib/hooks';

const initialState = {
  currentIndex: 0,
  isCurrentLoaded: false,
  hasCurrentError: false,
  touchStart: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'SET_INDEX':
      return {
        ...state,
        currentIndex: action.payload,
        isCurrentLoaded: false,
        hasCurrentError: false,
      };
    default:
      return state;
  }
}

export default function CustomLightbox({ open, onClose, images, project }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { currentIndex, isCurrentLoaded, hasCurrentError, touchStart } = state;
  const decodedSrcsRef = useRef(new Set());

  const getDisplaySrcForIndex = useCallback(
    idx => {
      const raw = images?.[idx];
      return buildSanityImageUrl(raw, {
        ...getOptimizedImageParams('gallery'),
        auto: 'format',
      });
    },
    [images]
  );

  const goToIndex = useCallback(
    nextIndex => {
      if (!images?.length) return;
      const safeIndex =
        ((nextIndex % images.length) + images.length) % images.length;
      const nextSrc = getDisplaySrcForIndex(safeIndex);

      dispatch({ type: 'SET_INDEX', payload: safeIndex });

      // On vérifie immédiatement si la nouvelle image est déjà en cache
      if (decodedSrcsRef.current.has(nextSrc)) {
        dispatch({ type: 'UPDATE_STATE', payload: { isCurrentLoaded: true } });
      }
    },
    [images, getDisplaySrcForIndex]
  );

  const currentDisplaySrc = useMemo(() => {
    const raw = images?.[currentIndex];
    return buildSanityImageUrl(raw, {
      ...getOptimizedImageParams('gallery'),
      auto: 'format',
    });
  }, [images, currentIndex]);

  useEffect(() => {
    if (open) {
      goToIndex(0);
    }
  }, [open, goToIndex]);

  useEffect(() => {
    if (!open) return;
    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        hasCurrentError: false,
        isCurrentLoaded: decodedSrcsRef.current.has(currentDisplaySrc),
      },
    });
  }, [open, currentIndex, currentDisplaySrc]);

  useEffect(() => {
    if (!open || typeof window === 'undefined' || !images?.length) return;

    let cancelled = false;

    const preload = src => {
      if (!src) return;
      const img = new window.Image();
      img.src = src;

      const markReady = () => {
        decodedSrcsRef.current.add(src);
        if (!cancelled && src === currentDisplaySrc) {
          dispatch({
            type: 'UPDATE_STATE',
            payload: { isCurrentLoaded: true },
          });
        }
      };

      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(markReady)
          .catch(() => {});
      } else {
        img.onload = markReady;
      }
    };

    preload(currentDisplaySrc);

    if (images.length > 1) {
      for (let i = 1; i <= 3; i++) {
        const nextIndex = (currentIndex + i) % images.length;
        preload(getDisplaySrcForIndex(nextIndex));
      }
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      preload(getDisplaySrcForIndex(prevIndex));
    }

    return () => {
      cancelled = true;
    };
  }, [open, images, currentIndex, currentDisplaySrc, getDisplaySrcForIndex]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToIndex(currentIndex + 1);
      if (e.key === 'ArrowLeft') goToIndex(currentIndex - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, images.length, currentIndex, goToIndex]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const handleTouchStart = e => {
      dispatch({
        type: 'UPDATE_STATE',
        payload: { touchStart: e.touches[0].clientX },
      });
    };

    const handleTouchEnd = e => {
      if (touchStart === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;

      if (Math.abs(diff) > 50) {
        if (diff > 0) goToIndex(currentIndex + 1);
        else goToIndex(currentIndex - 1);
      }
      dispatch({ type: 'UPDATE_STATE', payload: { touchStart: null } });
    };

    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, false);
      window.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [open, touchStart, currentIndex, goToIndex]);

  if (!open) return null;

  return (
    <m.div
      className="fixed inset-0 h-[100dvh] w-full z-[200] bg-blackCustom text-[#e5e5e5] font-liberation flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-8 landscape:top-2 left-8 z-40 md:hidden">
        <button
          type="button"
          onClick={onClose}
          className="text-lg hover:text-white transition-colors"
        >
          back
        </button>
      </div>

      <div className="flex-1 flex flex-col w-full relative bg-blackCustom md:hidden min-h-0">
        <button
          aria-label="previous image"
          type="button"
          className="absolute left-0 top-14 bottom-12 w-[20%] z-30"
          onClick={() => goToIndex(currentIndex - 1)}
          onKeyPress={e => {
            if (e.key === 'Left') goToIndex(currentIndex - 1);
          }}
          tabIndex={0}
        />
        <button
          aria-label="next image"
          type="button"
          className="absolute right-0 top-14 bottom-12 w-[20%] z-30"
          onClick={() => goToIndex(currentIndex + 1)}
          onKeyPress={e => {
            if (e.key === 'Right') goToIndex(currentIndex + 1);
          }}
          tabIndex={0}
        />

        <div className="flex-1 min-h-0 flex items-center justify-center px-4 pt-14 landscape:pt-2 landscape:pb-1">
          <m.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
          >
            <Image
              src={currentDisplaySrc}
              alt={`${project.name} - Image ${currentIndex + 1} of ${images.length}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              sizes="100vw"
              unoptimized
              fetchPriority="high"
              decoding="async"
              onError={() =>
                dispatch({
                  type: 'UPDATE_STATE',
                  payload: { hasCurrentError: true },
                })
              }
              onLoad={() =>
                dispatch({
                  type: 'UPDATE_STATE',
                  payload: { isCurrentLoaded: true },
                })
              }
              priority
            />
          </m.div>
        </div>

        <div className="flex-shrink-0 text-center italic text-sm py-3 landscape:py-1">
          {currentIndex + 1} / {images.length}
        </div>

        {!isCurrentLoaded && !hasCurrentError && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        {hasCurrentError && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            image unavailable
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-col flex-1 min-h-0 w-full pt-16 pr-16 pl-16">
        <div>
          <button
            type="button"
            onClick={onClose}
            className="font-liberation text-lg hover:text-white transition-colors"
          >
            back
          </button>
        </div>
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none">
            <Image
              src={getDisplaySrcForIndex(
                (currentIndex - 1 + images.length) % images.length
              )}
              alt={`${project.name} - Image précédente`}
              width={300}
              height={200}
              className="w-full h-full object-contain"
              sizes="(max-width: 768px) 100vw, 300px"
              priority={false}
              unoptimized
            />
          </div>

          <div className="relative z-10 h-[60%] w-full max-w-[60%] flex items-center justify-center">
            <m.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                {!isCurrentLoaded && !hasCurrentError && (
                  <div className="absolute inset-0 bg-white/5 animate-pulse" />
                )}
                {hasCurrentError && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/70">
                    image unavailable
                  </div>
                )}
                <Image
                  src={currentDisplaySrc}
                  alt={`${project.name} - Image ${currentIndex + 1} sur ${images.length}`}
                  width={1100}
                  height={800}
                  className={`max-h-[75vh] max-w-[60vw] object-contain transition-opacity duration-300 ${isCurrentLoaded && !hasCurrentError ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 1200px) 70vw, 1100px"
                  unoptimized
                  fetchPriority="high"
                  decoding="async"
                  onError={() =>
                    dispatch({
                      type: 'UPDATE_STATE',
                      payload: { hasCurrentError: true },
                    })
                  }
                  onLoad={() =>
                    dispatch({
                      type: 'UPDATE_STATE',
                      payload: { isCurrentLoaded: true },
                    })
                  }
                  priority
                />
              </div>
            </m.div>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[50%] w-[15%] opacity-40 blur-[2px] pointer-events-none">
            <Image
              src={getDisplaySrcForIndex((currentIndex + 1) % images.length)}
              alt="suivante"
              width={300}
              height={200}
              className="w-full h-full object-contain"
              sizes="(max-width: 768px) 100vw, 300px"
              priority={false}
              unoptimized
            />
          </div>

          <button
            className="absolute left-0 top-0 h-full w-[20%] z-30 flex items-center justify-start pl-8 md:pl-0 group cursor-pointer"
            onClick={() => goToIndex(currentIndex - 1)}
            onKeyPress={e => {
              if (e.key === 'Left') goToIndex(currentIndex - 1);
            }}
            tabIndex={0}
            type="button"
          >
            <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              previous
            </span>
          </button>

          <button
            type="button"
            className="absolute right-0 top-0 h-full w-[20%] z-30 flex items-center justify-end pr-8 md:pr-0 group cursor-pointer"
            onClick={() => goToIndex(currentIndex + 1)}
            onKeyPress={e => {
              if (e.key === 'Right') goToIndex(currentIndex + 1);
            }}
            tabIndex={0}
          >
            <span className="text-xl italic text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              next
            </span>
          </button>
        </div>
      </div>

      <footer className="hidden md:flex w-full flex-shrink-0 border-t border-whiteCustom/20 px-8 md:px-16 py-6 items-center justify-between mt-auto">
        <div className="text-xl italic">{project.coords}</div>
        <div className="text-xl">{project.name}</div>
      </footer>
    </m.div>
  );
}
