import { ExtendedRecordMap } from "notion-types"
import { TOCItem } from "src/types"

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
  const result = buildHierarchicalTOC(headings)
  console.log('TOC: Hierarchical structure:', result)
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
 * 평면적인 헤딩 배열을 계층적 구조로 변환
 */
function buildHierarchicalTOC(headings: TOCItem[]): TOCItem[] {
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
 * TOC가 표시되어야 하는지 확인하는 함수
 * 헤딩이 3개 이상인 경우에만 TOC를 표시합니다.
 */
export function shouldShowTOC(headings: TOCItem[]): boolean {
  const totalHeadings = countTotalHeadings(headings)
  return totalHeadings >= 3
}

/**
 * 계층적 TOC 구조에서 총 헤딩 개수를 계산
 */
function countTotalHeadings(headings: TOCItem[]): number {
  let count = 0
  
  headings.forEach((heading) => {
    count += 1
    if (heading.children) {
      count += countTotalHeadings(heading.children)
    }
  })
  
  return count
}

/**
 * TOC 아이템을 평면적인 배열로 변환 (스크롤 동기화용)
 */
export function flattenTOC(headings: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = []
  
  function flatten(items: TOCItem[]) {
    items.forEach((item) => {
      result.push(item)
      if (item.children) {
        flatten(item.children)
      }
    })
  }
  
  flatten(headings)
  return result
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