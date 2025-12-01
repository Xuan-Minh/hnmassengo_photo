import "../globals.css";

import Logo from "../components/Logo";
import { Lexend, Playfair_Display } from "next/font/google";
import IntroOverlay from "../components/IntroOverlay";
import RevealRoot from "../components/RevealRoot";
import Script from "next/script";

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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.css"
        />
        <link rel="stylesheet" href="/styles/snipcart-custom.css" />
      </head>
      <body
        className={[lexend.className, lexend.variable, playfair.variable].join(
          " "
        )}
      >
        <Logo />
        <IntroOverlay />
        <RevealRoot>{children}</RevealRoot>

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
