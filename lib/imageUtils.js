/**
 * Builds a Sanity CDN image URL with query parameters
 * @param {string} url - The base image URL from Sanity
 * @param {Object} options - URL parameters
 * @param {number} options.w - Image width
 * @param {number} options.q - Image quality (0-100)
 * @param {string} options.auto - Auto format parameter (e.g. 'format')
 * @param {number} options.dpr - Device pixel ratio (default 2, set to 1 to disable)
 * @returns {string} - Complete URL with parameters
 */
export function buildSanityImageUrl(url, { w, q, auto, dpr } = {}) {
  if (!url || typeof url !== 'string') return url;
  const [base, query = ''] = url.split('?');
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
