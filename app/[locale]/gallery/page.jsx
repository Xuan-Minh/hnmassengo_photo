"use client";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Galerie() {
  const [isOpen, setIsOpen] = useState(false);
  const images = [{ src: "/images/photo1.jpg" }, { src: "/images/photo2.jpg" }];

  return (
    <>
      <div>
        {images.map((img, idx) => (
          <img key={idx} src={img.src} alt="" onClick={() => setIsOpen(true)} />
        ))}
      </div>
      <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={images} />
    </>
  );
}
