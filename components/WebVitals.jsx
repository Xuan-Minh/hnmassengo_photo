'use client';

import { useEffect } from 'react';

// Mesurer les Core Web Vitals
export function useWebVitals() {
  useEffect(() => {
    // First Contentful Paint (FCP)
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime, 'ms');
          // Ici vous pourriez envoyer à Google Analytics
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime, 'ms');
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
}

export default function WebVitals() {
  useWebVitals();
  return null;
}
