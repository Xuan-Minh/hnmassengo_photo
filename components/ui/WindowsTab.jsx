import React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function WindowsTab({
  couleur,
  titre,
  contenu,
  zIndex,
  bringToFront,
}) {
  const color = couleur || 'bg-gray-300';
  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={bringToFront}
      onMouseDown={bringToFront}
      style={{ zIndex }}
      whileDrag={{
        scale: 1.01,
        boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
      }}
      className={`windowsTab absolute flex flex-col flex-nowrap ${color} w-[40%] h-[60%] shadow-md resize-y border border-black`}
    >
      <div className="flex items-center gap-2 border border-black border-t-0 border-l-0 border-r-0 px-2 py-1 cursor-grab active:cursor-grabbing">
        <h3>{titre}</h3>
      </div>
      <div className="flex-1 px-2 py-1 bg-background overflow-auto">
        <p>{contenu}</p>
      </div>
    </motion.div>
  );
}
