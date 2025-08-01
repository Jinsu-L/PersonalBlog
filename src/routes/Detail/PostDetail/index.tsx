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

// SeriesNavigation을 dynamic import로 로드 (SSR 비활성화)
const SeriesNavigation = dynamic(() => import("src/components/SeriesNavigation"), {
  ssr: false
})

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const { hasTocContent } = useTOC()
  const [isClient, setIsClient] = useState(false)
  
  // Hook은 항상 최상단에서 호출
  const allPosts = useAllPostsQuery()
  
  console.log('PostDetail: Has TOC content:', hasTocContent)

  // 클라이언트에서만 시리즈 데이터 로드
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined
  
  console.log('PostDetail: All posts data:', allPosts?.length || 0, 'posts')
  console.log('PostDetail: Current post data:', { id: data.id, title: data.title, series: data.series })
  
  // 시리즈 데이터 가져오기 (클라이언트에서만)
  const seriesData = isClient && allPosts && allPosts.length > 0 ? getSeriesData(allPosts, data.id) : null
  console.log('PostDetail: Series data:', seriesData)

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
        
        {/* TOC를 포스트 옆에 배치 */}
        <StyledInlineTOC>
          <TableOfContents
            variant="sidebar"
            hasTocContent={hasTocContent}
          />
        </StyledInlineTOC>
      </StyledContentWrapper>
    </StyledWrapper>
  )
}

export default PostDetail

const StyledWrapper = styled.div`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  margin: 0 auto;
  max-width: 90rem;
  /* sticky positioning을 위해 overflow 제거 */

  ${respondMobile} {
    max-width: 56rem;
  }
`

const StyledContentWrapper = styled.div`
  display: flex;
  gap: 0;
  align-items: flex-start;
  justify-content: center;
  position: relative;

  ${respondMobile} {
    flex-direction: column;
    gap: 0;
  }
`

const StyledSidebarTOC = styled.div`
  /* fixed positioning을 사용하므로 레이아웃에서 제외 */
  position: absolute;
  top: 0;
  right: -270px;
  width: 250px;
  
  /* 시리즈 네비게이션이 있을 때를 고려한 위치 조정 */
  margin-top: 0;

  /* 화면이 너무 작으면 숨김 */
  @media (max-width: 1400px) {
    display: none;
  }

  ${respondMobile} {
    display: none;
  }
`

const StyledMainContent = styled.div`
  width: 56rem;
  max-width: 56rem;
  border-radius: 1.5rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 3rem;

  > article {
    margin: 0 auto;
    max-width: 42rem;
  }

  ${respondMobile} {
    width: 100%;
    max-width: 100%;
    padding: 1.5rem;
    border-radius: 1.5rem;
  }
`

const StyledInlineTOC = styled.div`
  flex-shrink: 0;
  width: 250px;
  margin-left: 2rem;

  /* 화면이 너무 작으면 숨김 */
  @media (max-width: 1400px) {
    display: none;
  }

  ${respondMobile} {
    display: none;
  }
`
