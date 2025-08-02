import { ExtendedRecordMap } from "notion-types"
import { TOCItem, TOCItemWithCache } from "../../types"

/**
 * TOC 데이터를 추출하는 유틸리티 함수
 * 노션 블록 데이터에서 헤딩 구조를 추출하여 계층적 TOC 구조를 생성합니다.
 */
export function extractTOCFromRecordMap(recordMap: ExtendedRecordMap): TOCItem[] {
  if (!recordMap || !recordMap.block) {
    console.log('TOC: No recordMap or blocks found')
    return []
  }

  const blocks = recordMap.block
  const headings: TOCItem[] = []

  // 모든 블록을 순회하면서 헤딩 블록을 찾습니다
  Object.keys(blocks).forEach((blockId) => {
    const block = blocks[blockId]?.value

    if (!block) return

    // 헤딩 블록 타입 확인 (header, sub_header, sub_sub_header)
    const headingLevel = getHeadingLevel(block.type)
    if (headingLevel === 0) return

    // 블록 제목 추출
    const title = getBlockTitle(block)
    if (!title) return

    // TOC 아이템 생성 (react-notion-x는 블록 ID를 그대로 사용)
    const tocItem: TOCItem = {
      id: blockId,
      title: title.trim(),
      level: headingLevel,
    }

    console.log('TOC: Found heading:', { id: blockId, title: title.trim(), level: headingLevel })
    headings.push(tocItem)
  })

  console.log('TOC: Total headings found:', headings.length)

  // 계층적 구조로 변환
  const result = buildBasicHierarchicalTOC(headings)
  console.log('TOC: Hierarchical structure:', result)
  return result
}

/**
 * 평면적인 헤딩 배열을 계층적 구조로 변환 (기본 TOCItem용)
 */
function buildBasicHierarchicalTOC(headings: TOCItem[]): TOCItem[] {
  if (headings.length === 0) return []

  const result: TOCItem[] = []
  const stack: TOCItem[] = []

  headings.forEach((heading) => {
    // 현재 헤딩보다 레벨이 높거나 같은 항목들을 스택에서 제거
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    // 스택이 비어있으면 최상위 레벨
    if (stack.length === 0) {
      result.push(heading)
    } else {
      // 부모 헤딩의 children에 추가
      const parent = stack[stack.length - 1]
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(heading)
    }

    // 현재 헤딩을 스택에 추가
    stack.push(heading)
  })

  return result
}

/**
 * 블록에서 제목 텍스트를 추출합니다
 */
function getBlockTitle(block: any): string {
  if (!block || !block.properties || !block.properties.title) {
    return ""
  }

  // Notion의 rich text 형식에서 텍스트 추출
  const title = block.properties.title
  if (Array.isArray(title)) {
    return title.map(item => {
      if (Array.isArray(item) && item.length > 0) {
        return item[0] // 첫 번째 요소가 텍스트
      }
      return ""
    }).join("")
  }

  return String(title)
}

/**
 * 블록 타입에 따른 헤딩 레벨 반환
 */
function getHeadingLevel(blockType: string): number {
  switch (blockType) {
    case 'header':
      return 1
    case 'sub_header':
      return 2
    case 'sub_sub_header':
      return 3
    default:
      return 0
  }
}







/**
 * 제목 텍스트를 기반으로 안전한 HTML ID를 생성합니다
 */
export function generateHeadingId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로 변경
    .trim()
}
/**

 * DOM 요소에서 헤딩 요소들을 추출하여 TOCItemWithCache 배열로 변환
 * 한 번의 DOM 순회로 모든 헤딩 정보를 수집합니다.
 */
export function extractHeadingsFromDOM(
  contentElement: HTMLElement,
  headingSelector: string = 'h1, h2, h3'
): TOCItemWithCache[] {
  if (!contentElement) {
    return []
  }

  const headings = contentElement.querySelectorAll(headingSelector)
  const tocItems: TOCItemWithCache[] = []

  headings.forEach((heading, index) => {
    const headingElement = heading as HTMLElement
    const level = getHeadingLevelFromTagName(headingElement.tagName)
    const title = headingElement.textContent?.trim() || ''

    if (!title) return

    // ID가 없으면 생성
    if (!headingElement.id) {
      headingElement.id = generateSafeHeadingId(title, index)
    }

    // TOCItemWithCache 생성
    const tocItem: TOCItemWithCache = {
      id: headingElement.id,
      title,
      level,
      element: headingElement,
      offsetTop: headingElement.offsetTop
    }

    tocItems.push(tocItem)
  })

  return tocItems
}

