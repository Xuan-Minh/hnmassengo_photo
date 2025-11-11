import "../globals.css";
import Navbar from "../components/Navbar";
import FooterContact from "../components/FooterContact";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Snipcart CSS (CDN) - configure NEXT_PUBLIC_SNIPCART_API_KEY in .env */}
        <link
          rel="stylesheet"
          href="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.css"
        />
      </head>
      <body>
        <Navbar />
        <LanguageSwitcher />
        <PageTransition>{children}</PageTransition>
        <FooterContact />
        {/* Snipcart element and script - replace NEXT_PUBLIC_SNIPCART_API_KEY in .env */}
        <div
          hidden
          id="snipcart"
          data-api-key={process.env.NEXT_PUBLIC_SNIPCART_API_KEY}
        ></div>
        <script
          async
          src="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.js"
        ></script>
      </body>
    </html>
  );
}
