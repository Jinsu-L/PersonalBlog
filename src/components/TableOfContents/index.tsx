import React, { useState } from "react"
import styled from "@emotion/styled"
import { respondMobile } from "src/styles/media"

interface TableOfContentsProps {
  className?: string
  variant?: "sidebar"
  hasTocContent?: boolean
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  className,
  variant = "sidebar",
  hasTocContent = false,
}) => {
  // TOC 링크 클릭 핸들러
  const handleTocClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('toc-link')) {
      event.preventDefault()
      const href = target.getAttribute('href')
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1)
        const targetElement = document.getElementById(targetId)
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    }
  }

  return (
    <StyledWrapper 
      className={className} 
      data-variant={variant}
      data-toc-ignore="true"
      style={{ display: hasTocContent ? 'block' : 'none' }}
    >
      <StyledHeader>
        <StyledTitle>목차</StyledTitle>
      </StyledHeader>
      
      <StyledTocContainer 
        className="toc-container" 
        onClick={handleTocClick}
      />
    </StyledWrapper>
  )
}

export default TableOfContents

const StyledWrapper = styled.div`
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray2 : theme.colors.gray3};
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray4 : theme.colors.gray6};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &[data-variant="sidebar"] {
    position: sticky;
    top: 2rem;
    max-height: calc(100vh - 4rem);
    width: 250px;
    z-index: 10;
    
    /* 화면이 작으면 완전히 숨김 */
    @media (max-width: 1400px) {
      display: none !important;
    }
  }
`

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray4 : theme.colors.gray6};
`

const StyledTitle = styled.div`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray12 : theme.colors.gray12};
`



const StyledTocContainer = styled.div`
  /* 데스크톱 전용 동적 높이 */
  max-height: calc(100vh - 12rem);
  overflow-y: auto;
  
  /* tocbot 프로그레스 바 완전히 숨기기 */
  .toc-progress,
  .toc-progress-container,
  .toc-progress-bar,
  .toc-progress-line {
    display: none !important;
  }
  
  /* tocbot의 모든 프로그레스 관련 요소들 숨기기 */
  *[class*="progress"] {
    display: none !important;
  }
  
  /* 세로 라인이나 연결선 제거 */
  .toc-list::before,
  .toc-list-item::before,
  .toc-link::before {
    display: none !important;
  }
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray6 : theme.colors.gray8};
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray8 : theme.colors.gray10};
  }

  /* tocbot 기본 스타일 오버라이드 */
  .toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    line-height: 1.4;
  }

  .toc-list-item {
    margin: 0;
    padding: 0;
  }

  .toc-link {
    display: block;
    padding: 0.375rem 0.5rem;
    color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray11 : theme.colors.gray11};
    text-decoration: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    line-height: 1.4;
    border: none;
    background: none;

    &:hover {
      background-color: ${({ theme }) =>
        theme.scheme === "light" ? theme.colors.indigo3 : theme.colors.indigo3};
      color: ${({ theme }) =>
        theme.scheme === "light" ? theme.colors.indigo11 : theme.colors.indigo11};
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.indigo8};
      outline-offset: 2px;
    }

    &.is-active-link {
      background-color: ${({ theme }) =>
        theme.scheme === "light" ? theme.colors.indigo4 : theme.colors.indigo4};
      color: ${({ theme }) =>
        theme.scheme === "light" ? theme.colors.indigo12 : theme.colors.indigo12};
      font-weight: 600;
    }
  }

  /* 중첩된 목록 들여쓰기 (3단계까지만) */
  .toc-list .toc-list {
    padding-left: 1rem;
    margin-top: 0.25rem;
  }

  .toc-list .toc-list .toc-list {
    padding-left: 1.5rem;
  }

  /* 레벨별 스타일 (3단계까지만) */
  .toc-list > .toc-list-item > .toc-link {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .toc-list .toc-list > .toc-list-item > .toc-link {
    font-weight: 500;
    font-size: 0.875rem;
  }

  .toc-list .toc-list .toc-list > .toc-list-item > .toc-link {
    font-weight: 400;
    font-size: 0.85rem;
  }

  /* 활성 상태 스타일 */
  .toc-list-item.is-active-li > .toc-link {
    color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.indigo12 : theme.colors.indigo12};
  }

  /* 접힌 상태 스타일 */
  .toc-list-item.is-collapsed .toc-list {
    display: none;
  }
`