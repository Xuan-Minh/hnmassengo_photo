'use client';
/* eslint-disable react-doctor/use-lazy-motion */
import React, { useState, useEffect } from 'react';
import { m, useMotionValue } from 'framer-motion';
import { Minimize } from 'lucide-react';
import { fontColorTab } from '../../lib/utils';
import { useIsMobile } from '../../lib/hooks';
const childrenVariants = {
  idle: {
    scale: 1,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
  },
  dragging: {
    scale: 1.01,
    boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
  },
};

export default function WindowsTab({
  couleur,
  titre,
  contenu,
  zIndex,
  bringToFront,
  fontColor,
  style, // Contient toujours { top: '...', left: '...' } de HomePageTabs
  constraintsRef,
}) {
  const color = couleur || 'bg-gray-300';
  const textColor = fontColor || fontColorTab(couleur);
  const isMobile = useIsMobile();

  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // 1. Valeurs de mouvement pur Framer Motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isReady, setIsReady] = useState(false);

  // 2. Conversion des unités relatives (vw/vh) en pixels réels
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const parse = val => {
        if (!val) return 0;
        const num = parseFloat(val);
        if (typeof val === 'string') {
          if (val.includes('vw')) return (num / 100) * vw;
          if (val.includes('vh')) return (num / 100) * vh;
        }
        return num;
      };

      x.set(parse(style.left));
      y.set(parse(style.top));

      setIsReady(true);
    }
  }, [style.left, style.top, x, y]);

  if (isMobile) {
    return null; // On ne rend pas les fenêtres sur mobile
  }
  return (
    <m.div
      drag
      dragMomentum={false}
      dragElastic={0} // Stoppe net sur les bords de l'écran
      dragConstraints={constraintsRef}
      onDragStart={() => {
        bringToFront();
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onPointerDown={bringToFront}
      style={{
        x,
        y,
        zIndex,
        opacity: isReady ? 1 : 0,
      }}
      className="windowsTab absolute top-0 left-0 flex flex-col flex-nowrap gap-1 bg-transparent drop-shadow-lg"
    >
      <m.div
        style={{
          backgroundColor: color,
        }}
        variants={childrenVariants}
        animate={isDragging ? 'dragging' : 'idle'}
        className={`flex items-center justify-between w-full border border-black gap-2 p-2 ${
          isMinimized ? 'rounded-md' : 'rounded-t-md'
        }`}
      >
        <h3
          className="text-lg text-center font-bold px-2 pointer-events-none"
          style={{ color: textColor }}
        >
          {titre}
        </h3>

        <button
          onClick={e => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          className="p-1 hover:bg-white/20 rounded-sm pointer-events-auto cursor-pointer"
          aria-label="Réduire la fenêtre"
          type="button"
          style={{ color: textColor }}
        >
          <Minimize size={16} />
        </button>
      </m.div>

      {!isMinimized && (
        <m.div
          variants={childrenVariants}
          animate={isDragging ? 'dragging' : 'idle'}
          className={`flex-1 p-4 border border-black bg-background flex rounded-b-md overflow-auto ${
            isDragging
              ? 'pointer-events-none select-none'
              : 'pointer-events-auto'
          }`}
          {...(typeof contenu === 'string'
            ? { dangerouslySetInnerHTML: { __html: contenu } }
            : { children: contenu })}
        ></m.div>
      )}
    </m.div>
  );
}
