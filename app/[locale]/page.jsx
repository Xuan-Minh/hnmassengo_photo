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
        className="relative h-screen snap-start bg-whiteCustom"
        aria-label="Hero"
      >
        {/* Bloc rotation image positionnable (par défaut centre, modifiable) */}
        {(() => {
          // Sur mobile, toujours centré
          const isMobile =
            typeof window !== "undefined" && window.innerWidth < 768;
          let pos = "center";
          if (!isMobile) {
            const r = Math.random();
            if (r < 0.4) pos = "left";
            else if (r < 0.8) pos = "right";
          }
          // Marges fixes desktop, centre sur mobile
          let extraStyle = "z-20";
          if (pos === "right")
            extraStyle += " right-0 max-w-[calc(100vw-220px)] pr-[120px]";
          if (pos === "left") extraStyle += " left-0 pl-[40px]";
          if (pos === "center") extraStyle += " left-1/2 -translate-x-1/2";
          // Sur mobile, toujours centré
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            extraStyle = "z-20 left-1/2 -translate-x-1/2";
          }
          return (
            <div
              className={`absolute top-[40%] w-full -translate-y-1/2 pointer-events-none ${extraStyle}`}
            >
              <HomeImageRotation images={imageFiles} position={pos} />
            </div>
          );
        })()}

        {/* Bloc texte bas gauche */}
        <div className="absolute bottom-16 left-16">
          <p className="text-[20px] mt-0 md:text-[26px] font-playfair text-neutral-300 tracking-[-0.05em]">
            {t("home.title")}
          </p>
          <div className="mt-4">
            <h2 className="text-[56px] md:text-[72px] leading-none font-playfair italic tracking-[-0.05em]">
              Han-Noah
            </h2>
            <h2 className="mt-0 text-[64px] md:text-[80px] leading-none font-lexend font-semibold tracking-tight">
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
