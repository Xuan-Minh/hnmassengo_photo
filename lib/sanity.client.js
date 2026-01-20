import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from '../sanity/env';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Évite les blocages/interceptions possibles du domaine CDN (apicdn.sanity.io)
  // et garantit un comportement plus stable côté navigateur.
  useCdn: false,
});

export default client;
