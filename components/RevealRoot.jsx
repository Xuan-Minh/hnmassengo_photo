"use client";
import { useEffect, useState } from "react";

export default function RevealRoot({ children }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const handler = () => setRevealed(true);
    window.addEventListener("intro:dismissed", handler);
    // Si jamais l'intro est déjà partie (refresh sans overlay), on révèle immédiatement après un tick
    const timeout = setTimeout(() => {
      if (!revealed) setRevealed(true);
    }, 2000);
    return () => {
      window.removeEventListener("intro:dismissed", handler);
      clearTimeout(timeout);
    };
  }, [revealed]);

  return (
    <div
      id="scroll-root"
      className="h-screen overflow-y-scroll scroll-smooth transition-opacity duration-700"
      style={{
        opacity: revealed ? 1 : 0,
        pointerEvents: revealed ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
