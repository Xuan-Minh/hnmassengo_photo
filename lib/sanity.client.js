import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-12-07", // Utiliser la date actuelle pour les dernières fonctionnalités API
  useCdn: true, // Mettre à false pour des données fraîches ou en mode Draft
});

export default client;
