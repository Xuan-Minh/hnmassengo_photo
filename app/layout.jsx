import "../globals.css";
import Navbar from "../components/Navbar";
import FooterContact from "../components/FooterContact";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
