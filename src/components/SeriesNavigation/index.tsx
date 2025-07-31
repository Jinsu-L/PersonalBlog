import React, { useState } from "react"
import styled from "@emotion/styled"
import Link from "next/link"
import { SeriesData, SeriesPost, paginateSeriesPosts, findCurrentPostPage } from "src/libs/utils/series"

interface SeriesNavigationProps {
  seriesData: SeriesData
  className?: string
  postsPerPage?: number
}

const SeriesNavigation: React.FC<SeriesNavigationProps> = ({
  seriesData,
  className,
  postsPerPage = 5,
}) => {
  const { name, posts, currentIndex, totalCount } = seriesData
  
  // 접기/펼치기 상태 (기본값: 숨김)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 현재 포스트가 포함된 페이지를 초기 페이지로 설정
  const initialPage = findCurrentPostPage(posts, posts[currentIndex].id, postsPerPage)
  const [currentPage, setCurrentPage] = useState(initialPage)
  
  // 페이지네이션 적용
  const paginatedData = paginateSeriesPosts(posts, currentPage, postsPerPage)
  const { posts: displayPosts, hasNext, hasPrevious, totalPages } = paginatedData
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }
  
  const handlePrevPage = () => {
    if (hasPrevious) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <StyledWrapper className={className} data-toc-ignore="true">
      <StyledHeader>
        <StyledTitleSection>
          <StyledTitle>{name}</StyledTitle>
          <StyledProgress>
            {currentIndex + 1} / {totalCount}
          </StyledProgress>
        </StyledTitleSection>
        <StyledToggleButton onClick={handleToggle} aria-expanded={isExpanded}>
          {isExpanded ? "숨기기" : "목록 보기"}
        </StyledToggleButton>
      </StyledHeader>
      
      {isExpanded && (
        <>
          <StyledPostList>
            {displayPosts.map((post, index) => (
              <StyledPostItem key={post.id} $isCurrent={post.isCurrent}>
                {post.isCurrent ? (
                  <StyledCurrentPost>
                    <StyledPostNumber>{post.order}.</StyledPostNumber>
                    <StyledPostTitle>{post.title}</StyledPostTitle>
                  </StyledCurrentPost>
                ) : (
                  <Link href={`/${post.slug}`} passHref>
                    <StyledPostLink>
                      <StyledPostNumber>{post.order}.</StyledPostNumber>
                      <StyledPostTitle>{post.title}</StyledPostTitle>
                    </StyledPostLink>
                  </Link>
                )}
              </StyledPostItem>
            ))}
          </StyledPostList>
          
          {totalPages > 1 && (
            <StyledPagination>
              <StyledPaginationButton 
                onClick={handlePrevPage} 
                disabled={!hasPrevious}
                aria-label="이전 페이지"
              >
                ←
              </StyledPaginationButton>
              
              <StyledPageInfo>
                {currentPage + 1} / {totalPages}
              </StyledPageInfo>
              
              <StyledPaginationButton 
                onClick={handleNextPage} 
                disabled={!hasNext}
                aria-label="다음 페이지"
              >
                →
              </StyledPaginationButton>
            </StyledPagination>
          )}
        </>
      )}
    </StyledWrapper>
  )
}

export default SeriesNavigation

const StyledWrapper = styled.div`
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray2 : theme.colors.gray3};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray4 : theme.colors.gray6};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0; /* 외부에서 마진 제어 */
`

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray4 : theme.colors.gray6};
`

const StyledTitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const StyledTitle = styled.div`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray12 : theme.colors.gray12};
`

const StyledProgress = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray10 : theme.colors.gray10};
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo3 : theme.colors.indigo3};
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
`

const StyledToggleButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray6 : theme.colors.gray6};
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray11 : theme.colors.gray11};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray3 : theme.colors.gray4};
    border-color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray7 : theme.colors.gray7};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.indigo8};
    outline-offset: 2px;
  }
`

const StyledPostList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: series-counter;
`

const StyledPostItem = styled.li<{ $isCurrent: boolean }>`
  margin: 0;
  padding: 0;
  
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`

const StyledPostLink = styled.a`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.indigo3 : theme.colors.indigo3};
    
    span:last-child {
      color: ${({ theme }) =>
        theme.scheme === "light" ? theme.colors.indigo11 : theme.colors.indigo11};
    }
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.indigo8};
    outline-offset: 2px;
  }
`

const StyledCurrentPost = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo4 : theme.colors.indigo4};
  border: 2px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo6 : theme.colors.indigo6};
  
  span:last-child {
    color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.indigo12 : theme.colors.indigo12};
    font-weight: 600;
  }
`

const StyledPostNumber = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo11 : theme.colors.indigo11};
  margin-right: 0.5rem;
  flex-shrink: 0;
  min-width: 1.5rem;
`

const StyledPostTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray11 : theme.colors.gray11};
`

const StyledPagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray4 : theme.colors.gray6};
`

const StyledPaginationButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray6 : theme.colors.gray6};
  border-radius: 6px;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray11 : theme.colors.gray11};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.indigo3 : theme.colors.indigo3};
    border-color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.indigo6 : theme.colors.indigo6};
    color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.indigo11 : theme.colors.indigo11};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.indigo8};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const StyledPageInfo = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray10 : theme.colors.gray10};
  min-width: 3rem;
  text-align: center;
`