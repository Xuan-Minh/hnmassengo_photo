"use client";

import { useTranslations } from "next-intl";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import Gallery from "../../components/Gallery";
import Shop from "../../components/Shop";
import ContactOverlay from "../../components/ContactOverlay";
import Blog from "../../components/Blog";

export default function HomePage() {
  const t = useTranslations();

  // Détecte si le fond est foncé (exemple simple, à adapter selon ta logique)
  // Ici, on considère que la première section est claire, tu peux adapter selon le scroll ou le contexte
  const isDarkBackground = false;

  // Pas de restauration manuelle: le conteneur scroll est dans le RootLayout et persiste

  // La langue est gérée par `LanguageSwitcher`, pas besoin de hooks de navigation ici

  return (
    <>
      <LanguageSwitcher isDarkBackground={isDarkBackground} />
      <section
        id="home"
        className="h-screen snap-start flex items-center justify-center bg-red-200"
        aria-label="Section 1"
      >
        <div className="text-center">
          <h1 className="text-[24px] md:text-[36px] font-playfair tracking-[-0.05em]">
            {t("home.title")}
          </h1>
          <p className="mt-2 playfairTitle">{t("home.subtitle")}</p>
        </div>
      </section>

      <Gallery />
      <Blog />
      <Shop />
      <ContactOverlay />
    </>
  );
}
