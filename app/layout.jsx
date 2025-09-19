import "../globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <LanguageSwitcher />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </body>
    </html>
  );
}
