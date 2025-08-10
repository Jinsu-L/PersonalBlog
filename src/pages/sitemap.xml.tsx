import { getPosts } from "../apis/notion-client/getPosts"
import { CONFIG } from "site.config"
import { getServerSideSitemap, ISitemapField } from "next-sitemap"
import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const posts = await getPosts()
  
  // Create an array of fields with proper lastmod dates
  const fields: ISitemapField[] = posts.map((post) => {
    const postDate = post?.date?.start_date || post.createdTime
    const lastmod = new Date(postDate).toISOString().split('.')[0] + 'Z' // Remove milliseconds
    
    return {
      loc: `${CONFIG.link}/${post.slug}`,
      lastmod,
      priority: 0.7,
      changefreq: "daily",
    }
  })

  // Include the site root separately
  const currentDate = new Date().toISOString().split('.')[0] + 'Z' // Remove milliseconds
  fields.unshift({
    loc: CONFIG.link,
    lastmod: currentDate,
    priority: 1.0,
    changefreq: "daily",
  })

  return getServerSideSitemap(ctx, fields)
}

// Default export to prevent next.js errors
export default () => {}
