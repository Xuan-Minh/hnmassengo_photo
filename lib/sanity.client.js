import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable');
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-12-07", // Use current date for latest API features
  useCdn: true, // Set to false for fresh data or if using Draft mode
});

export default client;
