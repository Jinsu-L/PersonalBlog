import { NextApiRequest, NextApiResponse } from 'next'
import { getPosts } from '../../apis/notion-client/getPosts'
import { CONFIG } from '../../../site.config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const posts = await getPosts()
    
    // Generate sitemap XML
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

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    res.status(200).send(sitemap)
  } catch (error) {
    console.error('Sitemap generation error:', error)
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
}