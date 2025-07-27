import { NextApiRequest, NextApiResponse } from 'next'
import RSS from 'rss'
import { CONFIG } from '../../../site.config'
import { getPosts } from '../../apis'
import { filterPosts } from '../../libs/utils/notion'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 포스트 데이터 가져오기 (최신 20개로 제한)
    const posts = filterPosts(await getPosts()).slice(0, 20)

    // RSS 피드 생성
    const feed = new RSS({
      title: CONFIG.blog.title,
      description: CONFIG.blog.description,
      site_url: CONFIG.link,
      feed_url: `${CONFIG.link}/api/rss.xml`,
      language: CONFIG.lang,
      pubDate: new Date(),
      copyright: `© ${new Date().getFullYear()} ${CONFIG.profile.name}`,
      managingEditor: `${CONFIG.profile.email} (${CONFIG.profile.name})`,
      webMaster: `${CONFIG.profile.email} (${CONFIG.profile.name})`,
      generator: 'Next.js RSS Generator',
      ttl: 60, // 60분 캐시
    })

    // 각 포스트를 RSS 아이템으로 추가
    posts.forEach((post) => {
      const postUrl = `${CONFIG.link}/${post.slug}`
      const publishDate = new Date(post.date?.start_date || post.createdTime)

      feed.item({
        title: post.title,
        description: post.summary || '',
        url: postUrl,
        guid: postUrl,
        date: publishDate,
        author: post.author?.[0]?.name || CONFIG.profile.name,
        categories: post.tags || [],
        enclosure: post.thumbnail ? {
          url: post.thumbnail,
          type: 'image/jpeg'
        } : undefined,
        custom_elements: [
          { 'content:encoded': post.summary || '' },
          ...(post.readingTime ? [{ 'readingTime': `${post.readingTime}분 읽기` }] : [])
        ]
      })
    })

    // XML 생성 및 응답
    const xml = feed.xml({ indent: true })

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(xml)

  } catch (error) {
    console.error('RSS feed generation error:', error)
    res.status(500).json({ error: 'Failed to generate RSS feed' })
  }
}