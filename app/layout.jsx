import "../globals.css";

import Logo from "../components/Logo";
import Navbar from "../components/Navbar";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Logo />
        {children}
      </body>
    </html>
  );
}
