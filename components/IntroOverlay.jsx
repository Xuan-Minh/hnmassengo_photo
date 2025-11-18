"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function IntroOverlay() {
  // Plus de couleurs flashy: fond neutre sombre pour éviter tout flash de couleur
  const neutralBackground = "#222222";

  // Liste dynamique des images présentes dans /public/loading (récupérée via API route)
  const [imageSources, setImageSources] = useState([]);

  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const rotateInterval = useRef(null);
  const [loadedImages, setLoadedImages] = useState([]);
  // Survol limité au bouton uniquement (pas de dépendance au mouvement global)

  // Affiche toujours l'intro au chargement (plus de gating sessionStorage)
  useEffect(() => {
    setVisible(true);
    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, []);

  // Récupère la liste des fichiers dans /public/loading
  const fetchedOnceRef = useRef(false);
  useEffect(() => {
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    fetch("/api/loading-images")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.images) && data.images.length > 0) {
          setImageSources(data.images);
        }
      })
      .catch(() => {});
  }, []);

  // Précharge les images une fois la liste obtenue
  useEffect(() => {
    if (imageSources.length === 0) return;
    let isMounted = true;
    const ok = [];
    let done = 0;
    imageSources.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        done += 1;
        ok.push(src);
        if (isMounted && done === imageSources.length) setLoadedImages(ok);
      };
      img.onerror = () => {
        done += 1;
        if (isMounted && done === imageSources.length) setLoadedImages(ok);
      };
      img.src = src;
    });
    return () => {
      isMounted = false;
    };
  }, [imageSources]);

  // Rotation du fond uniquement si des images sont disponibles
  useEffect(() => {
    if (!visible || isExiting) return;
    if (loadedImages.length === 0) return; // pas de rotation sur fallback neutre
    const framesCount = loadedImages.length;
    rotateInterval.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % framesCount);
    }, 800);
    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, [visible, isExiting, loadedImages.length]);

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

  // Mode sans fade: on affiche seulement l'image courante (préchargée). Si aucune image, fond neutre fixe.
  const showImages = loadedImages.length > 0;

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      style={{ backgroundColor: neutralBackground, overflow: "hidden" }}
      initial={{ y: 0, opacity: 1 }}
      animate={isExiting ? { y: "-100%", opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (isExiting) {
          setVisible(false);
          setIsExiting(false);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("intro:dismissed"));
          }
        }
      }}
      onClick={dismiss}
    >
      <div className="relative w-full h-full">
        {showImages && (
          <>
            <img
              key={loadedImages[currentIndex]}
              src={
                loadedImages[currentIndex].startsWith("/loading/")
                  ? loadedImages[currentIndex]
                  : loadedImages[currentIndex].replace(/^\.\./, "")
              }
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
              draggable={false}
              style={{
                pointerEvents: "none",
                userSelect: "none",
                filter: "brightness(0.42) contrast(1.05) saturate(0.9)",
                transform: "scale(1.04)",
                transition: "filter .4s ease",
              }}
            />
            <div className="absolute inset-0 bg-black/35 pointer-events-none z-10" />
          </>
        )}

        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
          <h2
            className="text-whiteCustom flex items-end justify-center gap-4 text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-7xl mb-0"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
          >
            <div className="font-playfair italic leading-none">Han-Noah</div>
            <div className="font-lexend font-bold leading-none">MASSENGO</div>
          </h2>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="px-6 py-3 text-lg font-medium font-playfair text-[18px] md:text-[18px] lg:text-[20px] xl:text-[20px] 2xl:text-[22px]"
            style={{
              color: hovered ? "#F4F3F2" : "#C8C7C6",
              opacity: hovered ? 1 : 0.85,
              transition: "color .3s, opacity .3s",
              backdropFilter: hovered ? "blur(2px)" : "none",
            }}
          >
            <motion.span
              className="inline-block mr-2"
              initial={{ rotate: 0 }}
              animate={{ rotate: isExiting ? -90 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              →
            </motion.span>
            <span>next</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
