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

// Durées d'animation (en ms)
export const ANIMATIONS = {
  FAST: 200,
  MEDIUM: 300,
  SLOW: 500,
  OVERLAY: 800,
  CAROUSEL: 4000,
};

// Configuration du thème
export const THEME = {
  DARK_THRESHOLD: 110, // Seuil de luminosité pour la détection d'arrière-plan sombre
};

// Configuration d'affichage du contenu
export const CONTENT = {
  BLOG_PREVIEW_COUNT: 3, // Nombre d'articles de blog affichés sur la page d'accueil
};

// Configuration temporelle (en millisecondes)
export const TIMING = {
  IMAGE_ROTATION_INTERVAL: 4000, // Vitesse de rotation du carrousel d'images
  REVEAL_TIMEOUT: 2000, // Délai de révélation de secours pour l'overlay d'intro
  CART_TRANSFER_DELAY: 150, // Délai entre le transfert des articles du panier vers Snipcart
  CHECKOUT_OPEN_DELAY: 300, // Délai avant l'ouverture du checkout Snipcart
  BUTTON_REMOVE_DELAY: 100, // Délai avant la suppression des boutons temporaires
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Site Configuration
export const SITE_CONFIG = {
  author: 'Han-Noah MASSENGO',
  developer: 'Xuan-Minh TRAN',
  copyright: '© Han-Noah MASSENGO 2025',
  email: 'contact@hnmassengo.com',
  instagram: 'https://www.instagram.com/studio42archives/',
};
