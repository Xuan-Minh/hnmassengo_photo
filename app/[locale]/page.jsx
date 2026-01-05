'use client';
import { useTranslations } from 'next-intl';
import {
  Gallery,
  Blog,
  Shop,
  HomePresentation,
  ContactOverlay,
  ContactContent,
  ContactMarquee,
  IntroOverlay,
  HomeSection,
} from '../../components';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// Hook utilitaire pour fade-in à la première apparition
function useFadeInOnScreen() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
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
  }, []);
  return [ref, visible];
}

export default function HomePage() {
  const t = useTranslations();

  // Fading refs pour chaque section
  const [presRef, presVisible] = useFadeInOnScreen();
  const [galleryRef, galleryVisible] = useFadeInOnScreen();
  const [blogRef, blogVisible] = useFadeInOnScreen();
  const [shopRef, shopVisible] = useFadeInOnScreen();
  const [contactRef, contactVisible] = useFadeInOnScreen();

  return (
    <>
      <ContactOverlay />
      <HomeSection />

      <motion.div
        ref={presRef}
        initial={{ opacity: 0 }}
        animate={presVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <HomePresentation />
      </motion.div>
      <motion.div
        ref={galleryRef}
        initial={{ opacity: 0 }}
        animate={galleryVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <Gallery />
      </motion.div>
      <motion.div
        ref={blogRef}
        initial={{ opacity: 0 }}
        animate={blogVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <Blog />
      </motion.div>
      <motion.div
        ref={shopRef}
        initial={{ opacity: 0 }}
        animate={shopVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <Shop />
      </motion.div>
      <motion.div
        ref={contactRef}
        initial={{ opacity: 0 }}
        animate={contactVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        {/* Section Contact Inline */}
        <section
          id="info"
          className="relative snap-start bg-blackCustom border-t-2 border-whiteCustom min-h-[clamp(600px,75vh,900px)]"
          aria-label="Contact"
        >
          {/* Contenu principal avec padding pour éviter le marquee */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-8 md:pt-12 lg:pt-16 pb-20 sm:pb-24 md:pb-32 lg:pb-36 xl:pb-40">
            <ContactContent
              idSuffix="-inline"
              headingId="contact-title-inline"
              variant="section"
              defaultSubject=""
            />
          </div>

          {/* Marquee séparé en bas */}
          <ContactMarquee />
        </section>
      </motion.div>
    </>
  );
}
