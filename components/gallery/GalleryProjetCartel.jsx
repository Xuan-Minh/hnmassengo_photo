/* eslint-disable react-doctor/no-array-index-as-key */
'use client';

import { useEffect, useRef, useCallback, useReducer } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffectEvent } from '../../lib/hooks';

import CustomLightbox from './cartel/CustomLightbox';
import ImageMarqueeHorizontal from './cartel/ImageMarqueeHorizontal';
import ImageMarquee from './cartel/ImageMarquee';

const initialState = {
  lightboxOpen: false,
  isClosing: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default function GalleryProjetCartel({ project, onClose }) {
  const t = useTranslations('gallery');

  const [state, dispatch] = useReducer(reducer, initialState);
  const { lightboxOpen, isClosing } = state;

  const closeTimerRef = useRef(null);
  const hasFinalizedCloseRef = useRef(false);

  const finalizeClose = useCallback(() => {
    if (hasFinalizedCloseRef.current) return;
    hasFinalizedCloseRef.current = true;
    onClose();
  }, [onClose]);

  const handleRequestClose = useCallback(() => {
    if (isClosing) return;
    hasFinalizedCloseRef.current = false;
    dispatch({ type: 'UPDATE_STATE', payload: { isClosing: true } });
  }, [isClosing]);

  useEffect(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    hasFinalizedCloseRef.current = false;
    dispatch({
      type: 'UPDATE_STATE',
      payload: { isClosing: false, lightboxOpen: false },
    });
  }, [project?.id]);

  // 1. Création de l'Event pour le Timer
  const onFinalizeClose = useEffectEvent(() => {
    finalizeClose();
  });

  useEffect(() => {
    if (!isClosing) return;

    closeTimerRef.current = setTimeout(() => {
      onFinalizeClose(); // Appel de l'Event
    }, 1150);

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isClosing]); // <-- Le tableau de dépendances est propre

  // 2. Création de l'Event pour le clavier
  const onKeyDown = useEffectEvent(event => {
    if (event.key === 'Escape' && !lightboxOpen) {
      handleRequestClose();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown); // Appel de l'Event
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []); // <-- Le tableau de dépendances est 100% vide !

  if (!project) return null;

  const description = project.description || t('project.defaultDescription');
  const paragraphs = description.split('\n\n');

  return (
    <m.div
      key="gallery-cartel-wrapper"
      exit={{ opacity: 0, transition: { duration: 1, delay: 0.2 } }}
    >
      <m.div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[140] ${isClosing ? 'pointer-events-none' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        onClick={handleRequestClose}
        aria-hidden="true"
      ></m.div>
      <m.section
        className={`fixed inset-0 h-[100dvh] w-full bg-background z-[150] flex flex-col md:flex-row shadow-2xl ${isClosing ? 'pointer-events-none' : ''}`}
        initial={{ x: '100%' }}
        animate={{ x: isClosing ? '100%' : 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          if (isClosing) finalizeClose();
        }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="project-title"
      >
        {/* Version Mobile */}
        <div className="md:hidden w-full h-full flex flex-col relative">
          <button
            type="button"
            onClick={handleRequestClose}
            className="absolute top-6 left-6 z-10 font-liberation text-lg text-accent hover:text-blackCustom transition-colors"
            aria-label={t('project.closeOverlayLabel')}
          >
            back
          </button>

          <div className="h-[50vh] flex-shrink-0 flex items-center">
            <ImageMarqueeHorizontal
              images={project.images}
              onClick={() =>
                dispatch({
                  type: 'UPDATE_STATE',
                  payload: { lightboxOpen: true },
                })
              }
            />
          </div>

          <div className="border-t border-blackCustom/20 flex-shrink-0"></div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="font-liberation text-lg italic text-blackCustom mb-4">
              {project.coords}
            </div>
            <h2
              id="project-title"
              className="text-3xl font-liberation italic mb-6"
            >
              {project.name}
            </h2>
            <div className="font-liberation text-base leading-relaxed space-y-4">
              {paragraphs.map((p, i) => (
                <p key={`paragraph-${i}`}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Version Desktop */}
        <main className="hidden md:flex w-[55%] h-full border-r border-blackCustom p-16 flex-col justify-between overflow-y-auto">
          <div>
            <button
              type="button"
              onClick={handleRequestClose}
              className="font-liberation text-lg text-accent hover:text-blackCustom transition-colors"
              aria-label={t('project.closeOverlayLabel')}
            >
              back
            </button>
          </div>

          <section className="flex flex-col items-start justify-center my-8">
            <h2 id="project-title" className="text-5xl font-liberation mb-8">
              {project.name}
            </h2>
            <div className="font-liberation text-lg 2xl:text-xl max-w-2xl 2xl:max-w-6xl  leading-relaxed space-y-4">
              {paragraphs.map((p, i) => (
                <p key={`paragraph-${i}`}>{p}</p>
              ))}
            </div>
          </section>

          <div className="font-liberation text-xl italic text-blackCustom flex-shrink-0">
            {project.coords}
          </div>
        </main>

        {/* Colonne de droite : Carrousel (desktop uniquement) */}
        <ImageMarquee
          images={project.images}
          onClick={() =>
            dispatch({ type: 'UPDATE_STATE', payload: { lightboxOpen: true } })
          }
        />
      </m.section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <CustomLightbox
            open={lightboxOpen}
            onClose={() =>
              dispatch({
                type: 'UPDATE_STATE',
                payload: { lightboxOpen: false },
              })
            }
            images={project.images}
            project={project}
          />
        )}
      </AnimatePresence>
    </m.div>
  );
}

GalleryProjetCartel.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.any).isRequired,
    coords: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