/**
 * HTML 태그명에서 헤딩 레벨을 추출
 */
function getHeadingLevelFromTagName(tagName: string): number {
  const match = tagName.match(/^H([1-6])$/i)
  return match ? parseInt(match[1], 10) : 1
}

/**
 * 안전한 헤딩 ID 생성 (한글 지원)
 * 기존 generateHeadingId 함수를 개선하여 한글과 특수문자를 더 잘 처리
 */
export function generateSafeHeadingId(title: string, fallbackIndex?: number): string {
  // 1. 기본 정리: 앞뒤 공백 제거
  let id = title.trim()

  // 2. 특수문자 처리 (한글, 영문, 숫자, 공백, 하이픈만 허용)
  id = id.replace(/[^a-zA-Z0-9가-힣\s-]/g, '')

  // 3. 연속된 공백을 하나의 하이픈으로 변경
  id = id.replace(/\s+/g, '-')

  // 4. 연속된 하이픈을 하나로 변경
  id = id.replace(/-+/g, '-')

  // 5. 시작과 끝의 하이픈 제거
  id = id.replace(/^-|-$/g, '')

  // 6. 소문자로 변환
  id = id.toLowerCase()

  // 7. 빈 문자열이면 fallback 사용
  if (!id && fallbackIndex !== undefined) {
    id = `heading-${fallbackIndex}`
  }

  return id || 'heading'
}

/**
 * TOCItemWithCache 배열을 계층적 구조로 변환
 */
export function buildHierarchicalTOC(items: TOCItemWithCache[]): TOCItemWithCache[] {
  if (items.length === 0) return []

  const result: TOCItemWithCache[] = []
  const stack: TOCItemWithCache[] = []

  items.forEach((item) => {
    // 현재 아이템보다 레벨이 높거나 같은 항목들을 스택에서 제거
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop()
    }

    // 스택이 비어있으면 최상위 레벨
    if (stack.length === 0) {
      result.push(item)
    } else {
      // 부모 아이템의 children에 추가
      const parent = stack[stack.length - 1]
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(item)
    }

    // 현재 아이템을 스택에 추가
    stack.push(item)
  })

  return result
}

/**
 * TOCItemWithCache 배열을 평면적인 배열로 변환 (스크롤 동기화용)
 */
export function flattenTOC(items: TOCItemWithCache[]): TOCItemWithCache[] {
  const result: TOCItemWithCache[] = []

  function flatten(tocItems: TOCItemWithCache[]) {
    tocItems.forEach((item) => {
      result.push(item)
      if (item.children) {
        flatten(item.children)
      }
    })
  }

  flatten(items)
  return result
}

/**
 * DOM 요소의 스크롤 위치를 업데이트 (캐싱된 offsetTop 갱신)
 */
export function updateTOCItemOffsets(items: TOCItemWithCache[]): void {
  const flatItems = flattenTOC(items)

  flatItems.forEach((item) => {
    if (item.element) {
      item.offsetTop = item.element.offsetTop
    }
  })
}

/**
 * 헤딩 요소가 충분한지 확인
 */
export function shouldShowTOC(items: TOCItemWithCache[], minHeadings: number = 3): boolean {
  const totalHeadings = countTotalHeadings(items)
  return totalHeadings >= minHeadings
}

/**
 * TOCItemWithCache 배열에서 총 헤딩 개수를 계산
 */
function countTotalHeadings(items: TOCItemWithCache[]): number {
  let count = 0

  items.forEach((item) => {
    count += 1
    if (item.children) {
      count += countTotalHeadings(item.children)
    }
  })

  return count
}
/**

 * DOM 기반 TOC 데이터 추출 함수 (기존 extractTOCFromRecordMap 대체)
 * 한 번의 DOM 순회로 모든 헤딩 정보를 수집하고 계층적 구조로 변환합니다.
 * 
 * @param contentSelector - 콘텐츠 요소를 찾기 위한 CSS 선택자 (기본값: 'article')
 * @param headingSelector - 헤딩 요소를 찾기 위한 CSS 선택자 (기본값: 'h1, h2, h3')
 * @param minHeadings - TOC를 표시하기 위한 최소 헤딩 개수 (기본값: 3)
 * @returns TOCItemWithCache 배열 (계층적 구조)
 */
