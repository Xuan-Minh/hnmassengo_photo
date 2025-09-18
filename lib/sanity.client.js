import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "your_project_id", // à remplacer
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: true,
});

export default client;
