"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

// Simple rotating image component. Pass an array of filenames relative to /public/home.
// position: "center" | "left" | "right"
export default function HomeImageRotation({ images = [], interval = 4000, position = "center" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images.length) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, interval]);

  if (!images.length) {
    return null;
  }

  const current = images[index];

  // Positionnement horizontal
  let justify = "justify-center";
  if (position === "left") justify = "justify-start";
  if (position === "right") justify = "justify-end";

  return (
    <div className={`flex ${justify} w-full`}>
      <div className="relative w-[420px] max-w-[60vw] aspect-[3/4] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Image
              src={`/home/${current}`}
              alt=""
              fill
              sizes="(max-width: 768px) 80vw, 420px"
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
