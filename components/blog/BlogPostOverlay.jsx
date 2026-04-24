'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ContactOverlay from '../overlays/ContactOverlay';
import BaseOverlay from '../overlays/BaseOverlay';
import { useTranslations, useLocale } from 'next-intl';
import { extractFirstSentence } from '../../lib/utils';

function ExtrasBlock({ extras }) {
  if (!Array.isArray(extras) || extras.length === 0) return null;
  return (
    <div className="my-6 flex flex-col gap-4">
      {extras.map((extra, idx) => {
        if (!extra?.type) return null;
        if (extra.type === 'audio' && extra.audio?.asset?._ref) {
          // Sanity file URL construction simplifiée (à adapter si tu utilises @sanity/image-url ou autre)
          const fileUrl = extra.audio.asset.url || extra.audio.asset._ref;
          return (
            <audio key={idx} controls className="w-full">
              <source src={fileUrl} />
              Votre navigateur ne supporte pas l'audio.
            </audio>
          );
        }
        if (extra.type === 'youtube' && extra.youtube) {
          // Extraction de l'ID vidéo
          let videoId = null;
          try {
            const url = new URL(extra.youtube);
            if (url.hostname.includes('youtu.be')) {
              videoId = url.pathname.replace('/', '');
            } else if (url.hostname.includes('youtube.com')) {
              videoId = url.searchParams.get('v');
            }
          } catch {}
          return videoId ? (
            <div key={idx} className="aspect-video w-full max-w-xl mx-auto">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-none rounded"
              />
            </div>
          ) : null;
        }
        if (extra.type === 'file' && extra.file?.asset?._ref) {
          const fileUrl = extra.file.asset.url || extra.file.asset._ref;
          return (
            <a
              key={idx}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Télécharger le fichier
            </a>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function BlogPostOverlay({ post, onClose, onPrevious, onNext }) {
  const [contactOpen, setContactOpen] = useState(false);
  const t = useTranslations('blog.post');
  const locale = useLocale();

  if (!post) return null;

  const hasImage = post.image && post.image.trim() !== '';
  const imagePosition = post.imagePosition || 'image-top';

  const postText =
    typeof post.text === 'object' && post.text !== null
      ? post.text[locale]
      : post.text;
  const postTitle =
    typeof post.title === 'object' && post.title !== null
      ? post.title[locale]
      : post.title;

  // Fonctionnement originel :
  // Si pas de titre, on extrait la première phrase pour l'afficher comme titre,
  // mais on garde le texte complet dans le paragraphe (pas de découpe)
  const autoHeadline = !postTitle
    ? extractFirstSentence(postText).headline
    : null;
  const displayTitle = postTitle || autoHeadline;
  const displayText = postText;

  // Extras & position
  const extras = post.extras || [];
  const extrasPosition = post.extrasPosition || 'end';

  const contactSubject = `${displayTitle || post.date} - ${t('reply')}`;

  return (
    <motion.div
      key="blog-post-overlay-wrapper"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <BaseOverlay
        onClose={onClose}
        ariaLabelledBy={displayTitle ? 'blog-post-title' : undefined}
        ariaLabel={displayTitle ? undefined : post.date}
      >
        {/* Contenu principal - Deux mises en page */}
        {hasImage ? (
          // Mise en page AVEC Image (image avant ou après le texte selon imagePosition)
          <div className="flex-1 flex items-start justify-center w-full h-full px-16 md:px-24 py-20 overflow-y-auto">
            <div className="max-w-5xl w-full">
              <div className="mb-8 flex flex-col items-start">
                {/* Date on 2 lines */}
                <div className="text-4xl md:text-5xl lg:text-6xl font-normal text-whiteCustom/60 leading-[0.85]">
                  {post.date}
                </div>
                {/* Title separate */}
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl italic font-normal leading-[0.85] mt-2"
                  id="blog-post-title"
                >
                  &ldquo;{displayTitle}&rdquo;
                </h1>
              </div>

              {/* Image avant le texte */}
              {imagePosition === 'image-top' && (
                <div className="relative w-full mb-10 max-w-xl lg:max-w-lg mx-auto">
                  <Image
                    src={post.image}
                    alt={displayTitle || ''}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 800px, 1000px"
                    priority
                  />
                </div>
              )}

              {/* Extras au début */}
              {extrasPosition === 'start' && <ExtrasBlock extras={extras} />}

              {/* Content - Left aligned and justified */}
              <div className="text-base md:text-lg leading-relaxed text-whiteCustom space-y-4 max-w-2xl mx-auto">
                {displayText?.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-justify indent-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Extras à la fin */}
              {extrasPosition !== 'start' && <ExtrasBlock extras={extras} />}

              {/* Image après le texte */}
              {imagePosition === 'image-bot' && (
                <div className="relative w-full mt-10 max-w-xl lg:max-w-lg mx-auto">
                  <Image
                    src={post.image}
                    alt={displayTitle || ''}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 800px, 1000px"
                    priority
                  />
                </div>
              )}

              {/* Contact Button */}
              <div className="mt-8 flex justify-end max-w-2xl mx-auto">
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-sm text-whiteCustom/60 hover:text-whiteCustom transition-colors italic"
                >
                  {t('contact')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Mise en page SANS Image (même structure que avec image, contenu centré)
          <div className="flex-1 flex items-start justify-center w-full h-full px-16 md:px-24 py-20 overflow-y-auto">
            <div className="max-w-5xl w-full h-full flex flex-col justify-between">
              {/* Date + Title - Left aligned */}
              <div className="mb-8 flex flex-col items-start">
                <div className="text-4xl md:text-5xl lg:text-6xl font-normal text-whiteCustom/60 leading-[0.85]">
                  {post.date}
                </div>
                {/* Title separate */}
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl italic font-normal leading-[0.85] mt-2"
                  id="blog-post-title"
                >
                  &ldquo;{displayTitle}&rdquo;
                </h1>
              </div>

              {/* Extras au début */}
              {extrasPosition === 'start' && <ExtrasBlock extras={extras} />}

              {/* Content - Left aligned and justified */}
              <div className="text-base md:text-lg leading-relaxed text-whiteCustom space-y-4 max-w-2xl mx-auto">
                {displayText?.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Extras à la fin */}
              {extrasPosition !== 'start' && <ExtrasBlock extras={extras} />}

              {/* Contact Button */}
              <div className="flex justify-end max-w-2xl mx-auto mt-4">
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-sm text-whiteCustom/60 hover:text-whiteCustom transition-colors italic ml-4"
                >
                  {t('contact')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="w-full border-t border-whiteCustom/20 px-8 md:px-16 py-6 hidden md:flex items-center justify-center gap-16 shrink-0">
          <button
            onClick={onPrevious}
            className="text-base text-whiteCustom/60 hover:text-whiteCustom transition-colors flex items-center gap-2"
            disabled={!onPrevious}
          >
            previous
          </button>

          <button
            onClick={onNext}
            className="text-base text-whiteCustom/60 hover:text-whiteCustom transition-colors flex items-center gap-2"
            disabled={!onNext}
          >
            next
          </button>
        </div>
      </BaseOverlay>

      <ContactOverlay
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        defaultSubject={contactSubject}
      />
    </motion.div>
  );
}
