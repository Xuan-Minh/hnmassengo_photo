import fs from "fs";
import path from "path";
import { useTranslations } from "next-intl";
import {
  LanguageSwitcher,
  HomeImageRotation,
  Gallery,
  Blog,
  Shop,
  HomePresentation,
  ContactOverlay,
  IntroOverlay,
} from "../../components";

export default function HomePage() {
  const t = useTranslations();

  // Collecte dynamique des images du dossier /public/home
  const imagesDir = path.join(process.cwd(), "public", "home");
  let imageFiles = [];
  try {
    imageFiles = fs
      .readdirSync(imagesDir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
  } catch (e) {
    // dossier absent: on ignore
  }

  return (
    <>
      <LanguageSwitcher />
      <section
        id="home"
        className="relative h-screen snap-start bg-whiteCustom overflow-hidden flex flex-col md:block"
        aria-label="Hero"
      >
        {/* Bloc rotation image - centré et plus grand sur mobile, positionnable sur desktop */}
        <div className="flex items-center justify-center pt-20 pb-8 md:absolute md:top-[40%] md:left-auto md:right-0 md:-translate-y-1/2 w-full md:w-auto md:max-w-[calc(100vw-220px)] md:pr-[120px] z-20 pointer-events-none md:pt-0 md:pb-0">
          <HomeImageRotation images={imageFiles} position="center" />
        </div>

        {/* Bloc texte - juste en dessous de l'image sur mobile, bas gauche sur desktop */}
        <div className="px-4 pb-8 md:absolute md:bottom-16 md:left-16 md:right-auto md:px-0 md:pb-0">
          <p className="text-[16px] md:text-[20px] lg:text-[26px] font-playfair text-neutral-300 tracking-[-0.05em]">
            {t("home.title")}
          </p>
          <div className="mt-2 md:mt-4">
            <h2 className="text-[40px] md:text-[56px] lg:text-[72px] leading-none font-playfair italic tracking-[-0.05em]">
              Han-Noah
            </h2>
            <h2 className="mt-0 text-[44px] md:text-[64px] lg:text-[80px] leading-none font-lexend font-semibold tracking-tight">
              MASSENGO
            </h2>
          </div>

          {/* Rôle - en dessous du nom sur mobile, à droite sur desktop */}
          <p className="mt-4 md:mt-0 md:absolute md:bottom-0 md:left-[55%] text-[16px] md:text-[26px] lg:text-[32px] font-playfair italic text-neutral-300 tracking-[-0.05em]">
            {t("home.role")}
          </p>
        </div>
      </section>

      <HomePresentation />
      <Gallery />
      <Blog />
      <Shop />
      <ContactOverlay />
    </>
  );
}
