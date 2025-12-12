// =================================
// UTILITY FUNCTIONS
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
    behavior: "smooth",
  });
};

/**
 * Check if device is mobile based on viewport width
 */
export const isMobileDevice = () => {
  return typeof window !== "undefined" && window.innerWidth < 768;
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
export const formatPrice = (price, currency = "€") => {
  return `${price.toFixed(2)}${currency}`;
};

/**
 * Compute if background color is dark based on perceived brightness
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if background is dark
 */
export const computeIsDark = (element) => {
  if (!element) return false;
  const bg = window.getComputedStyle(element).backgroundColor;
  const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return false;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  // Perceived brightness formula (ITU-R BT.601)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 110;
};

/**
 * Generate random position for image rotation
 */
export const getRandomPosition = (excludePosition = null) => {
  const positions = ["left", "center", "right"];
  const availablePositions = excludePosition
    ? positions.filter((pos) => pos !== excludePosition)
    : positions;

  return availablePositions[
    Math.floor(Math.random() * availablePositions.length)
  ];
};

/**
 * Preload images for better performance
 */
export const preloadImages = (imagePaths) => {
  return Promise.all(
    imagePaths.map((path) => {
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
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
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
