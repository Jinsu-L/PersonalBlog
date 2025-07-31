import Detail from "src/routes/Detail"
import { filterPosts } from "src/libs/utils/notion"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "../types"
import CustomError from "src/routes/Error"
import { getRecordMap, getPosts, getPost } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { GetStaticProps } from "next"
import { queryClient } from "src/libs/react-query"
import { queryKey } from "src/constants/queryKey"
import { dehydrate } from "@tanstack/react-query"
import usePostQuery from "src/hooks/usePostQuery"
import { FilterPostsOptions } from "src/libs/utils/notion/filterPosts"
import { getPostImage } from "src/libs/utils/imageUtils"
import { extractTOCFromRecordMap } from "src/libs/utils/toc"

const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail"],
  acceptType: ["Paper", "Post", "Page"],
}

export const getStaticPaths = async () => {
  const posts = await getPosts()
  const filteredPost = filterPosts(posts, filter)

  return {
    paths: filteredPost.map((row) => `/${row.slug}`),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug

  // 방법 1: 전체 포스트 목록에서 찾기 (기존 방식 - 캐시 활용)
  const posts = await getPosts()
  const feedPosts = filterPosts(posts)
  
  // 메인 페이지용 필터링된 포스트 (기존 방식 유지)
  await queryClient.prefetchQuery(queryKey.posts(), () => feedPosts)
  
  // 시리즈 기능을 위해 전체 posts 데이터를 별도 키로 저장
  await queryClient.prefetchQuery(['posts', 'all'], () => posts)

  const detailPosts = filterPosts(posts, filter)
  const postDetail = detailPosts.find((t: any) => t.slug === slug)
  
  if (!postDetail) {
    return {
      notFound: true,
    }
  }

  const recordMap = await getRecordMap(postDetail.id)
  
  // TOC 데이터 추출
  const headings = extractTOCFromRecordMap(recordMap)

  await queryClient.prefetchQuery(queryKey.post(`${slug}`), () => ({
    ...postDetail,
    recordMap,
    headings,
  }))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const DetailPage: NextPageWithLayout = () => {
  const post = usePostQuery()

  if (!post) return <CustomError />

  const image = getPostImage(post)

  const date = post.date?.start_date || post.createdTime || ""

  const meta = {
    title: post.title,
    date: new Date(date).toISOString(),
    image: image,
    description: post.summary || CONFIG.blog.description,
    type: post.type[0],
    url: `${CONFIG.link}/${post.slug}`,
    post: post, // 구조화된 데이터를 위한 포스트 데이터
    readingTime: post.readingTime, // 읽기 시간
    keywords: [...(post.tags || []), ...(post.category || [])], // SEO 키워드
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Detail />
    </>
  )
}

DetailPage.getLayout = (page) => {
  return <>{page}</>
}

export default DetailPage
