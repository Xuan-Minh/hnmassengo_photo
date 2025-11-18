"use client";

export default function Logo() {
  const triggerIntro = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("intro:show"));
    }
  };
  return (
    <div
      data-layer="HAN-NOAH MASSENGO"
      className="fixed top-0 left-0 w-full flex justify-center gap-2 items-center space-x-2 mt-4 z-50 bg-transparent pointer-events-none hidden sm:flex md:text-[36px]"
    >
      <span
        onClick={triggerIntro}
        className="text-accent font-normal font-playfair italic pointer-events-auto cursor-pointer"
        title="Rejouer l'intro"
      >
        Han-Noah
      </span>
      <span
        onClick={triggerIntro}
        className="text-accent font-normal font-lexend pointer-events-auto cursor-pointer"
        title="Rejouer l'intro"
      >
        MASSENGO
      </span>
    </div>
  );
}
