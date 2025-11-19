import fs from "fs";
import path from "path";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import HomeImageRotation from "../../components/HomeImageRotation";
import Gallery from "../../components/Gallery";
import Blog from "../../components/Blog";
import Shop from "../../components/Shop";
import ContactOverlay from "../../components/ContactOverlay";

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
      <LanguageSwitcher isDarkBackground={false} />
      <section
        id="home"
        className="relative h-screen snap-start bg-whiteCustom"
        aria-label="Hero"
      >
        {/* Bloc rotation image positionnable (par défaut centre, modifiable) */}
        {/* Position aléatoire (gauche, centre, droite) avec 33% chacune. Si droite, on limite la largeur pour ne pas empiéter sur le menu */}
        {(() => {
          // Random plus naturel : 40% left, 40% right, 20% center
          let pos = "center";
          const r = Math.random();
          if (r < 0.3) pos = "left";
          else if (r < 0.6) pos = "right";
          // Marges fixes 40px (gauche/droite), 20px (centre)
          let extraStyle = "";
          if (pos === "right") extraStyle = "pr-[40px] pl-[320px]";
          if (pos === "left") extraStyle = "pl-[40px] pr-[340px]";
          if (pos === "center") extraStyle = "pl-[20px] pr-[20px]";
          return (
            <div
              className={`absolute top-[40%] left-0 w-full -translate-y-1/2 pointer-events-none ${extraStyle}`}
            >
              <HomeImageRotation images={imageFiles} position={pos} />
            </div>
          );
        })()}

        {/* Bloc texte bas gauche */}
        <div className="absolute bottom-16 left-16">
          <p className="text-[20px] md:text-[26px] font-playfair text-neutral-300 tracking-[-0.05em]">
            {t("home.title")}
          </p>
          <div className="mt-4">
            <h2 className="text-[56px] md:text-[72px] leading-none font-playfair italic tracking-[-0.05em]">
              Han-Noah
            </h2>
            <h2 className="mt-2 text-[64px] md:text-[80px] leading-none font-lexend font-semibold tracking-tight">
              MASSENGO
            </h2>
          </div>
        </div>

        {/* Rôle à droite du bloc nom */}
        <p className="absolute bottom-20 left-[55%] text-[26px] md:text-[32px] font-playfair italic text-neutral-300 tracking-[-0.05em]">
          {t("home.role")}
        </p>
      </section>

      {/* Sections suivantes conservées */}
      <Gallery />
      <Blog />
      <Shop />
      <ContactOverlay />
    </>
  );
}
