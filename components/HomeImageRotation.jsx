"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { TIMING } from "../lib/constants";

// Simple rotating image component. Pass an array of filenames relative to /public/home.
// position: "center" | "left" | "right"
export default function HomeImageRotation({
  images = [],
  interval = TIMING.IMAGE_ROTATION_INTERVAL,
  position = "left",
}) {
  const [index, setIndex] = useState(0);
  const [imgPosition, setImgPosition] = useState(position);
  const lastPosition = useRef(position);
  const [pendingPosition, setPendingPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détection du mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!images.length) return;
    const id = setInterval(() => {
      // Sur mobile, toujours center. Sur desktop, alternance left/center
      if (isMobile) {
        setPendingPosition("center");
      } else {
        const positions = ["left", "center"];
        let nextPos = lastPosition.current;
        let tries = 0;
        while (nextPos === lastPosition.current && tries < 10) {
          nextPos = positions[Math.floor(Math.random() * positions.length)];
          tries++;
        }
        setPendingPosition(nextPos);
      }
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, interval, isMobile]);

  // Quand l'image change, on applique la nouvelle position (après le fade)
  useEffect(() => {
    if (pendingPosition) {
      setTimeout(() => {
        setImgPosition(pendingPosition);
        lastPosition.current = pendingPosition;
        setPendingPosition(null);
      }, 800); // durée du fade (doit matcher AnimatePresence)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!images.length) {
    return null;
  }

  const current = images[index];

  // Positionnement horizontal dynamique
  let justify = "justify-center";
  let marginClass = "";

  // Sur mobile, toujours centré sans marge. Sur desktop, respecter la position
  if (isMobile) {
    justify = "justify-center";
    marginClass = "";
  } else {
    if (imgPosition === "left") {
      justify = "justify-start";
      marginClass = "md:pl-[90px]";
    }
    if (imgPosition === "center") {
      marginClass = "md:pl-[150px]";
    }
  }

  return (
    <div className={`flex ${justify} w-full ${marginClass}`}>
      <div className="relative w-[420px] max-w-[80vw] md:max-w-[60vw] aspect-[3/4] overflow-hidden mx-auto md:mx-0">
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
