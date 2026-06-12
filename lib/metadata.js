/**
 * Structured Data (Schema.org) for SEO
 * Returns JSON-LD script component data
 */
function getStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Han-Noah MASSENGO',
    jobTitle: 'Photographer',
    description:
      "Professional photographer specializing in analog portrait, captured in his soccer player's life.",
    url: 'https://hnmassengo.com',
    sameAs: [
      'https://www.instagram.com/hnmassengo42/',
      'https://www.instagram.com/studio42archives/',
    ],
    knowsAbout: [
      'Photography',
      'Visual Arts',
      'Portrait Photography',
      'Commissioned Work',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Photographer',
      occupationLocation: {
        '@type': 'Country',
        name: 'Augsbourg, Germany and Paris, France',
      },
    },
    image: 'https://hnmassengo.com/ogimage.webp',
  };
}

/**
 * StructuredData component for rendering in React
 */
export default function StructuredData() {
  const jsonLd = getStructuredData();
  return <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>;
}
