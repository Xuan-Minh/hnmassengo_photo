const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tu peux ajouter tes autres configs Next.js ici si nécessaire
  turbopack: {
    // Force le root de Turbopack au dossier du projet
    root: __dirname,
  },
};

module.exports = withNextIntl(nextConfig);
