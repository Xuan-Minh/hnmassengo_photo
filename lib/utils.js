// =================================
// FONCTIONS UTILITAIRES
// =================================

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

export const calculateAge = () => {
  const today = new Date();
  const birth = new Date('2002-07-07');

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export function extractIdYoutube(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
