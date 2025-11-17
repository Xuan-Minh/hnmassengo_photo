import "../globals.css";

import Logo from "../components/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";

export const metadata = {
  title: "Han-Noah MASSENGO",
  description: "Portfolio Han-Noah Massengo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Logo />
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
