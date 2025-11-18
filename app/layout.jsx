import "../globals.css";

import Logo from "../components/Logo";
import { Lexend } from "next/font/google";
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
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={lexend.className}>
        <Logo />
        <IntroOverlay />
        <RevealRoot>{children}</RevealRoot>
      </body>
    </html>
  );
}
