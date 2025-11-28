"use client";
import React, { useState } from "react";

export default function ShopItem({
  imgDefault,
  imgHover,
  title,
  price,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col items-start w-full cursor-pointer group"
      onClick={onClick}
    >
      <div
        className="relative w-full aspect-square mb-4 bg-gray-200"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={imgDefault}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? "opacity-0" : "opacity-100"}`}
          draggable={false}
        />
        <img
          src={imgHover}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
          draggable={false}
        />
      </div>
      <div className="flex justify-between w-full">
        <span>{title}</span>
        <span>{price}</span>
      </div>
    </div>
  );
}
