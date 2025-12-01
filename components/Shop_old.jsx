"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ShopItem from "./ShopItem";
import ShopOverlay from "./ShopOverlay";

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [localCart, setLocalCart] = useState([]);

  // Charger les produits depuis le JSON
  React.useEffect(() => {
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
      .catch((err) => console.error("Failed to load products", err));
  }, []);

  // Calculer le total local
  React.useEffect(() => {
    const newTotal = localCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  }, [localCart]);

  // Fonctions du panier local
  const addToCart = (product) => {
    setLocalCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          { ...product, quantity: 1, uniqueId: `${product.id}-${Date.now()}` },
        ];
      }
    });
  };

  const handleCheckout = () => {
    console.log('Checkout clicked, localCart:', localCart);
    
    if (localCart.length === 0) {
      console.log('Cart is empty');
      return;
    }
    
    // Vérifier si Snipcart est disponible
    console.log('window.Snipcart:', window.Snipcart);
    
    if (typeof window === 'undefined' || !window.Snipcart) {
      console.log('Snipcart not available, trying fallback');
      // Fallback immédiat : cliquer sur le bouton caché
      const hiddenCheckoutBtn = document.querySelector('.snipcart-checkout');
      if (hiddenCheckoutBtn) {
        console.log('Clicking hidden Snipcart button');
        hiddenCheckoutBtn.click();
      } else {
        console.log('No hidden button found, showing alert');
        alert('Snipcart is loading... Please wait a moment and try again.');
      }
      return;
    }
    
    try {
      console.log('Trying to open Snipcart cart');
      
      // Essayer différentes méthodes d'ouverture
      if (window.Snipcart.api && window.Snipcart.api.theme && window.Snipcart.api.theme.cart) {
        window.Snipcart.api.theme.cart.open();
        console.log('Snipcart opened via API');
        
        // Forcer l'affichage en manipulant le DOM après un délai
        setTimeout(() => {
          const snipcartElements = document.querySelectorAll('[id*="snipcart"], [class*="snipcart"]');
          console.log('Found Snipcart elements:', snipcartElements);
          
          snipcartElements.forEach(el => {
            if (el.style.display === 'none' || el.hasAttribute('hidden')) {
              el.style.display = 'block';
              el.removeAttribute('hidden');
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              el.style.zIndex = '99999';
              console.log('Forced element visible:', el);
            }
          });
          
          // Chercher spécifiquement les modales/overlays
          const modals = document.querySelectorAll('[role="dialog"], .modal, .overlay');
          modals.forEach(modal => {
            if (modal.innerHTML.includes('snipcart') || modal.className.includes('snipcart')) {
              modal.style.display = 'block';
              modal.style.visibility = 'visible';
              modal.style.opacity = '1';
              modal.style.zIndex = '99999';
              console.log('Forced modal visible:', modal);
            }
          });
        }, 500);
        
      } else if (window.Snipcart.api && window.Snipcart.api.modal) {
        window.Snipcart.api.modal.show();
        console.log('Snipcart opened via modal');
      } else {
        throw new Error('Snipcart API not fully available');
      }
    } catch (error) {
      console.error('Erreur Snipcart:', error);
      // Fallback: utiliser le bouton caché
      const hiddenCheckoutBtn = document.querySelector('.snipcart-checkout');
      if (hiddenCheckoutBtn) {
        console.log('Using fallback: clicking hidden button');
        hiddenCheckoutBtn.click();
      }
    }
  };

  const removeItem = (uniqueId) => {
    setLocalCart((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  return (
    <section
      id="shop"
      className="flex h-screen bg-whiteCustom font-playfair snap-start relative"
    >
      {/* Panier */}
      <aside className="w-[320px] border-r border-black/30 p-10 flex flex-col z-10 bg-whiteCustom">
        <h2 className="text-3xl mb-8">cart</h2>

        {localCart.length === 0 ? (
          <div className="text-black/40 italic mb-8">empty</div>
        ) : (
          <ul className="space-y-2 mb-8 overflow-y-auto max-h-[60vh]">
            {localCart.map((item) => (
              <CartItem
                key={item.uniqueId}
                item={item}
                onRemove={() => removeItem(item.uniqueId)}
              />
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
          disabled={localCart.length === 0}
        >
          → checkout
        </button>
      </aside>

      {/* Produits */}
      <main className="flex-1 h-full flex items-center overflow-hidden">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl xl:max-w-3xl 2xl:max-w-4xl p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 2xl:gap-16 w-full">
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
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function CartItem({ item, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const price = item.price || 0;
  const quantity = item.quantity || 1;
  const name = item.title || item.name || "Article";

  return (
    <li
      className="flex justify-between items-center relative group cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`absolute -left-6 text-black/60 hover:text-red-600 transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Remove item"
          title="Remove"
        >
          ✕
        </button>
        <span>
          {quantity} “{name}”
        </span>
      </div>
      <span>{price * quantity}€</span>
    </li>
  );
}
