"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

// Menu one-page: scroll interne vers des sections dans #scroll-root
export default function Menu() {
  const t = useTranslations("menu");
  const items = useMemo(
    () => [
      { id: "home", label: "About" },
      { id: "works", label: "Works" },
      { id: "spaces", label: "spaces" },
      { id: "shop", label: "shop" },
      { id: "info", label: "info" },
    ],
    [t]
  );

  const [active, setActive] = useState("home");

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
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { root, threshold: [0.4, 0.6, 0.8] }
    );
    sections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 pointer-events-auto select-none">
      <ul className="flex flex-col items-end pr-2">
        {items.map((it, idx) => {
          const isActive = active === it.id;
          return (
            <li key={it.id} className={idx > 0 ? "-mt-[8px]" : undefined}>
              <button
                type="button"
                onClick={() => scrollToId(it.id)}
                className={[
                  "uppercase tracking-wide transition-all duration-200 ease-out",
                  "text-right origin-right",
                  isActive
                    ? "font-bold text-black/80"
                    : "font-normal text-black/50",
                  "hover:scale-110 hover:text-black/80",
                  "text-[48px] leading-none",
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
