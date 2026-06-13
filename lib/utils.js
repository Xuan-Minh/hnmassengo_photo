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

export const extractIdYoutube = url => {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);

    // Format court: https://youtu.be/ID
    if (parsedUrl.hostname.includes('youtu.be')) {
      return parsedUrl.pathname.replace('/', '');
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      // Format standard: https://www.youtube.com/watch?v=ID
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v');
      }

      // Formats alternatifs: /shorts/ID, /live/ID, /embed/ID
      if (
        parsedUrl.pathname.startsWith('/shorts/') ||
        parsedUrl.pathname.startsWith('/live/') ||
        parsedUrl.pathname.startsWith('/embed/')
      ) {
        // split('/')[2] récupère l'ID juste après le mot-clé (ex: ['', 'shorts', 'ID'])
        return parsedUrl.pathname.split('/')[2];
      }
    }
  } catch (error) {
    return null; // Si l'URL est mal formée, on ne crashe pas
  }
  return null;
};

export function fontColorTab(tabColor) {
  if (!tabColor) return '#0A0A0A'; // Noir par défaut si pas de couleur

  // On enlève le '#' et on force en MAJUSCULES pour éviter les bugs de casse
  const hex = tabColor.replace('#', '').toUpperCase();

  // Jaune (FED52A), Vert (44724B), Rouge (BB3430)
  if (hex === '44724B' || hex === 'BB3430') {
    return '#F4F3F2'; // Texte Blanc
  }

  // Pour toutes les autres couleurs (y compris le fond blanc)
  return '#0A0A0A'; // Texte Noir
}

export function portableTextToPlain(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map(block => {
      if (block._type !== 'block' || !block.children) return '';
      return block.children.map(child => child.text).join('');
    })
    .join('\n\n');
}