export function extractTOCFromDOM(
  contentSelector: string = 'article',
  headingSelector: string = 'h1, h2, h3',
  minHeadings: number = 3
): TOCItemWithCache[] {
  // 1. 콘텐츠 요소 찾기
  const contentElement = document.querySelector(contentSelector) as HTMLElement
  if (!contentElement) {
    console.warn(`TOC: Content element not found with selector: ${contentSelector}`)
    return []
  }

  // DOM에서 직접 헤딩 개수 확인
  const allHeadings = contentElement.querySelectorAll(headingSelector)
  console.info(`TOC: Found ${allHeadings.length} headings with selector "${headingSelector}"`)

  // 2. 헤딩 요소들을 한 번의 DOM 순회로 추출
  const flatTOCItems = extractHeadingsFromDOM(contentElement, headingSelector)

  // 3. 최소 헤딩 개수 확인
  if (flatTOCItems.length < minHeadings) {
    console.info(`TOC: Not enough headings found (${flatTOCItems.length}/${minHeadings})`)
    return []
  }

  // 4. 계층적 구조로 변환
  const hierarchicalTOC = buildHierarchicalTOC(flatTOCItems)

  console.info(`TOC: Successfully extracted ${flatTOCItems.length} headings in hierarchical structure`)
  return hierarchicalTOC
}

/**
 * 메모이제이션을 위한 TOC 데이터 캐시
 */
const tocCache = new Map<string, {
  items: TOCItemWithCache[]
  contentHash: string
  timestamp: number
}>()

/**
 * 캐시된 TOC 데이터 추출 함수 (메모이제이션 적용)
 * 콘텐츠가 변경되지 않았다면 캐시된 결과를 반환합니다.
 * 
 * @param contentSelector - 콘텐츠 요소를 찾기 위한 CSS 선택자
 * @param headingSelector - 헤딩 요소를 찾기 위한 CSS 선택자
 * @param minHeadings - TOC를 표시하기 위한 최소 헤딩 개수
 * @param cacheKey - 캐시 키 (기본값: contentSelector)
 * @returns TOCItemWithCache 배열 (계층적 구조)
 */
export function extractTOCWithCache(
  contentSelector: string = 'article',
  headingSelector: string = 'h1, h2, h3',
  minHeadings: number = 3,
  cacheKey: string = contentSelector
): TOCItemWithCache[] {
  const contentElement = document.querySelector(contentSelector) as HTMLElement
  if (!contentElement) {
    return []
  }

  // 콘텐츠 해시 생성 (innerHTML 기반)
  const contentHash = generateContentHash(contentElement.innerHTML)
  const cached = tocCache.get(cacheKey)

  // 캐시된 데이터가 있고 콘텐츠가 변경되지 않았다면 캐시 반환
  if (cached && cached.contentHash === contentHash) {
    console.debug('TOC: Using cached TOC data')

    // 캐시된 데이터의 DOM 요소 참조와 offsetTop 업데이트
    updateTOCItemOffsets(cached.items)
    return cached.items
  }

  // 새로운 TOC 데이터 추출
  const tocItems = extractTOCFromDOM(contentSelector, headingSelector, minHeadings)

  // 캐시에 저장
  tocCache.set(cacheKey, {
    items: tocItems,
    contentHash,
    timestamp: Date.now()
  })

  console.debug('TOC: Generated and cached new TOC data')
  return tocItems
}

/**
 * 콘텐츠 해시 생성 (간단한 해시 함수)
 */
function generateContentHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32비트 정수로 변환
  }
  return hash.toString(36)
}

/**
 * TOC 캐시 정리 함수 (메모리 관리용)
 * 오래된 캐시 항목들을 제거합니다.
 * 
 * @param maxAge - 캐시 유지 시간 (밀리초, 기본값: 5분)
 */
export function clearOldTOCCache(maxAge: number = 5 * 60 * 1000): void {
  const now = Date.now()
  const keysToDelete: string[] = []

  tocCache.forEach((value, key) => {
    if (now - value.timestamp > maxAge) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach(key => {
    tocCache.delete(key)
  })

  if (keysToDelete.length > 0) {
    console.debug(`TOC: Cleared ${keysToDelete.length} old cache entries`)
  }
}

/**
 * 전체 TOC 캐시 초기화
 */
export function clearAllTOCCache(): void {
  tocCache.clear()
  console.debug('TOC: Cleared all cache entries')
}