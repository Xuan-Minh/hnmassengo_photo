"use client";
import { useTranslations } from "next-intl";
import {
  LanguageSwitcher,
  HomeImageRotation,
  Gallery,
  Blog,
  Shop,
  HomePresentation,
  ContactOverlay,
  ContactContent,
  ContactMarquee,
  IntroOverlay,
  TextScramble,
} from "../../components";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

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

// Liste statique des images à afficher
const imageFiles = [
  "/home/home1.webp",
  "/home/home2.webp",
  "/home/home3.webp",
  "/home/home4.webp",
];

export default function HomePage() {
  const t = useTranslations();

  // Fading refs pour chaque section
  const [homeRef, homeVisible] = useFadeInOnScreen();
  const [presRef, presVisible] = useFadeInOnScreen();
  const [galleryRef, galleryVisible] = useFadeInOnScreen();
  const [blogRef, blogVisible] = useFadeInOnScreen();
  const [shopRef, shopVisible] = useFadeInOnScreen();
  const [contactRef, contactVisible] = useFadeInOnScreen();

  return (
    <>
      <ContactOverlay />
      <LanguageSwitcher />
      <motion.section
        ref={homeRef}
        id="home"
        className="relative h-screen snap-start bg-whiteCustom overflow-hidden flex flex-col lg:block"
        aria-label="Hero"
        initial={{ opacity: 0 }}
        animate={homeVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        {/* Bloc rotation image - centré et plus grand sur mobile, positionnable sur desktop */}
        <div className="flex items-center justify-center pt-20 pb-8 lg:absolute lg:top-[40%] lg:left-0 lg:-translate-y-1/2 w-full lg:w-full z-20 pointer-events-none lg:pt-0 lg:pb-0">
          <HomeImageRotation images={imageFiles} />
        </div>

        {/* Bloc texte - juste en dessous de l'image sur mobile/tablet, bas gauche sur desktop */}
        <div className="px-4 pb-4 lg:absolute lg:bottom-16 lg:left-16 lg:right-auto lg:px-0 lg:pb-0">
          <p className="text-xl lg:text-2xl xl:text-[30px] font-playfair text-neutral-300 tracking-[-0.05em]">
            {t("home.title")}
          </p>
          <div className="mt-2 lg:mt-4">
            <TextScramble
              text="Han-Noah"
              className="text-[52px] lg:text-[64px] xl:text-[80px] leading-none font-playfair italic tracking-[-0.05em] block"
              delay={500}
            />
            <TextScramble
              text="MASSENGO"
              className="mt-0 text-[56px] lg:text-[72px] xl:text-[88px] leading-none font-lexend font-semibold tracking-tight block"
              delay={1500}
            />
          </div>
        </div>

        {/* Rôle - en dessous du nom sur mobile/tablet, à droite sur desktop */}
        <div className="px-4 pb-8 lg:absolute lg:bottom-20 lg:right-[20%] lg:px-0 lg:pb-0 flex justify-end">
          <p className="text-xl lg:text-[28px] xl:text-[36px] font-playfair italic text-neutral-300 tracking-[-0.05em]">
            {t("home.role")}
          </p>
        </div>
      </motion.section>

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
