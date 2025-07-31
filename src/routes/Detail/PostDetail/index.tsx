import React from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import TableOfContents from "src/components/TableOfContents"
import styled from "@emotion/styled"
import NotionRenderer from "../components/NotionRenderer"
import usePostQuery from "src/hooks/usePostQuery"
import { useTOC } from "src/hooks/useTOC"
import { respondMobile } from "src/styles/media"

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const { hasTocContent } = useTOC()
  
  console.log('PostDetail: Has TOC content:', hasTocContent)

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined

  return (
    <StyledWrapper>
      <StyledContentWrapper>
        {/* 데스크톱 전용 사이드바 TOC */}
        <StyledSidebarTOC>
          <TableOfContents
            variant="sidebar"
            hasTocContent={hasTocContent}
          />
        </StyledSidebarTOC>
        
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
  gap: 2rem;
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
  margin: 0 auto; /* 중앙 정렬 */
  border-radius: 1.5rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 3rem;
  position: relative; /* TOC 위치 기준점 */

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
