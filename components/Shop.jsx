"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ShopItem from "./ShopItem";
import ShopOverlay from "./ShopOverlay";
import { formatPrice } from "../lib/utils";
import { ANIMATIONS } from "../lib/constants";
import { logger } from "../lib/logger";

// Clé pour le localStorage
const CART_STORAGE_KEY = "hnmassengo_cart";

// Fonctions de gestion du panier local
const getLocalCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    logger.error("Error reading cart from localStorage:", error);
    return [];
  }
};

const saveLocalCart = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    logger.error("Error saving cart to localStorage:", error);
  }
};

const clearLocalCart = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    logger.error("Error clearing cart from localStorage:", error);
  }
};

// Composant CartItem avec gestion des quantités
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <li className="py-2 border-b border-gray-200/20 group">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h4 className="text-sm text-gray-800">{item.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() =>
                onUpdateQuantity(item, Math.max(1, item.quantity - 1))
              }
              className="w-5 h-5 flex items-center justify-center text-xs border border-gray-400 hover:bg-gray-100 transition-colors"
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="text-xs text-gray-600 min-w-[20px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item, item.quantity + 1)}
              className="w-5 h-5 flex items-center justify-center text-xs border border-gray-400 hover:bg-gray-100 transition-colors"
              aria-label="Augmenter la quantité"
            >
              +
            </button>
            <span className="text-xs text-gray-500 ml-2">
              × {item.price?.toFixed(2)}€
            </span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <p className="text-sm font-medium">
            {(item.price * item.quantity)?.toFixed(2)}€
          </p>
          <button
            onClick={() => onRemove(item)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
            aria-label="Supprimer l'article"
          >
            supprimer
          </button>
        </div>
      </div>
    </li>
  );
};

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  // Lazy initialization pour éviter de lire localStorage à chaque render
  const [cartItems, setCartItems] = useState(() => getLocalCart());
  const [cartTotal, setCartTotal] = useState(() => {
    const localCart = getLocalCart();
    return localCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });
  const [isSnipcartOpen, setIsSnipcartOpen] = useState(false);

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

  // Fonction pour ajouter au panier local
  const addToLocalCart = useCallback((product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      let newItems;

      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...prevItems,
          {
            id: product.id,
            name: product.title,
            price: product.price,
            quantity: 1,
            url: product.url || window.location.href,
          },
        ];
      }

      saveLocalCart(newItems);
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setCartTotal(total);

      return newItems;
    });
  }, []);

  // Fonction pour mettre à jour la quantité
  const handleUpdateQuantity = useCallback((item, newQuantity) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );

      saveLocalCart(newItems);
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setCartTotal(total);

      return newItems;
    });
  }, []);

  // Fonction pour supprimer un article
  const handleRemoveItem = useCallback((item) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((cartItem) => cartItem.id !== item.id);

      saveLocalCart(newItems);
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setCartTotal(total);

      return newItems;
    });
  }, []);

  // Fonction pour transférer le panier local vers Snipcart et ouvrir le checkout
  const handleCheckout = useCallback(() => {
    if (!cartItems || cartItems.length === 0) {
      logger.debug("Cart is empty, cannot checkout");
      return;
    }

    logger.debug("=== TRANSFERRING CART TO SNIPCART ===");
    logger.debug("Local cart items:", cartItems);

    // Vider le panier Snipcart d'abord (si nécessaire)
    if (window.Snipcart) {
      try {
        // Attendre que Snipcart soit prêt
        if (!window.Snipcart.ready) {
          document.addEventListener("snipcart.ready", () => {
            transferToSnipcart();
          });
        } else {
          transferToSnipcart();
        }
      } catch (error) {
        logger.error("Error during checkout:", error);
      }
    }

    function transferToSnipcart() {
      // Créer des boutons temporaires pour chaque article
      cartItems.forEach((item, index) => {
        setTimeout(() => {
          const tempBtn = document.createElement("button");
          tempBtn.className = "snipcart-add-item";
          tempBtn.setAttribute("data-item-id", item.id);
          tempBtn.setAttribute("data-item-name", item.name);
          tempBtn.setAttribute("data-item-price", item.price.toString());
          tempBtn.setAttribute(
            "data-item-url",
            item.url || window.location.href
          );
          tempBtn.setAttribute("data-item-quantity", item.quantity.toString());
          tempBtn.style.display = "none";

          document.body.appendChild(tempBtn);
          tempBtn.click();

          setTimeout(() => {
            document.body.removeChild(tempBtn);

            // Ouvrir le checkout après avoir ajouté le dernier article
            if (index === cartItems.length - 1) {
              setTimeout(() => {
                const checkoutBtn =
                  document.querySelector(".snipcart-checkout");
                if (checkoutBtn) {
                  checkoutBtn.click();
                  logger.debug("Snipcart checkout opened");
                }
              }, 300);
            }
          }, 100);
        }, index * 150); // Décalage pour chaque article
      });
    }
  }, [cartItems]);

  // Écouter la fermeture du panier Snipcart pour vider le panier local
  useEffect(() => {
    const handleOrderCompleted = () => {
      logger.debug("Order completed, clearing local cart");
      clearLocalCart();
      setCartItems([]);
      setCartTotal(0);
    };

    const handleCartOpened = () => {
      logger.debug("Snipcart cart opened");
      setIsSnipcartOpen(true);
    };

    const handleCartClosed = () => {
      logger.debug("Snipcart cart closed");
      setIsSnipcartOpen(false);
    };

    if (window.Snipcart && window.Snipcart.events) {
      // Écouter les événements Snipcart
      if (typeof window.Snipcart.events.on === "function") {
        window.Snipcart.events.on("order.completed", handleOrderCompleted);
        window.Snipcart.events.on("cart.opened", handleCartOpened);
        window.Snipcart.events.on("cart.closed", handleCartClosed);
      }

      return () => {
        if (typeof window.Snipcart.events.off === "function") {
          window.Snipcart.events.off("order.completed", handleOrderCompleted);
          window.Snipcart.events.off("cart.opened", handleCartOpened);
          window.Snipcart.events.off("cart.closed", handleCartClosed);
        }
      };
    }
  }, []);

  return (
    <section
      id="shop"
      className="flex h-screen bg-whiteCustom font-playfair snap-start relative"
    >
      {/* Résumé Panier Permanent - masqué quand Snipcart est ouvert */}
      <aside
        className={`w-[320px] border-r border-black/30 p-10 flex flex-col z-10 bg-whiteCustom transition-opacity duration-300 ${
          isSnipcartOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl">cart</h2>
          {/* Bouton pour vider le panier local */}
          <button
            onClick={() => {
              logger.debug("Clearing local cart...");
              clearLocalCart();
              setCartItems([]);
              setCartTotal(0);
            }}
            className="text-xs text-black/20 hover:text-black/40 transition-colors"
          >
            ⟲
          </button>
        </div>

        {/* Contenu du panier Snipcart intégré */}
        <div className="snipcart-summary flex-1 flex flex-col">
          <div className="flex-1 mb-8">
            {!Array.isArray(cartItems) || cartItems.length === 0 ? (
              <div className="text-black/40 italic">empty</div>
            ) : (
              <ul className="space-y-2 overflow-y-auto max-h-[60vh]">
                {cartItems.map((item, index) => (
                  <CartItem
                    key={item.uniqueId || index}
                    item={{
                      ...item,
                      name: item.name,
                      quantity: item.quantity,
                      price: item.price,
                      totalPrice: item.totalPrice || item.price * item.quantity,
                    }}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-black/30 pt-4 flex justify-between text-lg mb-4">
            <span>total</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>

          {/* Bouton checkout caché pour Snipcart */}
          <button className="snipcart-checkout hidden" id="hidden-checkout-btn">
            Hidden Checkout
          </button>

          <button
            onClick={handleCheckout}
            className={`text-right transition-colors ${
              Array.isArray(cartItems) && cartItems.length > 0
                ? "text-gray-300 hover:text-black"
                : "text-black/20"
            } cursor-pointer`}
            disabled={!cartItems || cartItems.length === 0}
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
            onAddToCart={addToLocalCart}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
