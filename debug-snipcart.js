// Debug script pour Snipcart - À exécuter dans la console du navigateur

console.log("=== SNIPCART DEBUG ===");

// 1. Vérifier si Snipcart est chargé
console.log("1. Snipcart loaded:", typeof window.Snipcart !== "undefined");

if (window.Snipcart) {
  console.log("2. Snipcart object:", window.Snipcart);

  if (window.Snipcart.store) {
    const state = window.Snipcart.store.getState();
    console.log("3. Snipcart state:", state);

    if (state.cart) {
      console.log("4. Cart state:", state.cart);
      console.log("5. Cart items:", state.cart.items);
      console.log("6. Cart status:", state.cart.status);
      console.log("7. Cart total:", state.cart.total || state.cart.subtotal);
    }
  }

  if (window.Snipcart.api) {
    console.log("8. Snipcart API available:", window.Snipcart.api);
  }

  if (window.Snipcart.events) {
    console.log("9. Snipcart events available:", window.Snipcart.events);
  }
}

// 2. Vérifier les éléments DOM Snipcart
console.log("10. Snipcart container:", document.getElementById("snipcart"));
console.log(
  "11. Snipcart buttons:",
  document.querySelectorAll(".snipcart-add-item")
);
console.log("12. Snipcart modal:", document.querySelector(".snipcart-modal"));

// 3. Vérifier les boutons dans le panier
setTimeout(() => {
  const cartButtons = document.querySelectorAll(
    '#snipcart button, .snipcart button, [class*="snipcart"] button'
  );
  console.log("13. All cart buttons:", cartButtons);

  cartButtons.forEach((btn, i) => {
    console.log(`    Button ${i}:`, {
      element: btn,
      className: btn.className,
      text: btn.textContent?.trim(),
      type: btn.type,
      disabled: btn.disabled,
    });
  });
}, 2000);

// 4. Tester l'ouverture du panier
window.debugOpenCart = () => {
  if (window.Snipcart && window.Snipcart.api) {
    console.log("Opening Snipcart cart...");
    window.Snipcart.api.theme.cart.open();

    setTimeout(() => {
      console.log("Cart opened, checking buttons...");
      const checkoutButtons = document.querySelectorAll(
        '[class*="checkout"], [class*="primary"], button[type="submit"]'
      );
      console.log("Checkout buttons found:", checkoutButtons);
    }, 1000);
  } else {
    console.log("Snipcart API not available");
  }
};

console.log("Debug functions available:");
console.log("- debugOpenCart() : Ouvre le panier et liste les boutons");
