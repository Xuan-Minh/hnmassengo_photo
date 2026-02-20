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
    qualities: [60, 70, 80, 90], // Support des qualités 60, 70, 80, 90
    minimumCacheTTL: 31536000, // Cache 1 an (images Sanity sont immutables)
    dangerouslyAllowSVG: true, // Permettre les SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // Sécurité
  },
  experimental: {
    optimizePackageImports: ['framer-motion', '@portabletext/react'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache HTTP headers pour les images statiques
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache HTTP headers pour les fonts
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
