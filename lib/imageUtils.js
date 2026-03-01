import imageUrlBuilder from '@sanity/image-url';
import { projectId, dataset } from '../sanity/env.js';

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Génère une URL d'image Sanity en tenant compte du crop et du hotspot
 * @param {object} image - L'objet image Sanity (doit contenir asset, crop, hotspot)
 * @param {object} options - width, quality, etc.
 * @returns {string} - URL complète
 */
export function buildSanityImageUrl(image, { w, q, auto, dpr } = {}) {
  if (!image || !image.asset) return '';
  let builderInstance = builder.image(image);
  if (w) builderInstance = builderInstance.width(w);
  if (q) builderInstance = builderInstance.quality(q);
  if (auto) builderInstance = builderInstance.auto(auto);
  if (dpr) builderInstance = builderInstance.dpr(dpr);
  return builderInstance.url();
}

/**
 * Extrait juste l'URL de base Sanity sans paramètres
 * À utiliser avec Next.js Image qui gère les paramètres (quality, sizes, etc.)
 * @param {string} url - L'URL complète avec paramètres
 * @returns {string} - URL de base sans paramètres
 */
export function getSanityImageBase(url) {
  if (!url || typeof url !== 'string') return url;
  return url.split('?')[0]; // Retourne tout avant le '?'
}
