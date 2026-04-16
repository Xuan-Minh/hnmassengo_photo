'use client';

import Image from 'next/image';
import PropTypes from 'prop-types';
import { extractFirstSentence } from '../../lib/utils';
import { useLocale } from 'next-intl';

function renderTextPreview(text, postCount, extraClass = '') {
  if (postCount === 1) {
    const paragraphs = (text || '').split('\n\n').filter(Boolean).slice(0, 3);
    return (
      <div
        className={`font-playfair text-whiteCustom/80 leading-loose space-y-2 ${extraClass}`}
      >
        {paragraphs.map((para, i) => (
          <p key={i} className="sm:text-lg lg:text-base">
            {para}
          </p>
        ))}
      </div>
    );
  }
  const clampClass =
    postCount >= 3
      ? '[-webkit-line-clamp:2] lg:[-webkit-line-clamp:2]'
      : '[-webkit-line-clamp:3] lg:[-webkit-line-clamp:3]';
  return (
    <p
      className={`sm:text-lg lg:text-base font-playfair text-whiteCustom/80 leading-loose overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] ${clampClass} ${extraClass}`}
    >
      {text}
    </p>
  );
}

export default function BlogPostItem({ post, onClick, postCount = 1 }) {
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

  return (
    <div
      className="w-full lg:border-b lg:border-whiteCustom/20 py-2  lg:py-12 cursor-pointer group lg:hover:border-l-4 lg:hover:border-l-white lg:pl-8 transition-all duration-300"
      onClick={onClick}
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
            <h3 className="text-3xl lg:text-3xl font-playfair italic mb-2">
              &ldquo;{displayTitle}&rdquo;
            </h3>
            <div className="text-lg text-whiteCustom/80 lg:text-base font-playfair mb-4">
              - {post.date}
            </div>
            {renderTextPreview(displayText, postCount)}
          </div>
        </div>
      )}

      {post.layout === 'image-right' && post.image && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 text-whiteCustom order-2 lg:order-1 flex flex-col justify-start">
            <h3 className="text-3xl lg:text-3xl font-playfair italic mb-2">
              &ldquo;{displayTitle}&rdquo;
            </h3>
            <div className="text-lg text-whiteCustom/80 lg:text-base font-playfair mb-4">
              - {post.date}
            </div>
            {renderTextPreview(displayText, postCount)}
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
            <h3 className="text-3xl lg:text-3xl font-playfair italic mb-2">
              &ldquo;{displayTitle}&rdquo;
            </h3>
            <span className="text-whiteCustom/80 text-lg lg:text-base font-playfair">
              - {post.date}
            </span>
          </div>
          {renderTextPreview(displayText, postCount, 'max-w-3xl')}
        </div>
      )}
    </div>
  );
}

BlogPostItem.propTypes = {
  post: PropTypes.shape({
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
};
