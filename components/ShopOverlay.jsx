"use client";
import React from "react";
import { motion } from "framer-motion";

export default function ShopOverlay({ product, onClose, onAddToCart }) {
  if (!product) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-blackCustom text-whiteCustom font-playfair flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header / Back Button */}
      <div className="absolute top-8 left-8 md:left-16 z-50">
        <button
          onClick={onClose}
          className="text-lg text-whiteCustom/60 hover:text-whiteCustom transition-colors"
        >
          back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full h-full p-8 md:p-16 gap-12 md:gap-24">
        {/* Left: Image */}
        <div className="w-full md:w-1/2 max-w-xl aspect-square bg-[#6B66FF] relative shadow-2xl">
          {/* Placeholder color based on design, or real image */}
          <img
            src={product.imgDefault}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-1/3 flex flex-col items-start text-left">
          <h2 className="text-5xl md:text-6xl italic mb-8">{product.title}</h2>

          <p className="text-lg md:text-xl leading-relaxed text-whiteCustom/80 mb-12 max-w-md">
            {product.description ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna."}
          </p>

          <div className="mt-auto">
            <div className="text-3xl font-bold mb-2">{product.price}€</div>
            <button
              className="snipcart-add-item text-xl italic text-whiteCustom/60 hover:text-whiteCustom transition-colors"
              data-item-id={product.id}
              data-item-name={product.title}
              data-item-price={product.price}
              data-item-url="/products.json"
              data-item-description={
                product.description || "Produit disponible"
              }
              data-item-image={product.imgDefault}
              onClick={(e) => {
                console.log("=== ADD TO CART CLICKED ===");
                console.log("Product:", product);
                console.log("Button attributes:");
                console.log("- ID:", product.id);
                console.log("- Name:", product.title);
                console.log("- Price:", product.price);

                // Laisser Snipcart gérer l'ajout naturellement
                // Ne pas appeler onAddToCart car ça peut interférer
                console.log("Letting Snipcart handle the add to cart...");

                // Fermer après un délai plus long
                setTimeout(() => {
                  console.log("Closing overlay...");
                  onClose();
                }, 500);
              }}
            >
              add to cart
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t border-whiteCustom/20 p-8 text-center relative">
        <span className="text-xl italic">
          {product.title.toLowerCase()} - 20XX
        </span>
      </div>
    </motion.div>
  );
}
