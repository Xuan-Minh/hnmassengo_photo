"use client";
import { useState } from "react";
import LoadingScreen from "../components/LoadingScreen";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <html lang="fr">
      <body>
        {isLoading ? (
          <LoadingScreen onFinish={() => setIsLoading(false)} />
        ) : (
          children
        )}
      </body>
    </html>
  );
}
