"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// Menu one-page: scroll interne vers des sections dans #scroll-root
export default function Menu() {
  const items = useMemo(
    () => [
      { id: "home", label: "About" },
      { id: "works", label: "Works" },
      { id: "blog", label: "Spaces" },
      { id: "shop", label: "shop" },
      { id: "info", label: "info" },
    ],
    []
  );

  const [active, setActive] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setActive(sessionStorage.getItem("menuActiveSection") || "home");
      setHydrated(true);
    }
  }, []);
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [hideMenu, setHideMenu] = useState(false);

  const scrollToId = useCallback((targetId) => {
    const root = document.getElementById("scroll-root");
    const el = document.getElementById(targetId);
    if (!root || !el) return;
    const top =
      root.scrollTop +
      (el.getBoundingClientRect().top - root.getBoundingClientRect().top);
    root.scrollTo({ top, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const root = document.getElementById("scroll-root");
    if (!root) return;

    // Récupère toutes les sections (y compris celles pas dans le menu, ex: blog)
    const allSections = Array.from(root.querySelectorAll("section[id]"));

    function computeIsDark(element) {
      if (!element) return false;
      const bg = window.getComputedStyle(element).backgroundColor;
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!match) return false;
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      // Perceived brightness formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 110; // seuil un peu plus strict pour #222
    }

    const io = new IntersectionObserver(
      (entries) => {
        const sorted = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = sorted[0]?.target;
        if (top) {
          // Active uniquement si section présente dans le menu
          if (items.some((i) => i.id === top.id)) {
            setActive((prev) => {
              if (prev !== top.id) {
                sessionStorage.setItem("menuActiveSection", top.id);
              }
              return top.id;
            });
          }
          setIsDarkBg(computeIsDark(top));
        }
      },
      { root, threshold: [0.4, 0.6, 0.8] }
    );

    allSections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, [items]);

  // Hide menu when the bottom contact section (#info) is visible in viewport
  useEffect(() => {
    const root = document.getElementById("scroll-root");
    const infoEl = document.getElementById("info");
    if (!root || !infoEl) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Hide when at least ~20% visible
        setHideMenu(entry.isIntersecting && entry.intersectionRatio > 0.2);
      },
      { root, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    io.observe(infoEl);
    return () => io.disconnect();
  }, []);

  if (!hydrated || !active) return null;
  return (
    <nav
      className={[
        "fixed right-8 top-1/2 -translate-y-1/2 z-50 select-none transition-opacity duration-300",
        hideMenu
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto",
      ].join(" ")}
      aria-hidden={hideMenu ? "true" : undefined}
    >
      <ul className="flex flex-col items-end pr-2">
        {items.map((it, idx) => {
          const isActive = active === it.id;
          const activeColor = isDarkBg ? "text-[#F4F3F2]" : "text-blackCustom";
          const inactiveColor = isDarkBg ? "text-[#F4F3F2]/60" : "text-accent";
          return (
            <li key={it.id} className={idx > 0 ? "-mt-[8px]" : undefined}>
              <button
                type="button"
                onClick={() => {
                  if (it.id === "info") {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("contact:show"));
                    }
                  } else {
                    scrollToId(it.id);
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "uppercase tracking-wide transition-all duration-200 ease-out",
                  "text-right origin-right",
                  isActive
                    ? `font-bold ${activeColor} scale-110`
                    : `font-normal ${inactiveColor}`,
                  isDarkBg
                    ? "hover:scale-110 hover:text-[#F4F3F2]"
                    : "hover:scale-110 hover:text-blackCustom",
                  "text-[28px] md:text-[32px] lg:text-[40px] xl:text-[48px] 2xl:text-[56px] leading-none",
                ].join(" ")}
              >
                {it.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
