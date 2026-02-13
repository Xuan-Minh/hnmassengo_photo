/**
 * Structured Data (Schema.org) for SEO
 * Returns JSON-LD script component data
 */
export function getStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Han-Noah MASSENGO',
    jobTitle: 'Photographer & Visual Artist',
    description:
      'Professional photographer and visual artist specializing in portrait, commissioned work, and fine art prints.',
    url: 'https://hnmassengo.com',
    sameAs: [
      'https://www.instagram.com/hnmassengo42/',
      'https://www.instagram.com/studio42archives/',
    ],
    knowsAbout: [
      'Photography',
      'Visual Arts',
      'Portrait Photography',
      'Fine Art Prints',
      'Commissioned Work',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Photographer',
      occupationLocation: {
        '@type': 'Country',
        name: 'France',
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
