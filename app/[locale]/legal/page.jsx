"use client";
import { useTranslations } from "next-intl";

export default function LegalPage() {
  return (
    <main className="p-8">
      <h2 className="text-3xl font-bold mb-4">Mentions Légales</h2>
      <p>
        Ce site est la propriété de HN Massengo, photographe professionnel.
        Toutes les informations légales sont disponibles ici.
      </p>
    </main>
  );
}
