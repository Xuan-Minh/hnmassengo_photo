'use client';
import React from 'react';

export default function RevealRoot({ children }) {
  return (
    <div
      id="scroll-root"
      className="h-screen overflow-y-scroll scroll-smooth"
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
