"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function ContactOverlay() {
  const t = useTranslations();
  return (
    <section
      id="info"
      className="h-50 snap-start flex items-center justify-center bg-blackCustom"
      aria-label="Section Contact"
    >
      <h2 className="text-3xl font-semibold text-whiteCustom">
        {t("section5.title")}
      </h2>
    </section>
  );
}
