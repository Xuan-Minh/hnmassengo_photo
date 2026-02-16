import client from '../../../lib/sanity.client';

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
      url: item.image.asset.url,
      portraitOnly: item.portraitOnly || false,
    }));

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des images de chargement:',
      error
    );
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
