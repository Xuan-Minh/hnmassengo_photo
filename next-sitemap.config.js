/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://hnmassengo.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/studio/**', '/api/**'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/api/'],
      },
    ],
  },
  transform: async (config, path) => {
    // Personnaliser la priorité et fréquence selon le type de page
    const isHomePage = path === '/';
    const isLegalPage = path.includes('/legal');

    return {
      loc: path,
      changefreq: isHomePage
        ? 'daily'
        : isLegalPage
          ? 'yearly'
          : config.changefreq,
      priority: isHomePage ? 1.0 : isLegalPage ? 0.3 : config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
