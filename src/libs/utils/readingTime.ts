import readingTime from 'reading-time'

// 읽기 시간 캐시 (메모리 기반, LRU 방식)
const MAX_CACHE_SIZE = 100
const readingTimeCache = new Map<string, ReadingTimeResult>()

// LRU 캐시 관리
function manageCacheSize() {
  if (readingTimeCache.size > MAX_CACHE_SIZE) {
    const firstKey = readingTimeCache.keys().next().value
    readingTimeCache.delete(firstKey)
  }
}

interface ReadingTimeResult {
  minutes: number
  text: string
  words: number
}

/**
 * 포스트의 읽기 시간을 계산합니다.
 * 한국어와 영어 텍스트를 모두 고려하여 계산합니다.
 * 
 * @param content - 포스트 내용 (HTML 또는 텍스트)
 * @param options - 계산 옵션
 * @returns 읽기 시간 정보
 */
export function calculateReadingTime(
  content: string,
  options: {
    wordsPerMinute?: number
    includeImageTime?: boolean
    includeCodeTime?: boolean
  } = {}
): ReadingTimeResult {
  const {
    wordsPerMinute = 100,
    includeImageTime = true,
    includeCodeTime = true
  } = options

  // HTML 태그 제거
  const cleanText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // 한국어 문자 수 계산 (한글, 한자 포함)
  const koreanChars = (cleanText.match(/[\u3131-\u318E\u3200-\u321E\u3260-\u327E\uAC00-\uD7A3\u4E00-\u9FFF]/g) || []).length

  // 영어 단어 수 계산 (기본 reading-time 라이브러리 사용)
  const englishResult = readingTime(cleanText, { wordsPerMinute })

  // 한국어는 분당 약 300-400자 읽기 속도 (평균 350자)
  const koreanReadingTime = koreanChars / 350

  // 영어 읽기 시간 (분)
  const englishReadingTime = englishResult.minutes

  // 총 읽기 시간 계산
  let totalMinutes = koreanReadingTime + englishReadingTime

  // 이미지 추가 시간 (이미지당 12초)
  if (includeImageTime) {
    const imageCount = (content.match(/<img[^>]*>/gi) || []).length
    totalMinutes += (imageCount * 12) / 60 // 12초를 분으로 변환
  }

  // 코드 블록 추가 시간 (코드 블록당 30초)
  if (includeCodeTime) {
    const codeBlockCount = (content.match(/<pre[^>]*>|<code[^>]*>/gi) || []).length
    totalMinutes += (codeBlockCount * 30) / 60 // 30초를 분으로 변환
  }

  // 읽기 시간 반올림 (최소 1분)
  const finalMinutes = Math.max(1, Math.round(totalMinutes))

  return {
    minutes: finalMinutes,
    text: finalMinutes === 1 && totalMinutes < 1 ? '1분 미만 읽기' : `${finalMinutes}분 읽기`,
    words: englishResult.words + koreanChars
  }
}

/**
 * 노션 블록 데이터에서 텍스트 콘텐츠를 추출합니다.
 * 
 * @param blockMap - 노션 블록 맵
 * @param pageId - 페이지 ID
 * @returns 추출된 텍스트 콘텐츠
 */
export function extractTextFromNotionBlocks(blockMap: any, pageId: string): string {
  if (!blockMap || !blockMap.block) {
    return ''
  }

  const blocks = blockMap.block
  const pageBlock = blocks[pageId]

  if (!pageBlock || !pageBlock.value) {
    return ''
  }

  let textContent = ''

  // 재귀적으로 모든 블록의 텍스트 추출
  function extractFromBlock(blockId: string): void {
    const block = blocks[blockId]
    if (!block || !block.value) return

    const blockValue = block.value
    const blockType = blockValue.type

    // 다양한 블록 타입에서 텍스트 추출
    if (blockValue.properties) {
      // title 속성 (헤딩, 텍스트 블록 등)
      if (blockValue.properties.title) {
        const title = blockValue.properties.title
        if (Array.isArray(title)) {
          title.forEach((item: any) => {
            if (typeof item === 'string') {
              textContent += item + ' '
            } else if (Array.isArray(item) && item[0]) {
              textContent += item[0] + ' '
            }
          })
        }
      }

      // caption 속성 (이미지 캡션 등)
      if (blockValue.properties.caption) {
        const caption = blockValue.properties.caption
        if (Array.isArray(caption)) {
          caption.forEach((item: any) => {
            if (typeof item === 'string') {
              textContent += item + ' '
            } else if (Array.isArray(item) && item[0]) {
              textContent += item[0] + ' '
            }
          })
        }
      }
    }

    // 코드 블록의 경우 코드 내용도 포함
    if (blockType === 'code' && blockValue.properties?.title) {
      // 코드 블록은 이미 위에서 처리됨
    }

    // 자식 블록들도 처리
    if (blockValue.content && Array.isArray(blockValue.content)) {
      blockValue.content.forEach((childId: string) => {
        extractFromBlock(childId)
      })
    }
  }

  // 페이지의 모든 콘텐츠 블록 처리
  if (pageBlock.value.content && Array.isArray(pageBlock.value.content)) {
    pageBlock.value.content.forEach((blockId: string) => {
      extractFromBlock(blockId)
    })
  }

  return textContent.trim()
}

/**
 * 포스트 요약(summary)과 노션 블록 데이터를 결합하여 읽기 시간을 계산합니다.
 * 
 * @param summary - 포스트 요약
 * @param blockMap - 노션 블록 맵 (선택사항)
 * @param pageId - 페이지 ID (선택사항)
 * @returns 읽기 시간 정보
 */
export function calculatePostReadingTime(
  summary?: string,
  blockMap?: any,
  pageId?: string,
  lastEditedTime?: string
): ReadingTimeResult {
  // 클라이언트 사이드에서는 기본값 반환
  if (typeof window !== 'undefined') {
    return {
      minutes: 1,
      text: '1분 읽기',
      words: 0
    }
  }

  // 캐시 키 생성 (pageId + lastEditedTime + summary 해시)
  const cacheKey = pageId ?
    `${pageId}-${lastEditedTime || 'no-time'}-${(summary || '').length}` :
    `summary-${(summary || '').slice(0, 50)}`

  // 캐시된 결과가 있으면 반환
  if (readingTimeCache.has(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📖 Using cached reading time for:', pageId?.substring(0, 8))
    }
    return readingTimeCache.get(cacheKey)!
  }

  // 개발 환경에서 새로운 계산 로그
  if (process.env.NODE_ENV === 'development') {
    console.log('📖 Calculating new reading time for:', {
      pageId: pageId?.substring(0, 8) + '...',
      summaryLength: summary?.length || 0,
      hasBlockMap: !!blockMap,
      lastEditedTime
    })
  }

  let content = summary || ''

  // 노션 블록 데이터가 있으면 추가 텍스트 추출
  if (blockMap && pageId) {
    const notionText = extractTextFromNotionBlocks(blockMap, pageId)
    content += ' ' + notionText
  }

  const result = calculateReadingTime(content, {
    wordsPerMinute: 200,
    includeImageTime: true,
    includeCodeTime: true
  })

  // 결과를 캐시에 저장
  manageCacheSize()
  readingTimeCache.set(cacheKey, result)

  // 개발 환경에서 계산 결과 로그
  if (process.env.NODE_ENV === 'development') {
    console.log('📖 Reading time calculated and cached:', {
      minutes: result.minutes,
      contentLength: content.length,
      words: result.words,
      cacheKey: cacheKey.substring(0, 20) + '...'
    })
  }

  return result
}