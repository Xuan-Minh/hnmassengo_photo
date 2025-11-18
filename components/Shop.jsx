"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function Shop() {
  const t = useTranslations();
  return (
    <section
      id="shop"
      className="h-screen snap-start flex items-center justify-center bg-blue-200"
      aria-label="Section 4"
    >
      <h2 className="text-3xl font-semibold">{t("section4.title")}</h2>
    </section>
  );
}
