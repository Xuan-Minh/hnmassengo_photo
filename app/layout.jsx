import "../globals.css";

import Logo from "../components/Logo";
import { Lexend, Playfair_Display } from "next/font/google";
import IntroOverlay from "../components/IntroOverlay";
import RevealRoot from "../components/RevealRoot";
import ErrorBoundary from "../components/ErrorBoundary";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL("https://hannoahmassengo.fr"),
  title: "Han-Noah MASSENGO | Photographer & Visual Artist",
  description:
    "Explore the artistic portfolio of Han-Noah MASSENGO, a photographer capturing moments through light, shadow, and emotion. Discover commissioned works, fine art prints, and visual stories.",
  keywords: [
    "photography",
    "visual art",
    "Han-Noah MASSENGO",
    "fine art",
    "portrait",
    "commissioned work",
    "art prints",
  ],
  authors: [{ name: "Han-Noah MASSENGO" }],
  creator: "Han-Noah MASSENGO",
  openGraph: {
    title: "Han-Noah MASSENGO | Photographer & Visual Artist",
    description:
      "Explore the artistic portfolio of Han-Noah MASSENGO, a photographer capturing moments through light, shadow, and emotion.",
    url: "https://hannoahmassengo.fr",
    siteName: "Han-Noah MASSENGO Portfolio",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/ogimage.webp",
        width: 1200,
        height: 630,
        alt: "Han-Noah MASSENGO Photography Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Han-Noah MASSENGO | Photographer & Visual Artist",
    description: "Explore the artistic portfolio of Han-Noah MASSENGO.",
    images: ["/ogimage.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
  // Canonical statique (page d'accueil FR par défaut)
  const canonicalUrl = "https://hannoahmassengo.fr/fr";

  // Langues disponibles
  const locales = [
    { code: "fr", url: "https://hannoahmassengo.fr/fr" },
    { code: "en", url: "https://hannoahmassengo.fr/en" },
    { code: "de", url: "https://hannoahmassengo.fr/de" },
  ];

  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.css"
        />
        <link rel="stylesheet" href="/styles/snipcart-custom.css" />
        <link
          rel="canonical"
          href={canonicalUrl}
          key="canonical"
        />
        <meta name="theme-color" content="#222222" />
        {/* Balises hreflang pour le SEO multilingue */}
        {locales.map((locale) => (
          <link
            rel="alternate"
            href={locale.url}
            hrefLang={locale.code}
            key={"hreflang-" + locale.code}
          />
        ))}
      </head>
      <body
        className={[lexend.className, lexend.variable, playfair.variable].join(
          " "
        )}
      >
        <ErrorBoundary>
          <Logo />
          <IntroOverlay />
          <RevealRoot>{children}</RevealRoot>
        </ErrorBoundary>

        <div
          id="snipcart"
          data-api-key="MzhiNjU4MDUtYTA2MC00YjA5LTkwYmMtOWIyY2FjOTAyZmZlNjM4OTk4OTA5MTYxNDMxODU0"
          data-config-modal-style="side"
          data-config-add-product-behavior="none"
          hidden
          suppressHydrationWarning
        ></div>
        <Script
          src="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.js"
          strategy="afterInteractive"
          suppressHydrationWarning
        />
      </body>
    </html>
  );
}
