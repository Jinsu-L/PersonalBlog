import { CONFIG } from "site.config"
import Head from "next/head"
import { TPost } from "src/types"
import { getPostImage, getValidImageUrl, getImageMetadata } from "src/libs/utils/imageUtils"

export type MetaConfigProps = {
  title: string
  description: string
  type: "Website" | "Post" | "Page" | string
  date?: string
  image?: string
  url: string
  post?: TPost // 포스트 데이터 (구조화된 데이터용)
  keywords?: string[] // SEO 키워드
  readingTime?: number // 읽기 시간
}

// 설명 텍스트를 SEO에 적합한 길이로 자동 요약
const truncateDescription = (description: string, maxLength: number = 160): string => {
  if (!description) return ""
  if (description.length <= maxLength) return description
  
  // 단어 경계에서 자르기
  const truncated = description.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }
  
  return truncated + '...'
}



// JSON-LD 구조화된 데이터 생성
const generateStructuredData = (props: MetaConfigProps, imageUrl: string) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": CONFIG.blog.title,
    "description": CONFIG.blog.description,
    "url": CONFIG.link,
    "author": {
      "@type": "Person",
      "name": CONFIG.profile.name,
      "url": CONFIG.link,
      "image": CONFIG.profile.image,
      "jobTitle": CONFIG.profile.role,
      "description": CONFIG.profile.bio,
      "email": CONFIG.profile.email?.replace('@@', '@'),
      "sameAs": [
        CONFIG.profile.github && `https://github.com/${CONFIG.profile.github}`,
        CONFIG.profile.linkedin && `https://linkedin.com/in/${CONFIG.profile.linkedin}`,
        CONFIG.profile.instagram && `https://instagram.com/${CONFIG.profile.instagram}`,
      ].filter(Boolean)
    }
  }

  if (props.type === "Post" && props.post) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": props.title,
      "description": truncateDescription(props.description),
      "image": imageUrl,
      "url": props.url,
      "datePublished": props.date,
      "dateModified": props.date,
      "author": {
        "@type": "Person",
        "name": CONFIG.profile.name,
        "url": CONFIG.link,
        "image": CONFIG.profile.image
      },
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.blog.title,
        "url": CONFIG.link,
        "logo": {
          "@type": "ImageObject",
          "url": CONFIG.profile.image
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": props.url
      },
      "keywords": props.keywords?.join(', ') || props.post.tags?.join(', ') || '',
      "wordCount": props.post.readingTime ? props.post.readingTime * 200 : undefined,
      "timeRequired": props.readingTime ? `PT${props.readingTime}M` : undefined,
      "articleSection": props.post.category?.[0] || "Blog",
      "inLanguage": CONFIG.lang || "ko-KR"
    }
  }

  return baseData
}

const MetaConfig: React.FC<MetaConfigProps> = (props) => {
  const truncatedDescription = truncateDescription(props.description)
  
  // 이미지 처리 개선
  const finalImage = props.image ? 
    getValidImageUrl(props.image, props.title) : 
    (props.post ? getPostImage(props.post) : getValidImageUrl(undefined, props.title))
  
  const imageMetadata = getImageMetadata(finalImage)
  const structuredData = generateStructuredData(props, finalImage)
  
  // 키워드 생성 (태그 + 카테고리)
  const keywords = props.keywords || [
    ...(props.post?.tags || []),
    ...(props.post?.category || []),
    CONFIG.blog.title,
    CONFIG.profile.name
  ].filter(Boolean)

  return (
    <Head>
      <title>{props.title}</title>
      <meta name="robots" content="follow, index" />
      <meta charSet="UTF-8" />
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={CONFIG.profile.name} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={props.url} />
      
      {/* OpenGraph - Enhanced */}
      <meta property="og:type" content={props.type === "Post" ? "article" : "website"} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:url" content={props.url} />
      <meta property="og:site_name" content={CONFIG.blog.title} />
      <meta property="og:image" content={imageMetadata.url} />
      <meta property="og:image:width" content={imageMetadata.width.toString()} />
      <meta property="og:image:height" content={imageMetadata.height.toString()} />
      <meta property="og:image:alt" content={props.title} />
      <meta property="og:image:type" content="image/png" />
      {CONFIG.lang && <meta property="og:locale" content={CONFIG.lang} />}
      
      {/* Twitter Card - Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={imageMetadata.url} />
      <meta name="twitter:image:alt" content={props.title} />
      <meta name="twitter:site" content={`@${CONFIG.profile.name}`} />
      <meta name="twitter:creator" content={`@${CONFIG.profile.name}`} />
      
      {/* Article specific meta tags */}
      {props.type === "Post" && (
        <>
          <meta property="article:published_time" content={props.date} />
          <meta property="article:modified_time" content={props.date} />
          <meta property="article:author" content={CONFIG.profile.name} />
          <meta property="article:section" content={props.post?.category?.[0] || "Blog"} />
          {props.post?.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
          {props.readingTime && (
            <meta name="twitter:label1" content="읽는 시간" />
          )}
          {props.readingTime && (
            <meta name="twitter:data1" content={`${props.readingTime}분`} />
          )}
        </>
      )}
      
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2)
        }}
      />
    </Head>
  )
}

export default MetaConfig
