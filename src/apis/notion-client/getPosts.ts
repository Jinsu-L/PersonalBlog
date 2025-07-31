import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { calculatePostReadingTime } from "src/libs/utils/readingTime"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  const api = new NotionAPI()

  try {
    const response = await api.getPage(id)
    id = idToUuid(id)
    const collection = Object.values(response.collection)[0]?.value
    const block = response.block
    const schema = collection?.schema



    const rawMetadata = block[id].value

    // Check Type
    if (
      rawMetadata?.type !== "collection_view_page" &&
      rawMetadata?.type !== "collection_view"
    ) {
      return []
    } else {
      // Construct Data
      const pageIds = getAllPageIds(response)
      const data = []
      for (let i = 0; i < pageIds.length; i++) {
        const id = pageIds[i]
        const properties = (await getPageProperties(id, block, schema)) || null
        
        if (!properties) {
          continue
        }
        
        // Add fullwidth, createdtime to properties
        properties.createdTime = new Date(
          block[id].value?.created_time
        ).toString()
        properties.fullWidth =
          (block[id].value?.format as any)?.page_full_width ?? false

        // Calculate reading time with caching
        const lastEditedTime = block[id].value?.last_edited_time
        const readingTimeResult = calculatePostReadingTime(
          properties.summary,
          response,
          id,
          lastEditedTime ? String(lastEditedTime) : undefined
        )
        properties.readingTime = readingTimeResult.minutes

        // Process series data
        if (properties.series && properties.series[0]) {
          // series는 배열로 저장되므로 첫 번째 값을 사용
          properties.series = properties.series[0]
          
          // If seriesOrder is not set, we'll calculate it later based on date
          if (!properties.seriesOrder && !properties.series_order) {
            properties.seriesOrder = null
          } else {
            // Use series_order if available, otherwise use seriesOrder
            properties.seriesOrder = properties.series_order || properties.seriesOrder
          }
        }

        data.push(properties)
      }

    // Sort by date
    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    // Process series ordering for posts without explicit order
    const seriesGroups: { [seriesName: string]: any[] } = {}
    
    // Group posts by series
    data.forEach((post: any) => {
      if (post.series) {
        if (!seriesGroups[post.series]) {
          seriesGroups[post.series] = []
        }
        seriesGroups[post.series].push(post)
      }
    })

    // Calculate series order for posts without explicit ordering
    Object.keys(seriesGroups).forEach(seriesName => {
      const seriesPosts = seriesGroups[seriesName]
      
      // Sort series posts by date (oldest first for series ordering)
      seriesPosts.sort((a: any, b: any) => {
        const dateA: any = new Date(a?.date?.start_date || a.createdTime)
        const dateB: any = new Date(b?.date?.start_date || b.createdTime)
        return dateA - dateB
      })

      // Assign series order to posts that don't have explicit ordering
      seriesPosts.forEach((post: any, index: number) => {
        if (post.seriesOrder === null || post.seriesOrder === undefined) {
          post.seriesOrder = index + 1
        }
      })
    })

      const posts = data as TPosts
      return posts
    }
  } catch (error) {
    console.error('getPosts: Error occurred:', error)
    return []
  }
}
