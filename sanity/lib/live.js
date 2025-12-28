// L'interrogation avec "sanityFetch" gardera le contenu automatiquement mis à jour
// Avant de l'utiliser, importer et rendre "<SanityLive />" dans votre layout, voir
// https://github.com/sanity-io/next-sanity#live-content-api pour plus d'informations.
import { defineLive } from "next-sanity/live";
import { client } from './client'

export const { sanityFetch, SanityLive } = defineLive({
  client,
});
