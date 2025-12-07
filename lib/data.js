// =================================
// PROJECT DATA CONFIGURATION
// =================================

// Exemple de données de projets pour la galerie
export const GALLERY_PROJECTS = [
  {
    id: 1,
    name: "Burnley",
    type: "artwork",
    images: ["/home/home1.jpg", "/home/home2.jpg", "/home/home3.jpg"],
    coords: "48.3705° N, 10.8978° E",
    description: "Exploration artistique de la nébuleuse M33...",
  },
  {
    id: 2,
    name: "Commission A",
    type: "commission",
    images: ["/home/home4.jpg", "/home/home1.jpg"],
    coords: "47.1234° N, 11.5678° E",
    description: "Projet commission pour client privé...",
  },
  {
    id: 3,
    name: "Serie Nature",
    type: "artwork",
    images: ["/home/home3.jpg", "/home/home4.jpg", "/home/home1.jpg"],
    coords: "46.5197° N, 6.6323° E",
    description: "Exploration de la nature urbaine...",
  },
  {
    id: 4,
    name: "Portrait Studio",
    type: "commission",
    images: ["/home/home2.jpg", "/home/home3.jpg"],
    coords: "48.8566° N, 2.3522° E",
    description: "Séance portrait en studio...",
  },
];

// Données de blog d'exemple
export const BLOG_POSTS = [
  {
    id: 1,
    title: "Some random thoughts",
    date: "12 oct. 2025",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fullContent: "Contenu complet du post...",
    image: "/home/home2.jpg",
    layout: "image-right",
  },
  {
    id: 2,
    title: "Some random thoughts",
    date: "12 oct. 2025",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    fullContent: "Contenu complet du post...",
    image: "/home/home2.jpg",
    layout: "image-right",
  },
];

// Configuration des produits (à terme, sera remplacé par Sanity)
export const SHOP_PRODUCTS = [
  {
    id: "1",
    name: "Tirage M33 - Format A3",
    price: 45,
    description: "Tirage haute qualité sur papier photo premium...",
    image: "/home/home1.jpg",
    imgHover: "/home/home2.jpg",
    category: "prints",
    formats: ["A4", "A3", "A2"],
  },
  // Ajouter plus de produits ici
];
