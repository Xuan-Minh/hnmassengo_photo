'use client';
import { useEffect, useState } from 'react';

export default function TextScramble({ text, className, delay = 0 }) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!text) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let iteration = 0;
    const maxIterations = text.length * 3; // Nombre d'itérations par lettre

    const interval = setTimeout(() => {
      const timer = setInterval(() => {
        setDisplayText(prev => {
          const newText = text
            .split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

          return newText;
        });

        if (iteration >= text.length) {
          setIsAnimating(false);
          clearInterval(timer);
          setDisplayText(text);
        }

        iteration += 1 / 3; // Vitesse d'animation
      }, 30); // Intervalle entre chaque frame

      return () => clearInterval(timer);
    }, delay);

    return () => {
      clearTimeout(interval);
    };
  }, [text, delay]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
}