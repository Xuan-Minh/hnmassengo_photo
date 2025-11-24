"use client";

import React from "react";
import ShopItem from "./ShopItem";

export default function Shop() {
  return (
    <section
      id="shop"
      className="flex h-screen bg-whiteCustom font-playfair snap-start"
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

      <main className="flex-1 grid grid-cols-2 gap-10 p-16 justify-items-center">
        <ShopItem
          imgDefault="/img1a.jpg"
          imgHover="/img1b.jpg"
          title="name project"
          price="20€"
        />
        <ShopItem
          imgDefault="/img2a.jpg"
          imgHover="/img2b.jpg"
          title="name project"
          price="20€"
        />
        <ShopItem
          imgDefault="/img3a.jpg"
          imgHover="/img3b.jpg"
          title="name project"
          price="20€"
        />
        <ShopItem
          imgDefault="/img4a.jpg"
          imgHover="/img4b.jpg"
          title="name project"
          price="20€"
        />
      </main>
    </section>
  );
}
