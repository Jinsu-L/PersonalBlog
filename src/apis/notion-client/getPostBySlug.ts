import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"
import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { calculatePostReadingTime } from "src/libs/utils/readingTime"
import { TPost } from "src/types"

/**
 * slug로 개별 포스트를 효율적으로 가져옵니다
 * @param slug - 포스트 slug
 * @returns 포스트 데이터
 */
export const getPostBySlug = async (slug: string): Promise<TPost | null> => {
  try {
    let id = CONFIG.notionConfig.pageId as string
    const api = new NotionAPI()

    const response = await api.getPage(id)
    id = idToUuid(id)
    const collection = Object.values(response.collection)[0]?.value
    const block = response.block
    const schema = collection?.schema

    const rawMetadata = block[id].value

    if (
      rawMetadata?.type !== "collection_view_page" &&
      rawMetadata?.type !== "collection_view"
    ) {
      return null
    }

    // 모든 페이지 ID 가져오기
    const pageIds = getAllPageIds(response)
    
    // slug에 해당하는 포스트 찾기
    let targetPostId: string | null = null
    
    for (const pageId of pageIds) {
      const properties = await getPageProperties(pageId, block, schema)
      if (properties?.slug === slug) {
        targetPostId = pageId
        break
      }
    }

    if (!targetPostId) {
      return null
    }

    // 타겟 포스트 데이터 구성
    const properties = await getPageProperties(targetPostId, block, schema)
    if (!properties) {
      return null
    }

    // 기본 속성 추가
    properties.createdTime = new Date(block[targetPostId].value?.created_time).toString()
    properties.fullWidth = (block[targetPostId].value?.format as any)?.page_full_width ?? false

    // 읽기 시간 계산 (캐시 활용)
    const lastEditedTime = block[targetPostId].value?.last_edited_time
    const readingTimeResult = calculatePostReadingTime(
      properties.summary,
      response,
      targetPostId,
      lastEditedTime ? String(lastEditedTime) : undefined
    )
    properties.readingTime = readingTimeResult.minutes

    return properties as TPost
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}