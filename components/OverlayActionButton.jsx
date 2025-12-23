"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

// intent -> default direction mapping
const intentToDirection = {
  back: "left",
  previous: "left",
  next: "right",
  submit: "right",
  "see-more": "down",
};

const directionToDeg = {
  right: 0,
  left: 180,
  up: -90,
  down: 90,
};

export default function OverlayActionButton({
  label = "next",
  onClick,
  // Visual variants
  intent, // 'submit' | 'back' | 'previous' | 'next' | 'see-more'
  direction, // overrides intent default: 'right' | 'left' | 'up' | 'down'
  arrowPosition = "left", // 'left' | 'right'
  size = "md", // 'sm' | 'md' | 'lg'
  // Animation control
  animate = "none", // 'none' | 'exit' | 'click'
  isActive = false, // used when animate === 'exit'
  activeDeltaDeg = 0, // additional rotation when isActive=true
  className = "",
  ariaLabel,
}) {
  const [hovered, setHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const dir = useMemo(
    () => direction || intentToDirection[intent] || "right",
    [direction, intent]
  );
  const baseDeg = directionToDeg[dir] ?? 0;

  const rotateValue = useMemo(() => {
    const extra = animate === "exit" && isActive ? activeDeltaDeg : 0;
    const clickExtra = animate === "click" ? clickCount * 360 : 0;
    return baseDeg + extra + clickExtra;
  }, [animate, isActive, activeDeltaDeg, baseDeg, clickCount]);

  const sizeClasses =
    size === "sm"
      ? "text-[16px] md:text-[16px]"
      : size === "lg"
        ? "text-[22px] md:text-[22px]"
        : "text-[18px] md:text-[18px]";

  const handleClick = (e) => {
    if (animate === "click") setClickCount((c) => c + 1);
    onClick?.(e);
  };

  const Arrow = (
    <motion.span
      className={
        arrowPosition === "left" ? "inline-block mr-2" : "inline-block ml-2"
      }
      initial={false}
      animate={{ rotate: rotateValue }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      →
    </motion.span>
  );

  return (
    <button
      type="button"
      aria-label={ariaLabel || label}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "px-6 py-3 text-lg font-medium font-playfair",
        sizeClasses,
        className,
      ].join(" ")}
      style={{
        color: hovered ? "#F4F3F2" : "#C8C7C6",
        opacity: hovered ? 1 : 0.85,
        transition: "color .3s, opacity .3s",
        backdropFilter: hovered ? "blur(2px)" : "none",
      }}
    >
      {arrowPosition === "left" && Arrow}
      <span>{label}</span>
      {arrowPosition === "right" && Arrow}
    </button>
  );
}
