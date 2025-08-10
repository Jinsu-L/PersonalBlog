const { CONFIG } = require("./site.config")

module.exports = {
  siteUrl: CONFIG.link,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  generateIndexSitemap: false,
  // API route를 사용하므로 기본 sitemap 생성 비활성화
  exclude: ['/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${CONFIG.link}/api/sitemap.xml`,
    ],
  },
}
