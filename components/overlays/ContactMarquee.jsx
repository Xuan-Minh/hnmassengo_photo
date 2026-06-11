'use client';
import { m } from 'framer-motion';
import { SITE_CONFIG } from '../../lib/constants';

const MarqueeBlock = ({ ariaHidden = false } = {}) => (
  <div
    className="flex items-center gap-6 sm:gap-6 md:gap-6 lg:gap-6 pr-6 uppercase"
    aria-hidden={ariaHidden}
  >
    <span className="inline-block font-bold">{SITE_CONFIG.copyright}</span>
    <span className="inline-block">{SITE_CONFIG.copyright}</span>
    <span className="inline-block font-bold">{SITE_CONFIG.copyright}</span>
    <span className="inline-block">{SITE_CONFIG.copyright}</span>
  </div>
);

export default function ContactMarquee({ mode = 'absolute' } = {}) {
  const wrapperClassName =
    mode === 'inline'
      ? 'flex-shrink-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none '
      : 'absolute inset-x-0 bottom-0 border-t border-whiteCustom/60 overflow-hidden pointer-events-none';

  return (
    <div className={wrapperClassName}>
      <m.div
        className="flex w-max whitespace-nowrap text-whiteCustom/90 font-liberation text-3xl md:text-[36px] lg:text-[40px] xl:text-[44px] py-1 sm:py-1.5 md:py-2 -tracking-normal"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 30,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <MarqueeBlock />
        <MarqueeBlock ariaHidden />
      </m.div>
    </div>
  );
}
