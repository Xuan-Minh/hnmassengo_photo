'use client';

import Image from 'next/image';
import PropTypes from 'prop-types';
import { extractFirstSentence } from '../../lib/utils';
import { useLocale } from 'next-intl';
import { useRef, useState, useEffect } from 'react';

export default function BlogPostItem({
  post,
  onClick,
  postCount = 1,
  isMobile = false,
}) {
  const locale = useLocale();
  const { headline: autoHeadline, rest: textRemainder } = post.title
    ? { headline: null, rest: post.text }
    : extractFirstSentence(post.text);

  const displayTitle =
    (typeof post.title === 'object' && post.title !== null
      ? post.title[locale]
      : post.title
    )?.trim() ||
    autoHeadline?.trim() ||
    post.date?.trim() ||
    'Untitled post';
  const displayText =
    typeof post.text === 'object' && post.text !== null
      ? post.text[locale]
      : post.text || textRemainder;

  const titleRef = useRef(null);
  const metaRef = useRef(null);
  const paragraphsRef = useRef([]);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    if (!isMobile || postCount !== 1) return;
    const section = document.getElementById('blog');
    if (!section) return;

    const compute = () => {
      const sectionH = section.clientHeight || window.innerHeight;
      const titleH = titleRef.current ? titleRef.current.offsetHeight : 0;
      const metaH = metaRef.current ? metaRef.current.offsetHeight : 0;
      const padding = 48; // safety margin
      const available = Math.max(0, sectionH - titleH - metaH - padding);

      const paras = (displayText || '').split('\n\n').filter(Boolean);
      if (paras.length === 0) return setVisibleCount(0);

      // Measure actual paragraph heights if rendered
      let total = 0;
      let fit = 0;
      for (let i = 0; i < paras.length; i++) {
        const el = paragraphsRef.current[i];
        const h = el ? el.offsetHeight : Math.ceil(available / paras.length);
        if (total + h <= available) {
          total += h;
          fit += 1;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(1, Math.min(fit || 1, paras.length)));
    };

    // Run after a tick to allow DOM to render paragraphs
    const id = setTimeout(compute, 50);
    window.addEventListener('resize', compute);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', compute);
    };
  }, [isMobile, postCount, displayText]);

  const paragraphs = (displayText || '').split('\n\n').filter(Boolean);

  const clampClass =
    postCount >= 3
      ? '[-webkit-line-clamp:2] lg:[-webkit-line-clamp:2]'
      : '[-webkit-line-clamp:3] lg:[-webkit-line-clamp:3]';

  // SOLUTION: Remplacer la fonction renderTextPreview() par une simple variable JSX
  const textPreviewNode =
    postCount === 1 ? (
      <div
        className={`font-liberation text-whiteCustom/80 leading-loose space-y-2`}
      >
        {paragraphs
          .slice(0, Math.min(visibleCount, paragraphs.length))
          .map((para, i) => (
            <p
              key={post.id + '-' + i}
              ref={el => (paragraphsRef.current[i] = el)}
              className="sm:text-lg lg:text-base"
            >
              {para}
            </p>
          ))}
      </div>
    ) : (
      <p
        className={`sm:text-lg lg:text-base font-liberation text-whiteCustom/80 leading-loose overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] ${clampClass} max-w-3xl`}
      >
        {displayText}
      </p>
    );

  return (
    <button
      type="button"
      className="w-full lg:border-b lg:border-whiteCustom/20 py-2  lg:py-12 cursor-pointer group lg:hover:border-l-4 lg:hover:border-l-white lg:pl-8 transition-all duration-300"
      onClick={onClick}
      onKeyPress={e => {
        if (e.key === 'Enter') onClick();
      }}
      tabIndex={0}
    >
      {post.layout === 'image-left' && post.image && (
        <div className="flex flex-col lg:flex-row gap-8 sm:items-start lg:items-center ">
          <div className="w-full lg:w-1/3 flex items-center justify-center">
            <Image
              src={post.image}
              alt={displayTitle || ''}
              width={400}
              height={300}
              className="w-full h-auto xl:max-h-[150px] 2xl:max-h-[300px] object-contain lg:grayscale group-hover:grayscale-0 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />
          </div>
          <div className="flex-1 text-whiteCustom flex flex-col justify-start">
            <h3
              ref={titleRef}
              className="text-3xl lg:text-3xl font-liberation italic mb-2"
            >
              &ldquo;{displayTitle}&rdquo;
            </h3>
            <div
              ref={metaRef}
              className="text-lg text-whiteCustom/80 lg:text-base font-liberation mb-4"
            >
              - {post.date}
            </div>
            {textPreviewNode}
          </div>
        </div>
      )}

      {post.layout === 'image-right' && post.image && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 text-whiteCustom order-2 lg:order-1 flex flex-col justify-start">
            <h3
              ref={titleRef}
              className="text-3xl lg:text-3xl font-liberation italic mb-2"
            >
              &ldquo;{displayTitle}&rdquo;
            </h3>
            <div
              ref={metaRef}
              className="text-lg text-whiteCustom/80 lg:text-base font-liberation mb-4"
            >
              - {post.date}
            </div>
            {textPreviewNode}
          </div>
          <div className="w-full lg:w-1/3 flex items-center justify-center order-1 lg:order-2">
            <Image
              src={post.image}
              alt={displayTitle || ''}
              width={400}
              height={300}
              className="w-full h-auto max-h-[300px] lg:max-h-[150px] object-contain lg:grayscale group-hover:grayscale-0 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />
          </div>
        </div>
      )}

      {(post.layout === 'text-only' || !post.image) && (
        <div className="text-whiteCustom">
          <div className="flex flex-col mb-4">
            <h3
              ref={titleRef}
              className="text-3xl lg:text-3xl font-liberation italic mb-2"
            >
              &ldquo;{displayTitle}&rdquo;
            </h3>
            <span
              ref={metaRef}
              className="text-whiteCustom/80 text-lg lg:text-base font-liberation"
            >
              - {post.date}
            </span>
          </div>
          {textPreviewNode}
        </div>
      )}
    </button>
  );
}

BlogPostItem.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        en: PropTypes.string,
        fr: PropTypes.string,
        de: PropTypes.string,
      }),
    ]),
    date: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        en: PropTypes.string,
        fr: PropTypes.string,
        de: PropTypes.string,
      }),
    ]).isRequired,
    image: PropTypes.string,
    layout: PropTypes.oneOf(['image-left', 'image-right', 'text-only'])
      .isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  postCount: PropTypes.number,
  isMobile: PropTypes.bool,
};
