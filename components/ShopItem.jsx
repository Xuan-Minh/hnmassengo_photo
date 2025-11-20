"use client";
import React, { useState } from "react";

export default function ShopItem({ imgDefault, imgHover, title, price }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="flex flex-col items-start w-[180px]">
      <div
        className="relative w-full aspect-square mb-2 cursor-pointer"
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
