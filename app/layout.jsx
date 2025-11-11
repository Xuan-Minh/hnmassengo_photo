import "../globals.css";
import { Playfair_Display, Lexend } from "next/font/google";
import Logo from "../components/Logo";
import Navbar from "../components/Navbar";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-lexend",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${lexend.variable}`}>
      <body>
        <Logo />
        {children}
      </body>
    </html>
  );
}
