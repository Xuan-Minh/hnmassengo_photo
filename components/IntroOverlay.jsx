"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import OverlayActionButton from "./OverlayActionButton";
import { EVENTS, emitEvent, addEventHandler } from "../lib/events";

export default function IntroOverlay() {
  const previouslyFocusedElement = useRef(null);
  // Plus de couleurs flashy: fond neutre sombre pour éviter tout flash de couleur
  const neutralBackground = "#222222";

  // Liste dynamique des images présentes dans /public/loading (chargée depuis JSON statique)
  const [imageSources, setImageSources] = useState([]);

  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const rotateInterval = useRef(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isReTrigger, setIsReTrigger] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const overlayRef = useRef(null);
  // Survol limité au bouton uniquement (pas de dépendance au mouvement global)

  // Affiche toujours l'intro au chargement (plus de gating sessionStorage)
  useEffect(() => {
    setVisible(true);
    previouslyFocusedElement.current = document.activeElement;
    return () => {
      if (rotateInterval.current) clearInterval(rotateInterval.current);
    };
  }, []);

  // Rendre le focus à l'élément déclencheur à la fermeture
  useEffect(() => {
    if (!visible && previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus?.();
    }
  }, [visible]);

  // Charge la liste des fichiers depuis le JSON statique généré au build
  const fetchedOnceRef = useRef(false);
  useEffect(() => {
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    // Charger depuis le fichier JSON statique
    fetch("/loading-images-data.json")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.images) && data.images.length > 0) {
          setImageSources(data.images);
        }
      })
      .catch(() => {
        // Fallback: essayer l'API si le JSON n'existe pas
        fetch("/api/loading-images")
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data.images) && data.images.length > 0) {
              setImageSources(data.images);
            }
          })
          .catch(() => {});
      });
  }, []);

  // Précharge les images de manière progressive - commence dès qu'une image est prête
  useEffect(() => {
    if (imageSources.length === 0) return;
    let isMounted = true;
    const ok = [];
    let done = 0;

    imageSources.forEach((src) => {
      // Utilise le constructeur natif window.Image côté client uniquement
      const img = typeof window !== "undefined" ? new window.Image() : null;
      if (!img) return;

      img.onload = () => {
        done += 1;
        ok.push(src);

        // Dès qu'au moins une image est chargée, commencer l'animation
        if (isMounted && ok.length === 1) {
          setLoadedImages([src]);
        }
        // Mettre à jour la liste complète quand toutes sont chargées
        else if (isMounted && done === imageSources.length) {
          setLoadedImages(ok);
        }
      };

      img.onerror = () => {
        done += 1;
        // Même en cas d'erreur, continuer avec les images qui fonctionnent
        if (isMounted && done === imageSources.length) {
          setLoadedImages(ok);
        }
      };

      img.src = src;
    });

    return () => {
      isMounted = false;
    };
  }, [imageSources]);

  // Rotation du fond dès qu'au moins une image est disponible
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
      setIsReTrigger(true);
      setVisible(true);
    };
    const cleanup = addEventHandler(EVENTS.INTRO_SHOW, handler);
    return cleanup;
  }, []);

  if (!visible && !isExiting) return null;

  // Mode sans fade: on affiche seulement l'image courante (préchargée). Si aucune image, fond neutre fixe.
  const showImages = loadedImages.length > 0;

  // Swipe up pour fermer (mobile)
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;

    const currentTouch = e.touches[0].clientY;
    const diff = touchStart - currentTouch;

    // Si swipe up d'au moins 50px
    if (diff > 50) {
      dismiss();
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-[100]"
      style={{ backgroundColor: neutralBackground, overflow: "hidden" }}
      initial={isReTrigger ? { y: "-100%", opacity: 1 } : { y: 0, opacity: 1 }}
      animate={isExiting ? { y: "-100%", opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (isExiting) {
          setVisible(false);
          setIsExiting(false);
          setIsReTrigger(false); // Réinitialiser pour la prochaine fois
          emitEvent(EVENTS.INTRO_DISMISSED);
        }
      }}
      onClick={dismiss}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        {showImages && (
          <>
            <Image
              key={loadedImages[currentIndex]}
              src={
                loadedImages[currentIndex].startsWith("/loading/")
                  ? loadedImages[currentIndex]
                  : loadedImages[currentIndex].replace(/^\.\./, "")
              }
              alt=""
              fill
              className="absolute inset-0 w-full h-full object-cover z-0"
              draggable={false}
              style={{
                pointerEvents: "none",
                userSelect: "none",
                filter: "brightness(0.42) contrast(1.05) saturate(0.9)",
                transform: "scale(1.04)",
                transition: "filter .4s ease",
              }}
              sizes="100vw"
              priority={currentIndex === 0} // Priorité pour la première image
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
          <OverlayActionButton
            label="next"
            intent="next"
            animate="exit"
            isActive={isExiting}
            activeDeltaDeg={-90}
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
