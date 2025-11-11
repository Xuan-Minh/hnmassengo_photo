"use client";
import { useParams } from "next/navigation";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import de from "../../messages/de.json";

const messages = { fr, en, de };
export default function HomePage() {
  const params = useParams();
  const { locale } = params;
  const t = messages[locale] || messages.fr; // fallback fr
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-center">
        Portfolio Han-Noah MASSENGO
      </h1>
      <p className="text-center mt-4">
        Bienvenue sur le site officiel du photographe Han-Noah MASSENGO.
      </p>
    </main>
  );
}
