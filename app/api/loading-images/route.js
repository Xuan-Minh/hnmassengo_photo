import client from '../../../lib/sanity.client';
import { buildSanityImageUrl } from '../../../lib/imageUtils';

export async function GET() {
  try {
    // Récupérer les images de chargement depuis Sanity
    const data = await client.fetch(
      `*[_type == "loadingImage"] | order(order asc) {
        image {
          asset->{
            url
          }
        },
        alt,
        portraitOnly
      }`
    );

    // Transformer les données pour le format attendu par le composant
    const images = data.map(item => ({
      // Optimiser les images pour les performances : width jusqu'à 1200px (full-screen), qualité réduite
      url: buildSanityImageUrl(item.image.asset.url, {
        w: 1200,
        q: 50,
        auto: 'format',
      }),
      portraitOnly: item.portraitOnly || false,
    }));

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=86400',
      },
    });
  } catch (error) {
    // Erreur lors de la récupération des images de chargement
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
