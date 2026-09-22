/* eslint-disable react-doctor/no-array-index-as-key */
'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffectEvent } from '../../lib/hooks';

import CustomLightbox from './cartel/CustomLightbox';
import ImageMarquee from './cartel/ImageMarquee';

export default function GalleryProjetCartel({ project, onClose }) {
  const t = useTranslations('gallery');

  // Remplacement du useReducer complexe par des états simples
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fermeture avec la touche Echap
  const onKeyDown = useEffectEvent(event => {
    if (event.key === 'Escape' && !lightboxOpen) {
      onClose(); // Appel direct, plus de délai manuel !
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (!project) return null;

  const description = project.description || t('project.defaultDescription');
  const paragraphs = description.split('\n\n');

  return (
    // Ce div englobant a un z-[90000] pour passer par-dessus la galerie
    <m.div
      key="gallery-cartel-wrapper"
      className="fixed inset-0 z-[90000]"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Fond flouté */}
      <m.div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        onClick={onClose} // Un clic à côté ferme instantanément
        aria-hidden="true"
      ></m.div>

      {/* Panneau du cartel */}
      <m.section
        className="absolute inset-0 h-[100dvh] w-full bg-background flex flex-col md:flex-row shadow-2xl pointer-events-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="project-title"
      >
        <main className="flex w-full md:w-[55%] h-full border-r border-blackCustom p-8 md:p-16 flex-col overflow-y-auto bg-background relative z-10">
          <div>
            <button
              type="button"
              onClick={onClose} // Appel direct à la fermeture
              className="font-liberation text-lg text-accent hover:text-blackCustom transition-colors"
              aria-label={t('project.closeOverlayLabel')}
            >
              back
            </button>
          </div>

          <section className="flex flex-col items-start my-8">
            <div className="mb-8">
              <h2
                id="project-title"
                className="text-4xl lg:text-5xl font-liberation mb-2"
              >
                {project.name}
              </h2>
              <div className="flex flex-col gap-1">
                {project.dateDisplay && (
                  <div className="font-liberation text-sm lg:text-base italic text-accent">
                    {project.dateDisplay}
                  </div>
                )}
                <div className="font-liberation text-sm lg:text-base italic text-accent">
                  {project.coords}
                </div>
              </div>
            </div>

            <div className="font-liberation lg:text-lg 2xl:text-xl max-w-2xl 2xl:max-w-6xl leading-relaxed space-y-4">
              {paragraphs.map((p, i) => (
                <p className="text-[14px] lg:text-lg" key={`paragraph-${i}`}>
                  {p}
                </p>
              ))}
            </div>
          </section>
        </main>

        {/* Colonne de droite : Carrousel (desktop uniquement) */}
        <ImageMarquee
          images={project.images}
          onClick={idx => {
            setLightboxIndex(idx);
            setLightboxOpen(true);
          }}
        />
      </m.section>

      {/* Lightbox */}
      <CustomLightbox
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        images={project.images}
        project={project}
      />
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
    dateDisplay: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
