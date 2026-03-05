'use client';
import { motion } from 'framer-motion';

export default function TextReveal({ text, className = '', delay = 0 }) {
  if (!text || typeof text !== 'string') {
    return null; // or return a default message, but null is fine to avoid rendering
  }

  const paragraphs = text.split('\n\n'); // Découper le texte en paragraphes puis en mots

  // Calculer le délai pour chaque paragraphe en fonction du nombre de mots précédents
  const getStaggerDelay = paragraphIndex => {
    const wordsBeforeCurrent = paragraphs
      .slice(0, paragraphIndex)
      .reduce((acc, p) => acc + p.split(' ').length, 0);
    return wordsBeforeCurrent * 0.05;
  };

  // Container parent qui déclenche l'animation de tous les paragraphes
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: 0, // Pas de stagger uniforme, on gère avec delayChildren de chaque paragraphe
      },
    },
  };

  // Variants pour chaque paragraphe avec délai calculé
  const paragraphVariants = paragraphIndex => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: getStaggerDelay(paragraphIndex),
      },
    },
  });

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {paragraphs.map((paragraph, pIdx) => (
        <motion.div
          key={pIdx}
          className="mb-4"
          variants={paragraphVariants(pIdx)}
        >
          {paragraph.split(' ').map((word, wIdx) => (
            <motion.span
              key={wIdx}
              variants={child}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}
