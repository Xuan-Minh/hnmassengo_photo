const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // Optimisation automatique des images
    formats: ['image/webp', 'image/avif'], // WebP en priorité, AVIF en fallback
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Tailles d'écran courantes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tailles d'images pour les composants
    minimumCacheTTL: 60, // Cache minimum de 60 secondes
    dangerouslyAllowSVG: true, // Permettre les SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // Sécurité
  },
  experimental: {
    optimizePackageImports: ['framer-motion', '@portabletext/react'],
  },
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
