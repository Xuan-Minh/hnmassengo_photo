function stripWrappingQuotes(value) {
  const raw = (value || '').trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

function normalizeProjectId(value) {
  const raw = stripWrappingQuotes(value);
  if (!raw) return '';

  // Cas fréquent: on colle une URL ou un hostname (ex: https://xxxx.api.sanity.io)
  try {
    const url = new URL(raw);
    return (url.hostname.split('.')[0] || '').trim();
  } catch {
    // Pas une URL
  }

  // Cas fréquent: hostname direct (ex: xxxx.apicdn.sanity.io)
  const hostLike = raw.split('/')[0];
  if (hostLike.includes('.')) return hostLike.split('.')[0].trim();

  return raw;
}

export const apiVersion = stripWrappingQuotes(
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-07'
);

export const dataset = stripWrappingQuotes(
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
);

export const projectId = normalizeProjectId(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
);

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable');
}

if (!/^[a-z0-9-]+$/.test(projectId)) {
  throw new Error(
    `Invalid NEXT_PUBLIC_SANITY_PROJECT_ID (got "${projectId}"). Expected only a-z, 0-9 and dashes.`
  );
}
