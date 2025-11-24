"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function HomePresentation() {
  const t = useTranslations();
  return (
    <section
      /* id distinct pour la détection contraste */
      className="h-[40vh] flex flex-col items-center justify-center bg-whiteCustom  "
      aria-label="Section de présentation"
    >
      <div className="text-2xl text-center font-playfair italic mb-4 text-accent">
        I develop my artistic sense through my clubs and where I live.
      </div>
    </section>
  );
}
