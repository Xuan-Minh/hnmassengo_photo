"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function ContactOverlay() {
  const t = useTranslations();
  return (
    <section
      id="info"
      className="h-screen snap-start flex items-center justify-center bg-purple-200"
      aria-label="Section 5"
    >
      <h2 className="text-3xl font-semibold">{t("section5.title")}</h2>
    </section>
  );
}
