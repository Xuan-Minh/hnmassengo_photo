'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { logger } from '../lib/logger';

export default function ShopOverlay({ product, onClose, onAddToCart }) {
  const previouslyFocusedElement = useRef(null);

  // Mémoriser l'élément actif à l'ouverture
  useEffect(() => {
    if (product) {
      previouslyFocusedElement.current = document.activeElement;
    }
  }, [product]);

  // Rendre le focus à l'élément déclencheur à la fermeture
  useEffect(() => {
    if (!product && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus?.();
    }
  }, [product]);

  if (!product) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-blackCustom text-whiteCustom font-playfair flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-product-title"
    >
      {/* Header / Back Button */}
      <div className="absolute top-8 left-8 md:left-16 z-50">
        <button
          onClick={onClose}
          className="text-lg text-whiteCustom/60 hover:text-whiteCustom transition-colors"
          aria-label="Close product overlay"
        >
          back
        </button>
      </div>

      {/* Main Content - Responsive */}
      {/* Mobile: vertical 50/50, Desktop: inchangé */}
      <div className="flex-1 w-full h-full flex flex-col md:flex-row p-0 md:p-16">
        {/* MOBILE */}
        <div className="block md:hidden w-full">
          {/* Image 50vh */}
          <div className="w-full h-[50vh] flex items-center justify-center bg-blackCustom relative">
            <Image
              src={product.imgDefault}
              alt={product.title}
              width={600}
              height={600}
              sizes="100vw"
              className="max-h-[30vh] w-auto object-contain mx-auto"
              style={{ objectFit: 'contain', height: 'auto' }}
              priority
            />
          </div>
          {/* Séparateur */}
          <div className="border-t border-whiteCustom/20"></div>
          {/* Infos 50vh */}
          <div className="w-full h-[50vh] flex flex-col items-start text-left p-8 overflow-y-auto bg-blackCustom">
            <h2 className="text-4xl italic mb-6">{product.title}</h2>
            <p className="text-base leading-relaxed text-whiteCustom/80 mb-8 max-w-md">
              {product.description ||
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna.'}
            </p>
            <div className="mt-auto">
              <div className="text-2xl font-bold mb-2">{product.price}€</div>
              <button
                className="text-lg italic text-whiteCustom/60 hover:text-whiteCustom transition-colors"
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart(product);
                  }
                  setTimeout(() => {
                    onClose();
                  }, 200);
                }}
              >
                add to cart
              </button>
            </div>
          </div>
        </div>
        {/* DESKTOP */}
        <div className="hidden md:flex flex-1 flex-row items-center justify-center gap-24 w-full h-full">
          {/* Image */}
          <div className="w-1/2 max-w-xl aspect-square relative shadow-2xl flex items-center justify-center">
            <Image
              src={product.imgDefault}
              alt={product.title}
              fill
              sizes="50vw"
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          {/* Infos */}
          <div className="w-1/3 flex flex-col items-start text-left">
            <h2 className="text-6xl italic mb-8">{product.title}</h2>
            <p className="text-xl leading-relaxed text-whiteCustom/80 mb-12 max-w-md">
              {product.description ||
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna.'}
            </p>
            <div className="mt-auto">
              <div className="text-3xl font-bold mb-2">{product.price}€</div>
              <button
                className="snipcart-add-item text-xl italic text-whiteCustom/60 hover:text-whiteCustom transition-colors"
                data-item-id={product.id}
                data-item-price={product.price}
                // 👇 CHANGEMENT ICI : On pointe vers l'API JSON
                data-item-url="/api/products"
                data-item-description={product.description || ''}
                data-item-image={product.imgDefault}
                data-item-name={product.title}
                onClick={() => {
                  setTimeout(() => {
                    onClose();
                  }, 200);
                }}
              >
                add to cart
              </button>
            </div>
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
