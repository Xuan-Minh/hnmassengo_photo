'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => mod.AnimatePresence),
  { ssr: false }
);
import ContactOverlay from './ContactOverlay';

export default function BlogPostOverlay({ post, onClose, onPrevious, onNext }) {
  const [contactOpen, setContactOpen] = useState(false);
  const previouslyFocusedElement = useRef(null);

  // Mémoriser l'élément actif à l'ouverture
  useEffect(() => {
    if (post) {
      previouslyFocusedElement.current = document.activeElement;
    }
  }, [post]);

  // Rendre le focus à l'élément déclencheur à la fermeture
  useEffect(() => {
    if (!post && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus?.();
    }
  }, [post]);

  if (!post) return null;

  const hasImage = post.image && post.image.trim() !== '';
  const contactSubject = `${post.title || post.date} - Reply`;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-blackCustom text-whiteCustom font-playfair flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-post-title"
      >
        {/* Header / Back Button */}
        <div className="absolute top-8 left-8 md:left-16 z-50">
          <button
            onClick={onClose}
            className="text-lg text-whiteCustom/60 hover:text-whiteCustom transition-colors"
            aria-label="Close blog post overlay"
          >
            back
          </button>
        </div>

        {/* Contenu principal - Deux mises en page */}
        {hasImage ? (
          // Mise en page AVEC Image (Date/Titre, Image, puis Contenu empilé verticalement)
          <div className="flex-1 flex items-start justify-center w-full h-full px-16 md:px-24 py-20 overflow-y-auto">
            <div className="max-w-5xl w-full">
              {/* Date + Title - Left aligned */}
              <div className="mb-8 flex flex-col items-start">
                {/* Date on 2 lines */}
                <div className="text-4xl md:text-5xl lg:text-6xl font-norma text-accent leading-[0.85]">
                  {post.date}
                </div>
                {/* Title separate */}
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl italic font-normal leading-[0.85] mt-2"
                  id="blog-post-title"
                >
                  {post.title}
                </h1>
              </div>

              {/* Image */}
              <div className="relative w-full mb-10 max-w-xl lg:max-w-2xl mx-auto">
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
                  contact↗
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Mise en page SANS Image (Contenu centré)
          <div className="flex-1 flex items-center justify-center w-full h-full px-16 md:px-24 py-20 overflow-hidden">
            <div className="max-w-3xl w-full">
              {/* Date + Title - Left aligned */}
              <div className="mb-12">
                {/* Date on 2 lines */}
                <div className="text-7xl md:text-8xl lg:text-9xl font-normal leading-[0.85]">
                  {post.date?.split(' ')[0] || '12'}{' '}
                  {post.date?.split(' ')[1] || 'oct.'}
                </div>
                <div className="text-7xl md:text-8xl lg:text-9xl font-normal leading-[0.85]">
                  {post.date?.split(' ')[2] || '2025'}
                </div>
                {/* Title separate */}
                <h1 className="text-7xl md:text-8xl lg:text-9xl italic font-normal leading-[0.85] mt-0">
                  {post.title}
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
              <div className="mt-8 flex justify-end max-w-2xl mx-auto">
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-sm text-whiteCustom/60 hover:text-whiteCustom transition-colors italic"
                >
                  contact↗
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="w-full border-t border-whiteCustom/20 px-8 md:px-16 py-6 flex items-center justify-center gap-16 shrink-0">
          <button
            onClick={onPrevious}
            className="text-base text-whiteCustom/60 hover:text-whiteCustom transition-colors flex items-center gap-2"
            disabled={!onPrevious}
          >
            <span>←</span> previous
          </button>

          <button
            onClick={onNext}
            className="text-base text-whiteCustom/60 hover:text-whiteCustom transition-colors flex items-center gap-2"
            disabled={!onNext}
          >
            next <span>→</span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {contactOpen && (
          <ContactOverlay
            open={contactOpen}
            onClose={() => setContactOpen(false)}
            defaultSubject={contactSubject}
          />
        )}
      </AnimatePresence>
    </>
  );
}
