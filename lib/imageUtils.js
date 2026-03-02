import imageUrlBuilder from '@sanity/image-url';
import { projectId, dataset } from '../sanity/env.js';

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Génère une URL d'image Sanity en tenant compte du crop et du hotspot
 * Supporte à la fois :
 * - L'objet image Sanity complet (avec asset, crop, hotspot)
 * - Une URL string simple (fallback sans crop/hotspot)
 * @param {object|string} image - L'objet image Sanity ou une URL string
 * @param {object} options - width, quality, etc.
 * @returns {string} - URL complète
 */
export function buildSanityImageUrl(image, { w, q, auto, dpr } = {}) {
  // Fallback si c'est une URL string (ancien format)
  if (typeof image === 'string') {
    if (!image) return '';
    const [base, query = ''] = image.split('?');
    const SearchParams = globalThis.URLSearchParams;
    if (!SearchParams) {
      const parts = [];
      if (w) parts.push(`w=${encodeURIComponent(String(w))}`);
      if (q) parts.push(`q=${encodeURIComponent(String(q))}`);
      if (auto) parts.push(`auto=${encodeURIComponent(String(auto))}`);
      if (dpr) parts.push(`dpr=${encodeURIComponent(String(dpr))}`);
      return parts.length ? `${base}?${parts.join('&')}` : base;
    }
    const sp = new SearchParams(query);
    if (w) sp.set('w', String(w));
    if (q) sp.set('q', String(q));
    if (auto) sp.set('auto', String(auto));
    if (dpr) sp.set('dpr', String(dpr));
    const qs = sp.toString();
    return qs ? `${base}?${qs}` : base;
  }

  // Nouveau format : objet image avec asset, crop, hotspot
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
