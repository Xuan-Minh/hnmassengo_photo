// =================================
// FONCTIONS UTILITAIRES
// =================================

/**
 * Smooth scroll to element with offset
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const targetPosition = element.offsetTop - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
};

/**
 * Check if device is mobile based on viewport width
 */
export const isMobileDevice = () => {
  return typeof window !== 'undefined' && window.innerWidth < 768;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Format price for display
 */
export const formatPrice = (price, currency = '€') => {
  return `${price.toFixed(2)}${currency}`;
};

/**
 * Compute if background color is dark based on perceived brightness
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if background is dark
 */
export const computeIsDark = element => {
  if (!element) return false;
  const bg = window.getComputedStyle(element).backgroundColor;
  const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return false;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  // Formule de luminosité perçue (ITU-R BT.601)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 180;
};

/**
 * Generate random position for image rotation
 */
export const getRandomPosition = (excludePosition = null) => {
  const positions = ['left', 'center', 'right'];
  const availablePositions = excludePosition
    ? positions.filter(pos => pos !== excludePosition)
    : positions;

  return availablePositions[
    Math.floor(Math.random() * availablePositions.length)
  ];
};

/**
 * Preload images for better performance
 */
export const preloadImages = imagePaths => {
  return Promise.all(
    imagePaths.map(path => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(path);
        img.onerror = () => reject(path);
        img.src = path;
      });
    })
  );
};

/**
 * Extract the first sentence from a text to use as a headline when no title is set.
 * Mimics the newspaper convention of using the opening line as the article title.
 *
 * @param {string} text - The text to extract the first sentence from.
 * @returns {{headline: string, rest: string}} headline is the first sentence/phrase, rest is the remaining text.
 */
export const extractFirstSentence = text => {
  if (!text) return { headline: '', rest: '' };

  // Find the end of the first sentence (. ! ?) followed by a space or end of string
  const match = text.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
  if (match) {
    return {
      headline: match[1].trim(),
      rest: match[2].trim(),
    };
  }

  // No sentence-ending punctuation: use the first paragraph
  const paragraphEnd = text.indexOf('\n\n');
  if (paragraphEnd !== -1) {
    return {
      headline: text.slice(0, paragraphEnd).trim(),
      rest: text.slice(paragraphEnd).trim(),
    };
  }

  // Single block with no punctuation: use the entire text as the headline
  return { headline: text.trim(), rest: '' };
};

/**
 * Check if element is in viewport
 */
export const isInViewport = element => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};
