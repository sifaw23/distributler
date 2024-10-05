/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://distributler.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://distributler.com/server-sitemap.xml', // Optional: for dynamic pages
    ],
  },
  exclude: ['/server-sitemap.xml'], // Optional: exclude the server-side sitemap from the all-pages sitemap
  generateIndexSitemap: false, // Set to true if you expect to have more than 50,000 URLs
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  autoLastmod: true,
  transform: async (config, path) => {
    // Custom transformation for individual pages
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1,
        lastmod: new Date().toISOString(),
      };
    }
    // Add more custom transformations as needed
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};