"use client";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
export default function ProjetCarter() {
  <div id="shop" className=" flex h-screen bg-whiteCustom font-playfair">
    {/* Panier */}
    <aside className="w-[320px] border-r border-black/30 p-10 flex flex-col">
      <h2 className="text-3xl mb-8">cart</h2>
      <ul className="flex-1 space-y-2 mb-8">
        <li className="flex justify-between">
          <span>1 “name project”</span>
          <span>20€</span>
        </li>
      </ul>
      <div className="border-t border-black/30 pt-4 flex justify-between text-lg">
        <span>total</span>
        <span>100€</span>
      </div>
      <button className="mt-4 text-gray-300 text-right" disabled>
        → checkout
      </button>
    </aside>

    <main className="flex-1 grid grid-cols-2 gap-10 p-16 justify-items-center"></main>
  </div>;
}
