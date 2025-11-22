"use client";

export default function LogoOverlay() {
  return (
    <div
      data-layer="HAN-NOAH MASSENGO"
      className="top-0 left-0 w-full gap-2 items-center space-x-2 mt-4 z-50 bg-transparent pointer-events-none hidden sm:flex md:text-[24px]"
    >
      <span
        className="text-accent font-normal font-playfair italic pointer-events-auto cursor-pointer"
        title="Retourner en arrière"
      >
        Han-Noah
      </span>
      <span
        className="text-accent font-normal font-lexend pointer-events-auto cursor-pointer"
        title="Retourner en arrière"
      >
        MASSENGO
      </span>
    </div>
  );
}
