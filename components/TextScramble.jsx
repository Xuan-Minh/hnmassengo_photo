'use client';
import { useEffect, useState } from 'react';
import { EVENTS, addEventHandler } from '../lib/events';

export default function TextScramble({ text, className, delay = 0 }) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [canStart, setCanStart] = useState(false);

  // Attendre que l'intro soit terminée avant de commencer l'animation
  useEffect(() => {
    const handler = () => setCanStart(true);
    const cleanup = addEventHandler(EVENTS.INTRO_DISMISSED, handler);
    return cleanup;
  }, []);

  useEffect(() => {
    if (!text || !canStart) return;

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
  }, [text, delay, canStart]);

  return <span className={className}>{displayText}</span>;
}
