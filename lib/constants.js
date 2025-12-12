// =================================
// GLOBAL CONSTANTS
// =================================

// Navigation Menu Items
export const MENU_ITEMS = [
  { id: "home", label: "home" },
  { id: "works", label: "gallery" },
  { id: "blog", label: "blog" },
  { id: "shop", label: "shop" },
  { id: "info", label: "info" },
];

// Gallery Filters
export const GALLERY_FILTERS = [
  { label: "all", value: "all" },
  { label: "artworks", value: "artwork" },
  { label: "commissions", value: "commission" },
];

// Supported Languages
export const LANGUAGES = ["fr", "en", "de"];

// Animation Durations (in ms)
export const ANIMATIONS = {
  FAST: 200,
  MEDIUM: 300,
  SLOW: 500,
  OVERLAY: 800,
  CAROUSEL: 4000,
};

// Theme Configuration
export const THEME = {
  DARK_THRESHOLD: 110, // Brightness threshold for dark background detection
};

// Content Display Configuration
export const CONTENT = {
  BLOG_PREVIEW_COUNT: 3, // Number of blog posts shown on homepage
};

// Timing Configuration (in milliseconds)
export const TIMING = {
  IMAGE_ROTATION_INTERVAL: 4000, // Image carousel rotation speed
  REVEAL_TIMEOUT: 2000, // Fallback reveal timeout for intro overlay
  CART_TRANSFER_DELAY: 150, // Delay between cart items transfer to Snipcart
  CHECKOUT_OPEN_DELAY: 300, // Delay before opening Snipcart checkout
  BUTTON_REMOVE_DELAY: 100, // Delay before removing temp buttons
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
};

// Site Configuration
export const SITE_CONFIG = {
  author: "Han-Noah MASSENGO",
  developer: "Xuan-Minh TRAN",
  copyright: "© Han-Noah MASSENGO 2025",
  email: "contact@hannoahmassengo.fr",
  instagram: "https://www.instagram.com/studio42archives/",
};
