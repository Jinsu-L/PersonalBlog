import { CONFIG } from "site.config"

/**
 * 포스트의 OpenGraph 이미지를 생성하거나 기본 이미지를 반환
 */
export const getPostImage = (post: {
  title: string
  thumbnail?: string
}): string => {
  // 1. 포스트에 썸네일이 있으면 사용
  if (post.thumbnail) {
    return post.thumbnail
  }

  // 2. OG 이미지 생성 URL이 설정되어 있으면 동적 생성
  if (CONFIG.ogImageGenerateURL) {
    return `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(post.title)}.png`
  }

  // 3. 기본 아바타 이미지 사용
  return `${CONFIG.link}/avatar.svg`
}

/**
 * 이미지 URL이 유효한지 확인하고 기본 이미지로 폴백
 */
export const getValidImageUrl = (imageUrl?: string, fallbackTitle?: string): string => {
  if (!imageUrl) {
    return getDefaultImage(fallbackTitle)
  }

  // 상대 경로인 경우 절대 경로로 변환
  if (imageUrl.startsWith('/')) {
    return `${CONFIG.link}${imageUrl}`
  }

  return imageUrl
}

/**
 * 기본 이미지 생성
 */
export const getDefaultImage = (title?: string): string => {
  if (title && CONFIG.ogImageGenerateURL) {
    return `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(title)}.png`
  }
  
  return `${CONFIG.link}/avatar.svg`
}

/**
 * OpenGraph 이미지 메타데이터 생성
 */
export const getImageMetadata = (imageUrl: string) => {
  return {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: "Blog post image"
  }
}