import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import TableOfContents from "src/components/TableOfContents"
import styled from "@emotion/styled"
import NotionRenderer from "../components/NotionRenderer"
import usePostQuery from "src/hooks/usePostQuery"
import useAllPostsQuery from "src/hooks/useAllPostsQuery"
import { useTOC } from "src/hooks/useTOC"
import { getSeriesData } from "src/libs/utils/series"
import { respondMobile } from "src/styles/media"
import { logger } from "src/libs/utils/logger"

// SeriesNavigation을 dynamic import로 로드 (SSR 비활성화)
const SeriesNavigation = dynamic(() => import("src/components/SeriesNavigation"), {
  ssr: false
})

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const { tocItems, activeId, isVisible: hasTocContent, scrollToHeading } = useTOC()
  const [isClient, setIsClient] = useState(false)

  // Hook은 항상 최상단에서 호출
  const allPosts = useAllPostsQuery()

  logger.debug('PostDetail rendered', { 
    hasTocContent, 
    postId: data?.id, 
    postTitle: data?.title 
  })

  // 클라이언트에서만 시리즈 데이터 로드
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined

  // 시리즈 데이터 가져오기 (클라이언트에서만)
  const seriesData = isClient && allPosts && allPosts.length > 0 ? getSeriesData(allPosts, data.id) : null

  return (
    <StyledWrapper>
      <StyledContentWrapper>


        <StyledMainContent>
          <article>
            {category && (
              <div css={{ marginBottom: "0.5rem" }}>
                <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
                  {category}
                </Category>
              </div>
            )}
            {data.type[0] === "Post" && <PostHeader data={data} />}

            {/* 시리즈 네비게이션을 본문 위로 이동 */}
            {data.type[0] === "Post" && seriesData && (
              <div style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                <SeriesNavigation seriesData={seriesData} />
              </div>
            )}

            <div>
              <NotionRenderer recordMap={data.recordMap} />
            </div>
            {data.type[0] === "Post" && (
              <>
                <Footer />
                <CommentBox data={data} />
              </>
            )}
          </article>
        </StyledMainContent>

        {/* TOC를 포스트 옆에 배치 (Paper 타입 제외) */}
        {data.type[0] !== "Paper" && (
          <StyledInlineTOC>
            <TableOfContents
              variant="sidebar"
              items={tocItems}
              activeId={activeId}
              onItemClick={scrollToHeading}
              isVisible={hasTocContent}
            />
          </StyledInlineTOC>
        )}
      </StyledContentWrapper>
    </StyledWrapper>
  )
}

export default PostDetail

const StyledWrapper = styled.div`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 1rem;
  padding-bottom: 2rem;
  margin: 0 auto;
  max-width: 150rem; /* 포스트 94rem + TOC 280px + 간격을 위해 충분히 넓게 */
  /* sticky 동작을 위해 높이 제한 제거 */
  min-height: 100vh;

  ${respondMobile} {
    max-width: 94rem; /* 모바일에서도 최대한 넓게 */
    padding-left: 0; /* 모바일 외부 좌우 여백 0 */
    padding-right: 0;
    padding-top: 0.5rem; /* 모바일 외부 상단 여백을 더 줄임 */
  }
`

const StyledContentWrapper = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  /* sticky 동작을 위해 높이와 overflow 제한 해제 */
  min-height: 100vh;

  ${respondMobile} {
    flex-direction: column;
    gap: 0;
  }
`



const StyledMainContent = styled.div`
  width: 56rem; /* 이전 크기로 복구 (896px) */
  max-width: 56rem;
  border-radius: 1.5rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 3rem;

  > article {
    margin: 0 auto;
    max-width: 50rem; /* 이전보다 조금 더 넓게 (800px) */
  }

  /* TOC가 없을 때 (1300px 이하) 포스트 크기 제한 */
  @media (max-width: 1300px) {
    max-width: 62.5rem; /* TOC 없을 때는 1000px로 제한 */
    
    > article {
      max-width: 56.5rem; /* 포스트 내용은 약 904px */
    }
  }

  ${respondMobile} {
    width: 100%;
    max-width: 100%;
    padding: 1.5rem; /* 모바일 내부 패딩을 늘림 */
    border-radius: 1.5rem;
  }
`

const StyledInlineTOC = styled.div`
  flex-shrink: 0;
  width: 280px;
  height: fit-content;
  /* sticky 동작을 보장하기 위한 설정 */
  position: relative;

  /* 화면이 너무 작으면 숨김 */
  @media (max-width: 1300px) {
    display: none;
  }

  ${respondMobile} {
    display: none;
  }
`
