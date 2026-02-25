import React from 'react';

export function ListIcon({ className = '', ...props }) {
  return (
    <svg
      width="28"
      height="27"
      viewBox="0 0 28 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* On a remplacé les -5.35722e-08 par un simple 0 parfait */}
      <path d="M28 2.5L0 2.5" stroke="currentColor" strokeWidth="5" />
      <path d="M28 13.5L0 13.5" stroke="currentColor" strokeWidth="5" />
      <path d="M28 24.5L0 24.5" stroke="currentColor" strokeWidth="5" />
    </svg>
  );
}

export function GridIcon({ className = '', ...props }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="13" height="13" fill="currentColor" />
      <rect x="15" width="13" height="13" fill="currentColor" />
      <rect y="15" width="13" height="13" fill="currentColor" />
      <rect x="15" y="15" width="13" height="13" fill="currentColor" />
    </svg>
  );
}
