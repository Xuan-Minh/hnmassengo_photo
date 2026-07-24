'use client';
import React from 'react';

export default function RevealRoot({ children }) {
  return (
    <div
      id="scroll-root"
      className="h-screen overflow-y-scroll overflow-x-hidden scroll-smooth"
      style={{
        scrollbarGutter: 'stable',
        scrollbarColor: 'var(--color-accent) transparent',
      }}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
