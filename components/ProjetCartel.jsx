"use client";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import OverlayActionButton from "./OverlayActionButton";
import { motion } from "framer-motion";

function ProjectMarquee() {
  return (
    <div className="absolute inset-y-0 bottom-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none">
      <motion.div
        className="whitespace-nowrap text-whiteCustom/90 font-playfair text-[42px] md:text-[56px] lg:text-[64px] py-2 -tracking-normal"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        style={{ willChange: "transform" }}
      ></motion.div>
    </div>
  );
}

export default function ProjetCartel() {
  return (
    <section
      id="works"
      className="h-screen snap-start flex items-center bg-whiteCustom"
      aria-label="Section 2"
    >
      {/* Project Cartel */}

      <main className="w-[55vw] h-screen border-r border-blackCustom p-16 flex flex-col justify-center">
        <section className="flex flex-col items-start justify-center h-full">
          <h2 className="text-4xl font-playfair mb-8 ">Project Name</h2>
          <div className="font-playfair text-lg w-3/4 leading-relaxed indent-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
            posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante
            vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus,
            vitae finibus urna. Phasellus vel rhoncus nisl. Vestibulum congue
            lacinia mi volutpat bibendum. Proin vitae odio est. Vivamus tempus
            pretium commodo.
          </div>
          <div className="font-playfair text-lg w-3/4 leading-relaxed indent-4 ">
            Nulla facilisi. Nam dui metus, interdum vitae lobortis vel, viverra
            consequat neque. Praesent sagittis aliquet posuere. Aenean suscipit,
            mi quis viverra pulvinar, purus nulla placerat mi, quis mollis
            lectus ipsum vitae velit. Sed vehicula est in lobortis tincidunt.
          </div>
        </section>
      </main>

      {/* Marquee */}

      <aside className="flex flex-col">
        <ProjectMarquee />
      </aside>
    </section>
  );
}
