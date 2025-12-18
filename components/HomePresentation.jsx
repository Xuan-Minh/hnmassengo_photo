"use client";
import React from "react";
import { useTranslations } from "next-intl";
import TextReveal from "./TextReveal";

export default function HomePresentation() {
  const t = useTranslations();
  return (
    <section
      /* id distinct pour la détection contraste */
      className="h-[40vh] flex flex-col items-center justify-center bg-whiteCustom  "
      aria-label="Section de présentation"
    >
      <TextReveal
        text="I develop my artistic sense through my clubs and where I live."
        className="text-lg lg:text-2xl xl:text-3xl text-center font-playfair italic mb-3 lg:mb-4 text-accent"
      />
      <TextReveal
        delay={0.7}
        text="I am passionate about capturing moments that tell a story,"
        className="text-lg lg:text-2xl xl:text-3xl text-left font-playfair italic mb-3 lg:mb-4 text-accent self-start pl-[5vw] lg:pl-[10vw]"
      />
      <TextReveal
        delay={1}
        text="evoke emotions, and showcase the beauty of our world."
        className="text-lg lg:text-2xl xl:text-3xl text-center font-playfair italic mb-3 lg:mb-4 text-blackCustom self-center"
      />
    </section>
  );
}
