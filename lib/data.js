// =================================
// PROJECT DATA CONFIGURATION
// =================================

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
    title: "Capturing Light and Shadow",
    date: "12 oct. 2025",
    content:
      "An exploration of contrast and emotion through the lens. Discover how light and shadow can tell powerful stories in photography...",
    fullContent: `Photography is fundamentally about capturing light, but it's the interplay between light and shadow that gives images their depth, emotion, and narrative power.

In this article, I explore techniques for working with natural light, creating dramatic contrasts, and understanding how different lighting conditions affect mood and composition.

From golden hour portraits to urban night photography, mastering light is an ongoing journey that constantly reveals new creative possibilities.`,
    image: "/home/home2.jpg",
    layout: "image-right",
  },
  {
    id: 2,
    title: "Behind the Scenes: Studio Sessions",
    date: "20 oct. 2025",
    content:
      "A glimpse into my creative process during commissioned portrait sessions. Learn about my approach to working with clients...",
    fullContent: `Every studio session is a collaboration between photographer and subject. My approach centers on creating a comfortable environment where authentic moments can emerge naturally.

In this post, I share insights from recent portrait sessions, discussing lighting setups, direction techniques, and how I work to capture the essence of each person.

From initial consultation to final delivery, every step is designed to create images that resonate with meaning and artistry.`,
    image: "/home/home3.jpg",
    layout: "image-left",
  },
  {
    id: 3,
    title: "Urban Landscapes: Finding Beauty in Concrete",
    date: "5 nov. 2025",
    content:
      "Exploring the aesthetic potential of urban environments. How architecture and street life create unexpected compositions...",
    fullContent: `Cities are often overlooked as photographic subjects, dismissed as too ordinary or chaotic. Yet within urban landscapes lie infinite opportunities for compelling imagery.

This article explores my ongoing series documenting urban environments, focusing on architectural forms, human interactions, and the poetry found in everyday city life.

Through careful observation and patient waiting, the concrete jungle reveals its hidden beauty and surprising moments of grace.`,
    image: "/home/home4.jpg",
    layout: "text-only",
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
];
