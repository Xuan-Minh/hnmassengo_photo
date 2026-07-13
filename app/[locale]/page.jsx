'use client';
import { useParams } from 'next/navigation';
import ContactOverlay from '../../components/overlays/ContactOverlay';
import ContactContent from '../../components/overlays/ContactContent';
import ContactMarquee from '../../components/overlays/ContactMarquee';
import HomePageTabs from '../../components/home/HomePageTabs';
import { LazyMotion, domMax, m } from 'framer-motion';
import { useFadeInOnScreen } from '../../lib/hooks';

import Gallery from '../../components/gallery/Gallery';
import Blog from '../../components/blog/Blog';
import Shop from '../../components/shop/Shop';

export default function HomePage() {
  const { locale } = useParams();

  const [galleryRef, galleryVisible] = useFadeInOnScreen(locale);
  const [blogRef, blogVisible] = useFadeInOnScreen(locale);
  const [shopRef, shopVisible] = useFadeInOnScreen(locale);

  return (
    <>
      <LazyMotion features={domMax} strict>
        <ContactOverlay />
        <HomePageTabs />
        <m.section
          ref={galleryRef}
          id="works"
          initial={false}
          animate={galleryVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          suppressHydrationWarning
        >
          <Gallery />
        </m.section>
        <m.section
          ref={blogRef}
          id="blog"
          initial={false}
          animate={blogVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          suppressHydrationWarning
        >
          <Blog />
        </m.section>
        <m.section
          ref={shopRef}
          id="shop"
          initial={false}
          animate={shopVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          suppressHydrationWarning
        >
          <Shop />
        </m.section>
        <section
          id="info"
          className="relative snap-start bg-blackCustom border-t-2 border-whiteCustom min-h-[clamp(600px,75vh,900px)]"
          aria-label="Contact"
        >
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
      </LazyMotion>
    </>
  );
}
