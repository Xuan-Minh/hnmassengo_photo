"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ShopItem from "./ShopItem";
import ShopOverlay from "./ShopOverlay";
import { formatPrice } from "../lib/utils";
import { ANIMATIONS, TIMING } from "../lib/constants";
import { logger } from "../lib/logger";

// Composant CartItem - Affichage simple des articles Snipcart
const CartItem = ({ item }) => {
  return (
    <li className="py-2 border-b border-gray-200/20">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h4 className="text-sm text-gray-800">{item.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-600">
              {item.quantity} × {item.price?.toFixed(2)}€
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {(item.price * item.quantity)?.toFixed(2)}€
          </p>
        </div>
      </div>
    </li>
  );
};

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Charger les produits depuis le JSON
  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((p) => ({
          id: p.id,
          imgDefault: p.image,
          imgHover: p.imgHover,
          title: p.name,
          price: p.price,
          description: p.description,
          url: p.url,
        }));
        setProducts(formatted);
      })
      .catch((err) => logger.error("Failed to load products", err));
  }, []);

  // Synchroniser avec Snipcart - lire l'état du panier
  const syncWithSnipcart = useCallback(() => {
    if (window.Snipcart && window.Snipcart.store) {
      try {
        const state = window.Snipcart.store.getState();
        const items = state.cart.items.items || [];
        const count = state.cart.items.count || 0;

        // Calculer le total manuellement à partir des items pour garantir la précision
        const calculatedTotal = items.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);

        setCartItems(items);
        setCartTotal(calculatedTotal);
        setCartCount(count);

        logger.debug("Cart synced:", { items, total: calculatedTotal, count });
      } catch (error) {
        logger.error("Error syncing with Snipcart:", error);
      }
    }
  }, []);

  // Initialiser Snipcart et écouter les événements
  useEffect(() => {
    const initSnipcart = () => {
      if (window.Snipcart) {
        syncWithSnipcart();

        // Écouter les changements du panier
        if (window.Snipcart.events) {
          window.Snipcart.events.on("item.added", syncWithSnipcart);
          window.Snipcart.events.on("item.removed", syncWithSnipcart);
          window.Snipcart.events.on("item.updated", syncWithSnipcart);
          window.Snipcart.events.on("cart.confirmed", () => {
            logger.debug("Order completed");
            syncWithSnipcart();
          });
        }
      }
    };

    // Attendre que Snipcart soit prêt
    if (document.readyState === "complete") {
      setTimeout(initSnipcart, 1000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(initSnipcart, 1000);
      });
    }

    return () => {
      if (window.Snipcart && window.Snipcart.events) {
        window.Snipcart.events.off("item.added", syncWithSnipcart);
        window.Snipcart.events.off("item.removed", syncWithSnipcart);
        window.Snipcart.events.off("item.updated", syncWithSnipcart);
      }
    };
  }, [syncWithSnipcart]);

  // Fonction pour ajouter directement à Snipcart
  const addToCart = useCallback(
    (product) => {
      const tempBtn = document.createElement("button");
      tempBtn.className = "snipcart-add-item";
      tempBtn.setAttribute("data-item-id", product.id);
      tempBtn.setAttribute("data-item-name", product.title);
      tempBtn.setAttribute("data-item-price", product.price.toString());
      tempBtn.setAttribute(
        "data-item-url",
        product.url || window.location.href
      );
      tempBtn.setAttribute("data-item-description", product.description || "");
      tempBtn.style.display = "none";

      document.body.appendChild(tempBtn);
      tempBtn.click();

      setTimeout(() => {
        document.body.removeChild(tempBtn);
        syncWithSnipcart();
      }, 100);

      logger.debug("Added to Snipcart:", product);
    },
    [syncWithSnipcart]
  );

  return (
    <section
      id="shop"
      className="flex h-screen bg-whiteCustom font-playfair snap-start relative"
    >
      {/* Résumé Panier Permanent */}
      <aside className="w-[320px] border-r border-black/30 p-10 flex flex-col z-10 bg-whiteCustom">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl">cart</h2>
          <span className="text-xs text-black/40">({cartCount})</span>
        </div>

        {/* Contenu du panier */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 mb-8">
            {cartItems.length === 0 ? (
              <div className="text-black/40 italic">empty</div>
            ) : (
              <ul className="space-y-2 overflow-y-auto max-h-[60vh]">
                {cartItems.map((item) => (
                  <CartItem key={item.uniqueId || item.id} item={item} />
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-black/30 pt-4 flex justify-between text-lg mb-4">
            <span>total</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>

          {/* Bouton checkout Snipcart */}
          <button
            className={`snipcart-checkout text-right transition-colors ${
              cartItems.length > 0
                ? "text-gray-300 hover:text-black"
                : "text-black/20 pointer-events-none"
            }`}
          >
            → checkout
          </button>
        </div>
      </aside>

      {/* Produits */}
      <main className="flex-1 h-full flex items-center overflow-hidden">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl xl:max-w-3xl 2xl:max-w-4xl p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 2xl:gap-16 w-full lg:pt-10">
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

      {/* Overlay produit */}
      <AnimatePresence>
        {selectedProduct && (
          <ShopOverlay
            isOpen={!!selectedProduct}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
