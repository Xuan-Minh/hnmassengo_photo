import React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function WindowsTab({
  couleur,
  titre,
  contenu,
  zIndex,
  bringToFront,
  fontColor,
}) {
  const color = couleur || 'bg-gray-300';
  const fontcolor = fontColor || '#000000';
  const [isDragging, setIsDragging] = useState(false);

  const childrenVariants = {
    idle: {
      scale: 1,
      boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', // Ombre légère par défaut
    },
    dragging: {
      scale: 1.01,
      boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
    },
  };
  function extractIdYoutube(url) {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        bringToFront();
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onMouseDown={bringToFront}
      style={{ zIndex }}
      className={`windowsTab absolute flex flex-col flex-nowrap gap-1 h-auto bg-transparent`}
    >
      <motion.div
        style={{ backgroundColor: color, color: fontcolor }}
        variants={childrenVariants}
        animate={isDragging ? 'dragging' : 'idle'}
        className={`flex w-full border border-black gap-2 p-2  windowsTab rounded-t-md`}
      >
        <h3 className="text-lg text-center font-bold">{titre}</h3>
      </motion.div>
      <motion.div
        variants={childrenVariants}
        animate={isDragging ? 'dragging' : 'idle'}
        className="flex-1 p-4 border border-black bg-background flex justify-between cursor-default rounded-b-md windowsTab overflow-auto"
        {...(typeof contenu === 'string'
          ? { dangerouslySetInnerHTML: { __html: contenu } }
          : { children: contenu })}
      ></motion.div>
    </motion.div>
  );
}
