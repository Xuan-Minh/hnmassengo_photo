'use client';
import { useEffect, useState } from 'react';
import { EVENTS, addEventHandler } from '../../lib/events';

export default function RevealRoot({ children }) {
  const [revealed, setRevealed] = useState(true); // Visible par défaut

  useEffect(() => {
    const handler = () => setRevealed(true);
    const cleanup = addEventHandler(EVENTS.INTRO_DISMISSED, handler);
    return () => cleanup();
  }, []);

  return (
    <div id="scroll-root" className="h-screen overflow-y-scroll scroll-smooth">
      {children}
    </div>
  );
}
