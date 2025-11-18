"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function Blog() {
  const t = useTranslations();
  return (
    <section
      id="blog" /* id distinct pour la détection contraste */
      className="h-screen snap-start flex items-center justify-center bg-blackCustom"
      aria-label="Section blog"
    >
      <h2 className="text-3xl font-semibold text-whiteCustom">
        {t("section3.title")}
      </h2>
    </section>
  );
}
