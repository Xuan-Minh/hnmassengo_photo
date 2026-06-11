import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  // Utilisation de chemins statiques pour un code-splitting optimal (evite l'erreur no-dynamic-import-path)
  let messages;
  switch (locale) {
    case 'en':
      messages = (await import('../../messages/en.json')).default;
      break;
    case 'de':
      messages = (await import('../../messages/de.json')).default;
      break;
    case 'fr':
    default:
      messages = (await import('../../messages/fr.json')).default;
      break;
  }

  return {
    locale,
    messages,
  };
});
