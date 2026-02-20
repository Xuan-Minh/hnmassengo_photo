'use client';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import HomePresentation from '../../components/home/HomePresentation';
import {
  ContactContent,
  ContactMarquee,
} from '../../components/overlays/ContactOverlay';
import HomeSection from '../../components/home/HomeSection';
import { motion } from 'framer-motion';
import { useFadeInOnScreen } from '../../lib/hooks';

// Lazy-load ContactOverlay (modal, non-critique pour LCP)
const ContactOverlay = dynamic(
  () => import('../../components/overlays/ContactOverlay'),
  {
    ssr: false,
    loading: () => null, // Pas de fallback visible
  }
);

const Gallery = dynamic(() => import('../../components/gallery/Gallery'), {
  ssr: false,
  loading: () => <div className="h-screen bg-blackCustom" />,
});

const Blog = dynamic(() => import('../../components/blog/Blog'), {
  ssr: true,
});

const Shop = dynamic(() => import('../../components/shop/Shop'), {
  ssr: true,
});

export default function HomePage() {
  const { locale } = useParams();

  // Fading refs pour chaque section
  const [presRef, presVisible] = useFadeInOnScreen(locale);
  const [galleryRef, galleryVisible] = useFadeInOnScreen(locale);
  const [blogRef, blogVisible] = useFadeInOnScreen(locale);
  const [shopRef, shopVisible] = useFadeInOnScreen(locale);

  return (
    <>
      <ContactOverlay />
      <HomeSection />

      <motion.div
        ref={presRef}
        initial={false}
        animate={presVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        suppressHydrationWarning
      >
        <HomePresentation />
      </motion.div>
      <motion.div
        ref={galleryRef}
        initial={false}
        animate={galleryVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        suppressHydrationWarning
      >
        <Gallery />
      </motion.div>
      <motion.div
        ref={blogRef}
        initial={false}
        animate={blogVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        suppressHydrationWarning
      >
        <Blog />
      </motion.div>
      <motion.div
        ref={shopRef}
        initial={false}
        animate={shopVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        suppressHydrationWarning
      >
        <Shop />
      </motion.div>
      {/* Section Contact - Pas de fade in, toujours visible */}
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
    </>
  );
}
