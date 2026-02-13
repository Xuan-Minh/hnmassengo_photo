'use client';
import Image from 'next/image';
import BaseOverlay from '../overlays/BaseOverlay';

function localizeField(value, locale) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.fr || value?.en || value?.de || '';
}

export default function ShopOverlay({
  product,
  onClose,
  onAddToCart,
  locale,
  inCart = false,
}) {
  if (!product) return null;

  const displayTitle = localizeField(product.title, locale);
  const displayDescription = localizeField(product.description, locale);

  return (
    <BaseOverlay onClose={onClose} ariaLabelledBy="shop-product-title">
      {/* Main Content - Responsive */}
      {/* Mobile: vertical 50/50, Desktop: inchangé */}
      <div className="flex-1 w-full h-full flex flex-col md:flex-row p-0 md:p-16">
        {/* MOBILE */}
        <div className="block md:hidden w-full">
          {/* Image 50vh */}
          <div className="w-full h-[50vh] flex items-center justify-center bg-blackCustom relative">
            <Image
              src={product.imgDefault}
              alt={displayTitle}
              width={600}
              height={600}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 50vw"
              className="max-h-[30vh] w-auto object-contain mx-auto"
              style={{ objectFit: 'contain', height: 'auto' }}
              priority
            />
          </div>
          {/* Séparateur */}
          <div className="border-t border-whiteCustom/20"></div>
          {/* Infos 50vh */}
          <div className="w-full h-[50vh] flex flex-col items-start text-left p-8 overflow-y-auto bg-blackCustom">
            <h2 className="text-4xl italic mb-6">{displayTitle}</h2>
            <p className="text-base leading-relaxed text-whiteCustom/80 mb-8 max-w-md">
              {displayDescription ||
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna.'}
            </p>
            <div className="mt-auto">
              <div className="text-2xl font-bold mb-2">{product.price}€</div>
              <button
                className={`text-lg italic transition-colors ${
                  inCart
                    ? 'text-whiteCustom/30 cursor-not-allowed'
                    : 'text-whiteCustom/60 hover:text-whiteCustom'
                }`}
                disabled={inCart}
                onClick={() => {
                  if (inCart) return;
                  onAddToCart?.(product);
                  setTimeout(() => {
                    onClose();
                  }, 200);
                }}
              >
                {inCart ? 'in cart' : 'add to cart'}
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
              alt={displayTitle}
              fill
              sizes="50vw"
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          {/* Infos */}
          <div className="w-1/3 flex flex-col items-start text-left">
            <h2 className="text-6xl italic mb-8">{displayTitle}</h2>
            <p className="text-xl leading-relaxed text-whiteCustom/80 mb-12 max-w-md">
              {displayDescription ||
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna.'}
            </p>
            <div className="mt-auto">
              <div className="text-3xl font-bold mb-2">{product.price}€</div>
              <button
                className={`text-xl italic transition-colors ${
                  inCart
                    ? 'text-whiteCustom/30 cursor-not-allowed'
                    : 'text-whiteCustom/60 hover:text-whiteCustom'
                }`}
                disabled={inCart}
                onClick={() => {
                  if (inCart) return;
                  onAddToCart?.(product);
                  setTimeout(() => {
                    onClose();
                  }, 200);
                }}
              >
                {inCart ? 'in cart' : 'add to cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t border-whiteCustom/20 p-8 text-center relative">
        <span className="text-xl italic">
          {(displayTitle || '').toLowerCase()} - 20XX
        </span>
      </div>
    </BaseOverlay>
  );
}
