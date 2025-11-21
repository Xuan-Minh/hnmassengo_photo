"use react";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import { useTranslations } from "next-intl";

export default function Gallery() {
  const t = useTranslations();
  return (
    <section
      id="works"
      className="h-screen snap-start flex items-center justify-center bg-whiteCustomnpm"
      aria-label="Section 2"
    >
      {/* Panier */}
      <aside className="w-[320px] border-r border-black/30 p-10 flex flex-col">
        <h2 className="text-3xl mb-8">cart</h2>
        <ul className="flex-1 space-y-2 mb-8">
          <li className="flex justify-between">
            <span>1 “name project”</span>
            <span>20€</span>
          </li>
          {/* ...autres items */}
        </ul>
        <div className="border-t border-black/30 pt-4 flex justify-between text-lg">
          <span>total</span>
          <span>100€</span>
        </div>
        <button className="mt-4 text-gray-300 text-right" disabled>
          → checkout
        </button>
      </aside>

      {/* Produits */}

      <main className="flex-1 grid grid-cols-2 gap-10 p-16 justify-items-center"></main>
    </section>
  );
}
