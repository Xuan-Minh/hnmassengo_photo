"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function Blog() {
  const t = useTranslations();
  return (
    <section
      id="spaces"
      className="h-screen snap-start flex items-center justify-center bg-green-200"
      aria-label="Section 3"
    >
      <h2 className="text-3xl font-semibold">{t("section3.title")}</h2>
    </section>
  );
}
