import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-12-07", // Use current date for latest API features
  useCdn: true, // Set to false for fresh data or if using Draft mode
});

export default client;
