import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Mettre à false si génération statique de pages, utilisation d'ISR ou revalidation basée sur les tags
})
