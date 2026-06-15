/* eslint-disable react-doctor/use-lazy-motion */
import React from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Minimize } from 'lucide-react';
import { fontColorTab } from '../../lib/utils';

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
  style,
  constraintsRef,
}) {
  const color = couleur || 'bg-gray-300';

  const textColor = fontColor || fontColorTab(couleur);

  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragStart={() => {
        bringToFront();
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onMouseDown={bringToFront}
      style={{ zIndex, ...style }}
      className={`windowsTab absolute flex flex-col flex-nowrap gap-1 bg-transparent`}
    >
      <motion.div
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
          className="text-lg text-center font-bold px-2"
          style={{ color: textColor }}
        >
          {titre}
        </h3>

        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-white/20 rounded-sm"
          aria-label="Réduire la fenêtre"
          type="button"
          style={{ color: textColor }}
        >
          <Minimize size={16} />
        </button>
      </motion.div>

      {!isMinimized && (
        <motion.div
          variants={childrenVariants}
          animate={isDragging ? 'dragging' : 'idle'}
          className="flex-1 p-4 border border-black bg-background flex rounded-b-md overflow-auto"
          {...(typeof contenu === 'string'
            ? { dangerouslySetInnerHTML: { __html: contenu } }
            : { children: contenu })}
        ></motion.div>
      )}
    </motion.div>
  );
}
