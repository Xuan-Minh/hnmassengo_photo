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
      <h2 className="text-3xl font-semibold">{t("section2.title")}</h2>
    </section>
  );
}
