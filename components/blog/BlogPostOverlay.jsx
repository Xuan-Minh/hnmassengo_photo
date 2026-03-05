'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ContactOverlay from '../overlays/ContactOverlay';
import BaseOverlay from '../overlays/BaseOverlay';
import { useTranslations } from 'next-intl';

export default function BlogPostOverlay({ post, onClose, onPrevious, onNext }) {
  const [contactOpen, setContactOpen] = useState(false);
  const t = useTranslations('blog.post');

  if (!post) return null;

  const hasImage = post.image && post.image.trim() !== '';
  const contactSubject = `${post.title || post.date} - ${t('reply')}`;

  return (
    <motion.div
      key="blog-post-overlay-wrapper"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <BaseOverlay onClose={onClose} ariaLabelledBy="blog-post-title">
        {/* Contenu principal - Deux mises en page */}
        {hasImage ? (
          // Mise en page AVEC Image (Date/Titre, Image, puis Contenu empilé verticalement)
          <div className="flex-1 flex items-start justify-center w-full h-full px-16 md:px-24 py-20 overflow-y-auto">
            <div className="max-w-5xl w-full">
              {/* Date + Title - Left aligned */}
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
                  "{post.title}"
                </h1>
              </div>

              {/* Image */}
              <div className="relative w-full mb-10 max-w-xl lg:max-w-lg mx-auto">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 800px, 1000px"
                  priority
                />
              </div>

              {/* Content - Left aligned and justified */}
              <div className="text-base md:text-lg leading-relaxed text-whiteCustom space-y-4 max-w-2xl mx-auto">
                {post.text?.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>

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
                {/* Date */}
                <div className="text-4xl md:text-5xl lg:text-6xl font-normal text-whiteCustom/60 leading-[0.85]">
                  {post.date}
                </div>
                {/* Title separate */}
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl italic font-normal leading-[0.85] mt-2"
                  id="blog-post-title"
                >
                  &ldquo;{post.title}&rdquo;
                </h1>
              </div>

              {/* Content - Left aligned and justified */}
              <div className="text-base md:text-lg leading-relaxed text-whiteCustom space-y-4 max-w-2xl mx-auto">
                {post.text?.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>

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
