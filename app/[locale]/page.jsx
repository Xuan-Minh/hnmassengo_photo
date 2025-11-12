"use client";

"use client";
import { useParams, useRouter, usePathname } from "next/navigation";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import de from "../../messages/de.json";

const messages = { fr, en, de };
export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = params;
  const t = messages[locale] || messages.fr; // fallback fr

  // Détecte si le fond est foncé (exemple simple, à adapter selon ta logique)
  // Ici, on considère que la première section est claire, tu peux adapter selon le scroll ou le contexte
  const isDarkBackground = false;

  const handleChangeLang = (lang) => {
    if (lang === locale) return;
    let newPath;
    if (/^\/[a-z]{2}/.test(pathname)) {
      newPath = pathname.replace(/^\/[a-z]{2}/, `/${lang}`);
    } else {
      newPath = `/${lang}${pathname}`;
    }
    router.push(newPath);
  };

  return (
    <>
      <LanguageSwitcher
        locale={locale}
        onChange={handleChangeLang}
        isDarkBackground={isDarkBackground}
      />
      <main className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        <section
          className="h-screen snap-start flex items-center justify-center bg-red-200"
          aria-label="Section 1"
        >
          <div className="text-center">
            <h1 className="text-[24px] md:text-[36px] font-playfair tracking-[-0.05em]">
              {t.home?.title ?? "Section 1"}
            </h1>
            <p className="mt-2 playfairTitle">
              {t.home?.subtitle ?? "Teaser section 1"}
            </p>
          </div>
        </section>

        <section
          className="h-screen snap-start flex items-center justify-center bg-yellow-200"
          aria-label="Section 2"
        >
          <h2 className="text-3xl font-semibold">Section 2</h2>
        </section>

        <section
          className="h-screen snap-start flex items-center justify-center bg-green-200"
          aria-label="Section 3"
        >
          <h2 className="text-3xl font-semibold">Section 3</h2>
        </section>

        <section
          className="h-screen snap-start flex items-center justify-center bg-blue-200"
          aria-label="Section 4"
        >
          <h2 className="text-3xl font-semibold">Section 4</h2>
        </section>

        <section
          className="h-screen snap-start flex items-center justify-center bg-purple-200"
          aria-label="Section 5"
        >
          <h2 className="text-3xl font-semibold">Section 5</h2>
        </section>
      </main>
    </>
  );
}
