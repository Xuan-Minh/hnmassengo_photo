"use react";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import { useTranslations } from "next-intl";

export default function Gallery() {
  const t = useTranslations();
  return (
    <section
      id="works"
      className="h-screen snap-start flex items-center justify-center bg-yellow-200"
      aria-label="Section 2"
    >
      <main className="grid-cols-5 grid-rows-5"></main>
    </section>
  );
}
