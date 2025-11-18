"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function IntroOverlay() {
  // Couleurs flashy utilisées en fallback si aucune image n'est disponible
  const colors = useMemo(
    () => [
      "#ff0054", // flashy pink
      "#00e0ff", // cyan vif
      "#ffe600", // jaune vif
      "#7cff00", // vert acide
    ],
    []
  );

  // Chemins d'images optionnels (placés dans /public/loading)
  const imageSources = useMemo(
    () => [
      "../loading/loading1.jpg",
      "../loading/loading2.jpg",
      "../loading/loading3.jpg",
      "../loading/loading4.jpg",
    ],
    []
  );

  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const rotateInterval = useRef(null);
  const [loadedImages, setLoadedImages] = useState([]);

  // Affiche toujours l'intro au chargement (plus de gating sessionStorage)
  useEffect(() => {
    setVisible(true);
    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, []);

  // Précharge les images; s'il y en a au moins une qui charge, on les utilisera
  useEffect(() => {
    let isMounted = true;
    const ok = [];
    let completed = 0;
    if (imageSources.length === 0) return;
    imageSources.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        completed += 1;
        ok.push(src);
        if (isMounted && completed === imageSources.length) {
          setLoadedImages(ok);
        }
      };
      img.onerror = () => {
        completed += 1;
        if (isMounted && completed === imageSources.length) {
          setLoadedImages(ok);
        }
      };
      img.src = src;
    });
    return () => {
      isMounted = false;
    };
  }, [imageSources]);

  // Rotation du fond tant que visible (images si dispos, sinon couleurs)
  useEffect(() => {
    if (!visible || isExiting) return;
    const framesCount =
      loadedImages.length > 0 ? loadedImages.length : colors.length;
    rotateInterval.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % framesCount);
    }, 800);
    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, [visible, isExiting, colors.length, loadedImages.length]);

  // Pas de timer: l'intro reste affichée jusqu'au clic sur "Next"

  const dismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
  };

  // Écoute un événement global pour réafficher l'intro à la demande
  useEffect(() => {
    const handler = () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
      setCurrentIndex(0);
      setHovered(false);
      setIsExiting(false);
      setVisible(true);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("intro:show", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("intro:show", handler);
      }
    };
  }, []);

  if (!visible && !isExiting) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={
        loadedImages.length > 0
          ? {
              backgroundImage: `url(${loadedImages[currentIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : { backgroundColor: colors[currentIndex] }
      }
      initial={{ y: 0, opacity: 1 }}
      animate={isExiting ? { y: "-100%", opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (isExiting) {
          setVisible(false);
          setIsExiting(false);
        }
      }}
      onMouseMove={() => setHovered(true)}
      onClick={dismiss}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        className="px-6 py-3 text-lg font-medium font-playfair text-[20px] md:text-[20px] lg:text-[24px] xl:text-[24px] 2xl:text-[24px]"
        style={{
          color: hovered ? "#F4F3F2" : "#C8C7C6",
          opacity: hovered ? 1 : 0.8,
        }}
      >
        → next
      </button>
    </motion.div>
  );
}
