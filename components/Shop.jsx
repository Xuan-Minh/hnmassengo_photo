"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ShopItem from "./ShopItem";
import ShopOverlay from "./ShopOverlay";

// Composant CartItem réutilisé de l'ancien cart
const CartItem = ({ item }) => {
  return (
    <li className="py-2 border-b border-gray-200/20 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-sm text-gray-800">{item.name}</h4>
          <p className="text-xs text-gray-500 mt-1">
            {item.quantity} × {item.price?.toFixed(2)}€
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {(item.totalPrice || item.price * item.quantity)?.toFixed(2)}€
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

  // Reset initial au montage du composant
  React.useEffect(() => {
    setCartItems([]);
    setCartTotal(0);
  }, []);

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

  // État pour savoir si le modal Snipcart est ouvert
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Fonction de synchronisation Snipcart (accessible globalement)
  const updateCartFromSnipcart = React.useCallback(() => {
    try {
      if (window.Snipcart && window.Snipcart.store) {
        const state = window.Snipcart.store.getState();

        // Vérifier si le modal est ouvert
        const modalOpen =
          document.querySelector("#snipcart").style.display !== "none" ||
          document.querySelector(".snipcart-modal") !== null;

        setIsModalOpen(modalOpen);

        if (state && state.cart) {
          console.log("=== SYNC DEBUG ===");
          console.log("Modal open:", modalOpen);
          console.log("Cart status:", state.cart.status);
          console.log("Raw cart items:", state.cart.items);

          // Correction : accéder au bon niveau des items
          let items = [];
          if (state.cart.items && state.cart.items.items) {
            items = Array.isArray(state.cart.items.items)
              ? state.cart.items.items
              : [];
          } else if (Array.isArray(state.cart.items)) {
            items = state.cart.items;
          }

          console.log("Processed items:", items);

          const newTotal =
            items.length === 0
              ? 0
              : state.cart.total || state.cart.subtotal || 0;

          // Ne pas vider le cart si le modal est ouvert et qu'on avait des items
          if (modalOpen && items.length === 0) {
            console.log("Modal open but no items - keeping current cart state");
            return; // Ne pas mettre à jour si modal ouvert et items vide
          }

          // Optimisation : Ne mettre à jour que si les données ont vraiment changé
          setCartItems((prevItems) => {
            if (prevItems.length !== items.length) {
              console.log(
                `Cart updated: ${prevItems.length} → ${items.length} items`
              );
              return items;
            }

            // Vérifier si le contenu a changé (IDs des items)
            const prevIds = prevItems
              .map((item) => `${item.id}-${item.quantity}`)
              .sort();
            const newIds = items
              .map((item) => `${item.id}-${item.quantity}`)
              .sort();
            const hasChanged =
              JSON.stringify(prevIds) !== JSON.stringify(newIds);

            if (hasChanged) {
              console.log("Cart content changed, updating...");
              return items;
            }

            return prevItems; // Pas de changement, garde l'ancien state
          });

          setCartTotal((prevTotal) => {
            if (Math.abs(prevTotal - newTotal) > 0.01) {
              // Changement significatif
              console.log(`Total updated: ${prevTotal} → ${newTotal}`);
              return newTotal;
            }
            return prevTotal;
          });
        } else {
          // Ne pas reset si le modal est ouvert
          if (!modalOpen) {
            setCartItems((prevItems) => {
              if (prevItems.length > 0) {
                console.log("Resetting cart (no cart in state, modal closed)");
                return [];
              }
              return prevItems;
            });

            setCartTotal((prevTotal) => {
              if (prevTotal !== 0) {
                return 0;
              }
              return prevTotal;
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }, []);

  // Synchronisation Snipcart améliorée
  React.useEffect(() => {
    let updateTimeout;

    const debouncedUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        console.log("Debounced update triggered");
        updateCartFromSnipcart();
      }, 100);
    };

    const initSnipcart = () => {
      if (window.Snipcart) {
        console.log("Snipcart loaded, setting up events");

        // Événements Snipcart - plus complets
        const events = [
          "snipcart.ready",
          "cart.ready",
          "item.added",
          "item.removed",
          "item.updated",
          "cart.opened",
          "cart.closed",
          "cart.confirmed",
        ];

        // Écouteurs spéciaux pour les événements de modal
        const handleCartOpened = () => {
          console.log("Cart modal opened");
          setIsModalOpen(true);
        };

        const handleCartClosed = () => {
          console.log("Cart modal closed");
          setIsModalOpen(false);
          // Forcer une mise à jour après fermeture
          setTimeout(() => updateCartFromSnipcart(), 100);
        };

        events.forEach((event) => {
          if (window.Snipcart.events) {
            if (event === "cart.opened") {
              window.Snipcart.events.on(event, handleCartOpened);
            } else if (event === "cart.closed") {
              window.Snipcart.events.on(event, handleCartClosed);
            } else {
              window.Snipcart.events.on(event, debouncedUpdate);
            }
          }
        });

        // Mise à jour initiale
        updateCartFromSnipcart();

        // Polling modéré pour éviter le blinking
        const pollingInterval = setInterval(() => {
          updateCartFromSnipcart();
        }, 1500); // Vérifie toutes les 1.5s

        // Détection globale des clics sur boutons Snipcart
        const handleSnipcartClick = (e) => {
          if (e.target.classList.contains("snipcart-add-item")) {
            console.log("Snipcart add-item button clicked!");
            // Mise à jour immédiate puis après délais courts
            setTimeout(() => updateCartFromSnipcart(), 100);
            setTimeout(() => updateCartFromSnipcart(), 500);
            setTimeout(() => updateCartFromSnipcart(), 1000);
            setTimeout(() => updateCartFromSnipcart(), 2000);
          }
        };

        document.addEventListener("click", handleSnipcartClick);

        // Détection de changements sur window.Snipcart
        const watchSnipcart = () => {
          if (window.Snipcart && window.Snipcart.store) {
            try {
              const currentState = window.Snipcart.store.getState();
              if (
                currentState &&
                currentState.cart &&
                currentState.cart.items
              ) {
                updateCartFromSnipcart();
              }
            } catch (e) {
              // Ignorer les erreurs de lecture
            }
          }
        };

        // Observer les changements moins fréquemment pour éviter le blinking
        const fastPolling = setInterval(watchSnipcart, 800);

        return () => {
          clearInterval(pollingInterval);
          clearInterval(fastPolling);
          document.removeEventListener("click", handleSnipcartClick);
          events.forEach((event) => {
            if (window.Snipcart.events) {
              if (event === "cart.opened") {
                window.Snipcart.events.off(event, handleCartOpened);
              } else if (event === "cart.closed") {
                window.Snipcart.events.off(event, handleCartClosed);
              } else {
                window.Snipcart.events.off(event, debouncedUpdate);
              }
            }
          });
        };
      } else {
        // Réessayer jusqu'à ce que Snipcart soit chargé
        setTimeout(initSnipcart, 200);
      }
    };

    const cleanup = initSnipcart();

    return () => {
      clearTimeout(updateTimeout);
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <section
      id="shop"
      className="flex h-screen bg-whiteCustom font-playfair snap-start relative"
    >
      {/* Résumé Panier Permanent */}
      <aside className="w-[320px] border-r border-black/30 p-10 flex flex-col z-10 bg-whiteCustom">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl">cart</h2>
          {/* Bouton debug pour vider le cache */}
          <button
            onClick={() => {
              console.log("Forcing cart reset...");
              setCartItems([]);
              setCartTotal(0);
              if (window.Snipcart && window.Snipcart.store) {
                // Essayer de vider le panier Snipcart aussi
                try {
                  window.Snipcart.api.theme.cart.clear();
                } catch (e) {
                  console.log("Could not clear Snipcart cart:", e);
                }
              }
            }}
            className="text-xs text-black/20 hover:text-black/40 transition-colors"
          >
            ⟲
          </button>
        </div>

        {/* Contenu du panier Snipcart intégré */}
        <div className="snipcart-summary flex-1 flex flex-col">
          {Array.isArray(cartItems) && cartItems.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  console.log("Modifier button clicked");
                  if (window.Snipcart && window.Snipcart.api) {
                    // Ouvrir le panier Snipcart complet pour permettre l'édition
                    window.Snipcart.api.theme.cart.open();

                    // Debug : lister tous les boutons disponibles après ouverture
                    setTimeout(() => {
                      console.log("=== SNIPCART CART OPENED FOR EDITING ===");
                      const cartButtons = document.querySelectorAll(
                        "#snipcart button, .snipcart button"
                      );
                      cartButtons.forEach((btn, i) => {
                        console.log(
                          `Cart button ${i}:`,
                          btn.className,
                          btn.textContent?.trim()
                        );
                      });
                    }, 500);
                  } else {
                    console.log("Snipcart not available for editing");
                  }
                }}
                className="text-xs text-black/40 hover:text-black transition-colors"
              >
                modifier
              </button>
            </div>
          )}

          <div className="flex-1 mb-8">
            {!Array.isArray(cartItems) || cartItems.length === 0 ? (
              <div className="text-black/40 italic">empty</div>
            ) : (
              <ul className="space-y-2 overflow-y-auto max-h-[60vh]">
                {cartItems.map((item, index) => (
                  <CartItem
                    key={index}
                    item={{
                      name: item.name,
                      quantity: item.quantity,
                      price: item.price,
                      totalPrice: item.totalPrice || item.price * item.quantity,
                    }}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-black/30 pt-4 flex justify-between text-lg mb-4">
            <span>total</span>
            <span>{cartTotal.toFixed(2)}€</span>
          </div>

          <button
            onClick={() => {
              console.log("=== CHECKOUT BUTTON CLICKED ===");
              console.log("Current cart items:", cartItems?.length);
              console.log("Current total:", cartTotal);

              // Debug : voir l'état Snipcart au moment du clic
              if (window.Snipcart && window.Snipcart.store) {
                const state = window.Snipcart.store.getState();
                console.log("Snipcart state at checkout:", state.cart);
                if (state.cart && state.cart.items) {
                  console.log("Items in Snipcart:", state.cart.items);
                }
              }

              // Forcer une mise à jour avant de procéder
              updateCartFromSnipcart();

              if (window.Snipcart && window.Snipcart.api) {
                // Toujours ouvrir le panier Snipcart
                window.Snipcart.api.theme.cart.open();

                // Arrêter temporairement le polling pendant que le modal est ouvert
                const stopPolling = () => {
                  console.log("Stopping polling while modal is open...");
                };

                // Si il y a des articles, essayer d'aller au checkout
                if (Array.isArray(cartItems) && cartItems.length > 0) {
                  setTimeout(() => {
                    // Essayer plusieurs sélecteurs possibles pour le bouton checkout
                    const checkoutSelectors = [
                      ".snipcart__button--primary",
                      ".snipcart-button--primary",
                      "[data-item-checkout]",
                      'button[type="submit"]',
                      ".snipcart-cart-button",
                      ".snipcart__cart__checkout-button",
                    ];

                    let checkoutBtn = null;
                    for (const selector of checkoutSelectors) {
                      checkoutBtn = document.querySelector(selector);
                      if (checkoutBtn) {
                        console.log(
                          `Found checkout button with selector: ${selector}`
                        );
                        break;
                      }
                    }

                    if (checkoutBtn) {
                      console.log("Clicking checkout button");
                      checkoutBtn.click();
                    } else {
                      console.log(
                        "Checkout button not found, available buttons:"
                      );
                      const allButtons = document.querySelectorAll(
                        "#snipcart button, .snipcart button"
                      );
                      allButtons.forEach((btn, i) => {
                        console.log(
                          `Button ${i}:`,
                          btn.className,
                          btn.textContent?.trim()
                        );
                      });
                    }
                  }, 1000); // Augmenter le délai pour laisser le temps au DOM de se construire
                }
              } else {
                console.log("Snipcart not available");
              }
            }}
            className={`text-right transition-colors ${
              Array.isArray(cartItems) && cartItems.length > 0
                ? "text-gray-300 hover:text-black"
                : "text-black/20"
            } cursor-pointer`}
          >
            → checkout
          </button>
        </div>
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

      {/* Overlay produit */}
      <AnimatePresence>
        {selectedProduct && (
          <ShopOverlay
            isOpen={!!selectedProduct}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
