import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { calculatePostReadingTime } from "src/libs/utils/readingTime"
import { TPost } from "src/types"

/**
 * 개별 포스트 데이터를 가져옵니다 (읽기 시간 포함)
 * @param postId - 포스트 ID
 * @returns 포스트 데이터
 */
export const getPost = async (postId: string): Promise<TPost | null> => {
  try {
    const api = new NotionAPI()
    const pageId = CONFIG.notionConfig.pageId as string
    
    // 메인 페이지 데이터 가져오기
    const response = await api.getPage(pageId)
    const collection = Object.values(response.collection)[0]?.value
    const block = response.block
    const schema = collection?.schema

    if (!block[postId]) {
      return null
    }

    // 개별 포스트 속성 가져오기
    const properties = await getPageProperties(postId, block, schema)
    if (!properties) {
      return null
    }

    // 기본 속성 추가
    properties.createdTime = new Date(block[postId].value?.created_time).toString()
    properties.fullWidth = (block[postId].value?.format as any)?.page_full_width ?? false

    // 읽기 시간 계산 (캐시 활용)
    const lastEditedTime = block[postId].value?.last_edited_time
    const readingTimeResult = calculatePostReadingTime(
      properties.summary,
      response,
      postId,
      lastEditedTime
    )
    properties.readingTime = readingTimeResult.minutes

    return properties as TPost
  } catch (error) {
    console.error('Error fetching individual post:', error)
    return null
  }
}