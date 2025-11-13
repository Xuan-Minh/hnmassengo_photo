"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = params;
  const t = useTranslations();
  const mainRef = useRef(null);

  // Détecte si le fond est foncé (exemple simple, à adapter selon ta logique)
  // Ici, on considère que la première section est claire, tu peux adapter selon le scroll ou le contexte
  const isDarkBackground = false;

  // Restaure la position de scroll du conteneur principal si enregistrée
  useEffect(() => {
    try {
      const y = localStorage.getItem("scrollY");
      if (y && mainRef.current) {
        mainRef.current.scrollTop = Number(y);
        localStorage.removeItem("scrollY");
      }
    } catch {}
  }, []);

  // plus besoin de handleChangeLang, LanguageSwitcher gère le changement de langue

  return (
    <>
      <LanguageSwitcher isDarkBackground={isDarkBackground} />
      <main
        id="scroll-root"
        ref={mainRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        <section
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

        <section
          className="h-screen snap-start flex items-center justify-center bg-yellow-200"
          aria-label="Section 2"
        >
          <h2 className="text-3xl font-semibold">{t("section2.title")}</h2>
        </section>

        <section
          className="h-screen snap-start flex items-center justify-center bg-green-200"
          aria-label="Section 3"
        >
          <h2 className="text-3xl font-semibold">{t("section3.title")}</h2>
        </section>

        <section
          className="h-screen snap-start flex items-center justify-center bg-blue-200"
          aria-label="Section 4"
        >
          <h2 className="text-3xl font-semibold">{t("section4.title")}</h2>
        </section>

        <section
          className="h-screen snap-start flex items-center justify-center bg-purple-200"
          aria-label="Section 5"
        >
          <h2 className="text-3xl font-semibold">{t("section5.title")}</h2>
        </section>
      </main>
    </>
  );
}
