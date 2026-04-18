import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import de from '../../messages/de.json';

const MESSAGES = { fr, en, de };

/**
 * Récupère les messages de newsletter pour la locale donnée.
 * @param {string} locale - fr, en, de
 * @returns {object} - Les messages de newsletterEmail
 */
export function getNewsletterEmailMessages(locale = 'en') {
  const safeLocale = ['fr', 'en', 'de'].includes(locale) ? locale : 'en';
  return (
    MESSAGES[safeLocale]?.newsletterEmail || MESSAGES['en'].newsletterEmail
  );
}
