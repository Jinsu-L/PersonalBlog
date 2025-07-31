import { TPost } from "src/types"

export interface SeriesPost {
  id: string
  title: string
  slug: string
  order: number
  isCurrent: boolean
  date: { start_date: string }
  createdTime: string
}

export interface SeriesData {
  name: string
  posts: SeriesPost[]
  currentIndex: number
  totalCount: number
}

/**
 * 시리즈별로 포스트를 그룹핑하고 정렬하는 함수
 * @param posts 전체 포스트 목록
 * @param currentPostId 현재 포스트 ID
 * @returns 시리즈 데이터 또는 null (시리즈가 없는 경우)
 */
export function getSeriesData(posts: TPost[], currentPostId: string): SeriesData | null {
  // 현재 포스트 찾기
  const currentPost = posts.find(post => post.id === currentPostId)
  
  if (!currentPost || !currentPost.series) {
    return null
  }

  // 같은 시리즈의 포스트들 찾기
  const seriesPosts = posts.filter(post => 
    post.series === currentPost.series && 
    post.status.includes("Public")
  )

  if (seriesPosts.length <= 1) {
    return null
  }

  // 시리즈 순서대로 정렬 (seriesOrder 기준, 없으면 날짜 기준)
  seriesPosts.sort((a, b) => {
    // seriesOrder가 있으면 그것을 우선 사용
    if (a.seriesOrder !== undefined && b.seriesOrder !== undefined) {
      return a.seriesOrder - b.seriesOrder
    }
    
    // seriesOrder가 없으면 날짜 기준 (오래된 것부터)
    const dateA = new Date(a.date?.start_date || a.createdTime)
    const dateB = new Date(b.date?.start_date || b.createdTime)
    return dateA.getTime() - dateB.getTime()
  })

  // SeriesPost 형태로 변환
  const formattedPosts: SeriesPost[] = seriesPosts.map((post, index) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    order: index + 1,
    isCurrent: post.id === currentPostId,
    date: post.date,
    createdTime: post.createdTime
  }))

  // 현재 포스트의 인덱스 찾기
  const currentIndex = formattedPosts.findIndex(post => post.isCurrent)

  return {
    name: currentPost.series,
    posts: formattedPosts,
    currentIndex,
    totalCount: formattedPosts.length
  }
}

/**
 * 시리즈 내에서 이전/다음 포스트 정보를 가져오는 함수
 * @param seriesData 시리즈 데이터
 * @returns 이전/다음 포스트 정보
 */
export function getSeriesNavigation(seriesData: SeriesData) {
  const { posts, currentIndex } = seriesData
  
  return {
    previous: currentIndex > 0 ? posts[currentIndex - 1] : null,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    current: posts[currentIndex]
  }
}

/**
 * 시리즈 포스트 목록을 페이지네이션하는 함수
 * @param posts 시리즈 포스트 목록
 * @param currentPage 현재 페이지 (0부터 시작)
 * @param postsPerPage 페이지당 포스트 수 (기본값: 5)
 * @returns 페이지네이션된 포스트 목록과 메타데이터
 */
export function paginateSeriesPosts(
  posts: SeriesPost[], 
  currentPage: number = 0, 
  postsPerPage: number = 5
) {
  const totalPages = Math.ceil(posts.length / postsPerPage)
  const startIndex = currentPage * postsPerPage
  const endIndex = startIndex + postsPerPage
  
  return {
    posts: posts.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages - 1,
    hasPrevious: currentPage > 0,
    totalCount: posts.length
  }
}

/**
 * 현재 포스트가 포함된 페이지를 찾는 함수
 * @param posts 시리즈 포스트 목록
 * @param currentPostId 현재 포스트 ID
 * @param postsPerPage 페이지당 포스트 수
 * @returns 현재 포스트가 포함된 페이지 번호
 */
export function findCurrentPostPage(
  posts: SeriesPost[], 
  currentPostId: string, 
  postsPerPage: number = 5
): number {
  const currentIndex = posts.findIndex(post => post.id === currentPostId)
  if (currentIndex === -1) return 0
  
  return Math.floor(currentIndex / postsPerPage)
}

/**
 * 시리즈 요약 정보를 생성하는 함수
 * @param seriesData 시리즈 데이터
 * @returns 시리즈 요약 정보
 */
export function getSeriesSummary(seriesData: SeriesData) {
  const { name, posts, currentIndex, totalCount } = seriesData
  
  return {
    name,
    totalCount,
    currentPosition: currentIndex + 1,
    progress: Math.round(((currentIndex + 1) / totalCount) * 100),
    isFirst: currentIndex === 0,
    isLast: currentIndex === totalCount - 1
  }
}