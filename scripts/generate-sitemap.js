const fs = require('fs')
const path = require('path')

// 이 스크립트는 빌드 시 정적 sitemap을 생성합니다
async function generateSitemap() {
  const { getPosts } = require('../src/apis/notion-client')
  const { CONFIG } = require('../site.config')
  
  try {
    const posts = await getPosts()
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CONFIG.link}</loc>
    <lastmod>${new Date().toISOString().split('.')[0]}Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${posts.map(post => {
  const postDate = post?.date?.start_date || post.createdTime
  const lastmod = new Date(postDate).toISOString().split('.')[0] + 'Z'
  
  return `  <url>
    <loc>${CONFIG.link}/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
}).join('\n')}
</urlset>`

    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
    console.log('✅ Sitemap generated successfully at public/sitemap.xml')
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  generateSitemap()
}

module.exports = { generateSitemap }