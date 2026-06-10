// =================================
// CONSTANTES GLOBALES
// =================================

// Éléments du menu de navigation
export const MENU_ITEMS = [
  { id: 'home', label: 'home' },
  { id: 'works', label: 'gallery' },
  { id: 'blog', label: 'blog' },
  { id: 'shop', label: 'shop' },
  { id: 'info', label: 'info' },
];

// Filtres de la galerie
export const GALLERY_FILTERS = [
  { label: 'all', value: 'all' },
  { label: 'artworks', value: 'artwork' },
  { label: 'commissions', value: 'commission' },
];

// Langues supportées
export const LANGUAGES = ['fr', 'en', 'de'];
// Configuration d'affichage du contenu
export const CONTENT = {
  BLOG_PREVIEW_COUNT: 3, // Nombre d'articles de blog affichés sur la page d'accueil
};

// Configuration temporelle (en milliseconde

// Site Configuration
export const SITE_CONFIG = {
  author: 'Han-Noah MASSENGO',
  developer: 'Xuan-Minh TRAN',
  copyright: 'Han-Noah MASSENGO',
  email: 'contact@hnmassengo.com',
  instagram: 'https://www.instagram.com/studio42archives/',
};

// Images de la section home (fallback local)
export const HOME_FALLBACK_IMAGES = [
  '/home/home1.webp',
  '/home/home2.webp',
  '/home/home3.webp',
  '/home/home4.webp',
];
