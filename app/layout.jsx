import "../globals.css";

import Logo from "../components/Logo";
import { Lexend, Playfair_Display } from "next/font/google";
import IntroOverlay from "../components/IntroOverlay";
import RevealRoot from "../components/RevealRoot";

export const metadata = {
  title: "Han-Noah MASSENGO",
  description: "Portfolio Han-Noah Massengo",
};

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lexend",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-playfair",
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={[lexend.className, lexend.variable, playfair.variable].join(
          " "
        )}
      >
        <Logo />
        <IntroOverlay />
        <RevealRoot>{children}</RevealRoot>
      </body>
    </html>
  );
}
