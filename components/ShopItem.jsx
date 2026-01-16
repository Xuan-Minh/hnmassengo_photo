'use client';
import { useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

export default function ShopItem({
  imgDefault,
  imgHover,
  title,
  price,
  onClick,
  inCart = false,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`flex flex-col items-start w-full group ${
        inCart
          ? 'opacity-40 grayscale cursor-not-allowed pointer-events-none'
          : 'cursor-pointer'
      }`}
      onClick={onClick}
    >
      <div
        className="relative w-full aspect-square mb-4 bg-gray-200"
        onMouseEnter={() => !inCart && setHovered(true)}
        onMouseLeave={() => !inCart && setHovered(false)}
      >
        {/* Image par défaut, optimisée et chargée en priorité */}
        {imgDefault && (
          <Image
            src={imgDefault}
            alt=""
            fill
            sizes="100vw"
            priority
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? 'opacity-0' : 'opacity-100'}`}
            draggable={false}
          />
        )}
        {/* Image hover, optimisée */}
        {imgHover && (
          <Image
            src={imgHover}
            alt=""
            fill
            sizes="100vw"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
            draggable={false}
          />
        )}
      </div>
      <div className="flex justify-between w-full">
        <span>{title}</span>
        <span>{price}</span>
      </div>
      {inCart && (
        <div className="mt-1 text-xs uppercase tracking-wide text-black/60">
          in cart
        </div>
      )}
    </div>
  );
}

ShopItem.propTypes = {
  imgDefault: PropTypes.string.isRequired,
  imgHover: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  inCart: PropTypes.bool,
};
