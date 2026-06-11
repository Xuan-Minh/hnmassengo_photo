'use client';

import Image from 'next/image';
import { buildSanityImageUrl } from '../../../lib/imageUtils';

export default function ImageMarqueeHorizontal({ images, onClick }) {
  return (
    <div
      className={`w-full h-full relative bg-background flex items-center overflow-x-auto snap-x snap-mandatory touch-pan-x scroll-smooth ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-center gap-12 px-10">
        {images.map((img, index) => (
          <button
            type="button"
            key={img + index}
            className="flex-shrink-0 flex justify-center items-center snap-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={onClick}
            onKeyPress={e => {
              if (e.key === 'Enter' && onClick) onClick();
            }}
            tabIndex={0}
          >
            <Image
              src={buildSanityImageUrl(img, { w: 400, q: 40, auto: 'format' })}
              alt={`Project image ${index + 1}`}
              width={400}
              height={300}
              className="h-[30vh] w-auto object-contain"
              draggable={false}
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
