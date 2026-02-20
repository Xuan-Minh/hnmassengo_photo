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
  // Compression et optimisation
  compress: true,
  productionBrowserSourceMaps: false, // Désactiver les source maps en production pour réduire taille
  poweredByHeader: false, // Retirer header X-Powered-By

  // Optimisation du bundling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk séparé pour meilleur caching
            vendor: {
              filename: 'chunks/vendor.js',
              test: /node_modules/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Librairies communes
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              filename: 'chunks/common.js',
            },
            framer: {
              test: /[\\/]node_modules[\\/](framer-motion)/,
              name: 'framer-motion',
              priority: 15,
              reuseExistingChunk: true,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)/,
              name: 'react',
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // Optimisation automatique des images
    formats: ['image/avif', 'image/webp'], // AVIF d'abord (meilleure compression)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Tailles d'écran courantes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tailles d'images pour les composants
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
      // Cache agressif pour les assets statiques
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
      // Cache pour les chunks JavaScript buildés
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Compression GZIP pour réduire la taille
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Dés-cacher les pages HTML générées pour les mettre à jour facilement
      {
        source: '/:locale(en|fr|de)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
