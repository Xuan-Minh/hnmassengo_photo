import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from '../sanity/env';

const token = process.env.SANITY_WRITE_TOKEN;

export function getSanityWriteClient() {
  if (!token) {
    throw new Error(
      'Missing SANITY_WRITE_TOKEN (required for newsletter subscribe/webhook writes).'
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}
