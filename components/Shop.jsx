"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ShopItem from "./ShopItem";
import ShopOverlay from "./ShopOverlay";

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [total, setTotal] = useState(0);

  // Synchronisation avec Snipcart
  React.useEffect(() => {
    const updateCart = () => {
      if (!window.Snipcart) return;
      const state = window.Snipcart.store.getState();
      const items = state.cart?.items || [];
      const cartTotal = state.cart?.total || 0;

      setCart(Array.isArray(items) ? items : []);
      setTotal(cartTotal);
    }; // Écouter l'événement ready de Snipcart
    document.addEventListener("snipcart.ready", () => {
      updateCart();
      window.Snipcart.store.subscribe(updateCart);
    });

    // Si Snipcart est déjà là
    if (window.Snipcart) {
      updateCart();
      // On s'assure de ne pas souscrire deux fois si possible, mais useEffect [] protège
      // Cependant, subscribe retourne une fonction unsubscribe qu'on pourrait nettoyer
      // Pour simplifier ici on laisse comme ça
    }
  }, []);

  const handleCheckout = () => {
    if (window.Snipcart) {
      window.Snipcart.api.cart.startCheckout();
    }
  };

  const products = [
    {
      id: "1",
      imgDefault: "/home/home1.jpg",
      imgHover: "/home/home2.jpg",
      title: "Name Project",
      price: "20",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    },
    {
      id: "2",
      imgDefault: "/home/home2.jpg",
      imgHover: "/home/home3.jpg",
      title: "Name Project",
      price: "20",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    },
    {
      id: "3",
      imgDefault: "/home/home3.jpg",
      imgHover: "/home/home4.jpg",
      title: "Name Project",
      price: "20",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    },
    {
      id: "4",
      imgDefault: "/home/home4.jpg",
      imgHover: "/home/home1.jpg",
      title: "Name Project",
      price: "20",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    },
  ];

  return (
    <section
      id="shop"
      className="flex h-screen bg-whiteCustom font-playfair snap-start relative"
    >
      {/* Panier */}
      <aside className="w-[320px] border-r border-black/30 p-10 flex flex-col z-10 bg-whiteCustom">
        <h2 className="text-3xl mb-8">cart</h2>

        {cart.length === 0 ? (
          <div className="text-black/40 italic mb-8">empty</div>
        ) : (
          <ul className="space-y-2 mb-8 overflow-y-auto max-h-[60vh]">
            {cart.map((item, index) => (
              <li key={item.id + index} className="flex justify-between">
                <span>
                  {item.quantity} “{item.name}”
                </span>
                <span>{item.price * item.quantity}€</span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-black/30 pt-4 flex justify-between text-lg">
          <span>total</span>
          <span>{total}€</span>
        </div>
        <button
          onClick={handleCheckout}
          className="mt-4 text-gray-300 text-right hover:text-black transition-colors"
          disabled={cart.length === 0}
        >
          → checkout
        </button>
      </aside>

      {/* Produits */}
      <main className="flex-1 h-full flex items-center overflow-hidden">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl xl:max-w-4xl 2xl:max-w-5xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-10 2xl:gap-16 w-full">
              {products.map((product) => (
                <ShopItem
                  key={product.id}
                  imgDefault={product.imgDefault}
                  imgHover={product.imgHover}
                  title={product.title}
                  price={product.price + "€"}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Spacer pour décaler le contenu vers la gauche */}
        <div className="hidden lg:block w-[200px] shrink-0" />
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <ShopOverlay
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
