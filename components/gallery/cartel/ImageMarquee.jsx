'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { m, animate, useMotionValue } from 'framer-motion';
import { buildSanityImageUrl } from '../../../lib/imageUtils';

export default function ImageMarquee({ images, onClick }) {
  const allImages = [...images, ...images];
  const trackRef = useRef(null);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!images?.length) return;
    if (images.length < 2) return;

    let controls;
    let rafId;

    const start = () => {
      if (!trackRef.current) return;

      const halfHeight = trackRef.current.scrollHeight / 2;
      if (!Number.isFinite(halfHeight) || halfHeight <= 0) return;

      if (controls) controls.stop();
      y.set(0);
      controls = animate(y, -halfHeight, {
        ease: 'linear',
        duration: images.length * 8,
        repeat: Infinity,
        repeatType: 'loop',
      });
    };

    rafId = window.requestAnimationFrame(start);
    window.addEventListener('resize', start);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', start);
      if (controls) controls.stop();
    };
  }, [images, y]);

  return (
    <div className="hidden md:flex flex-col w-[45%] h-full relative bg-background">
      <div className="w-full h-full overflow-hidden relative">
        <m.div ref={trackRef} className="flex flex-col" style={{ y }}>
          {allImages.map((img, index, item) => (
            // On ajoute le bouton ici, autour de chaque image
            <button
              type="button"
              key={item.id + '-' + index}
              className="w-full pb-16 flex-shrink-0 flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onClick && onClick(index % images.length)} // <-- Modulo important !
            >
              <Image
                src={buildSanityImageUrl(img, {
                  w: 800,
                  q: 60,
                  auto: 'format',
                })}
                alt={`Project image ${(index % images.length) + 1}`}
                width={400}
                height={300}
                className="w-3/5 h-auto object-contain"
                draggable={false}
                sizes="(max-width: 1200px) 100vw, 400px"
                priority={false}
              />
            </button>
          ))}
        </m.div>
      </div>
    </div>
  );
}
