import "../globals.css";

import Logo from "../components/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";
import { Lexend } from "next/font/google";
import IntroOverlay from "../components/IntroOverlay";

export const metadata = {
  title: "Han-Noah MASSENGO",
  description: "Portfolio Han-Noah Massengo",
};

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={lexend.className}>
        <Logo />
        <IntroOverlay />
        <main
          id="scroll-root"
          className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
