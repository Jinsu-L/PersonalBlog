import React from "react"
import styled from "@emotion/styled"
import { respondMobile } from "src/styles/media"
import { TOCItemWithCache } from "src/types"

// TOC 아이템 렌더링 함수 (재귀적으로 계층 구조 처리)
const renderTocItems = (
  items: TOCItemWithCache[],
  activeId: string | null,
  handleClick: (event: React.MouseEvent<HTMLAnchorElement>) => void,
  handleKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => void
): React.ReactNode => {
  if (!items || items.length === 0) {
    return null
  }
  
  return items.map((item) => (
    <StyledTocItem key={item.id} role="listitem">
      <StyledTocLink
        href={`#${item.id}`}
        $isActive={activeId === item.id}
        $level={item.level}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${item.title} 섹션으로 이동`}
        aria-current={activeId === item.id ? 'location' : undefined}
        title={`${item.title} 섹션으로 이동`}
      >
        {item.title}
      </StyledTocLink>
      {item.children && item.children.length > 0 && (
        <StyledTocList role="list" aria-label={`${item.title} 하위 목차`}>
          {renderTocItems(item.children, activeId, handleClick, handleKeyDown)}
        </StyledTocList>
      )}
    </StyledTocItem>
  ))
}

interface TableOfContentsProps {
  items?: TOCItemWithCache[]
  activeId?: string | null
  onItemClick?: (id: string) => void
  hasTocContent?: boolean // 레거시 호환성
  className?: string
  variant?: "sidebar" | "inline"
  isVisible?: boolean
}

/**
 * TableOfContents 컴포넌트
 * 
 * 블로그 포스트의 헤딩 구조를 계층적으로 표시하고 부드러운 네비게이션을 제공합니다.
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({
  items = [],
  activeId = null,
  onItemClick = () => {},
  hasTocContent, // Legacy prop
  className,
  variant = "sidebar",
  isVisible = true,
}) => {
  // TOC 링크 클릭 핸들러 (Requirements: 2.1, 2.2, 2.3)
  const handleTocClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    event.stopPropagation()
    
    const href = event.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1)
      
      // 포커스를 링크에서 제거하여 키보드 네비게이션 개선
      event.currentTarget.blur()
      
      // 스크롤 이동 실행
      onItemClick(targetId)
    }
  }

  // 키보드 접근성 핸들러 (Requirements: 2.1, 2.2, 2.3)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    // Enter 또는 Space 키로 활성화
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      
      const href = event.currentTarget.getAttribute('href')
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1)
        
        // 스크롤 이동 실행
        onItemClick(targetId)
      }
    }
    // Escape 키로 포커스 해제
    else if (event.key === 'Escape') {
      event.currentTarget.blur()
    }
  }

  // Legacy mode: use hasTocContent if items are not provided
  const isLegacyMode = !items || items.length === 0
  
  // 렌더링하지 않을 경우 null 반환 (isVisible가 false인 경우만)
  if (!isVisible) {
    return null
  }
  
  // Legacy mode: always render container for tocbot to find, but control visibility with CSS
  if (isLegacyMode) {
    return (
      <StyledWrapper
        className={className}
        data-variant={variant}
        data-toc-ignore="true"
        style={{ 
          visibility: hasTocContent ? 'visible' : 'hidden',
          opacity: hasTocContent ? 1 : 0,
          pointerEvents: hasTocContent ? 'auto' : 'none'
        }}
      >
        <StyledHeader>
          <StyledTitle>목차</StyledTitle>
        </StyledHeader>
        <StyledTocContainer 
          className="toc-container"
          role="navigation"
          aria-label="목차 네비게이션"
        />
      </StyledWrapper>
    )
  }
  
  // New mode: only render if we have items
  if (!items || items.length === 0) {
    return null
  }

  return (
    <StyledWrapper
      className={className}
      data-variant={variant}
      data-toc-ignore="true"
    >
      <StyledHeader>
        <StyledTitle>목차</StyledTitle>
      </StyledHeader>

      <StyledTocContainer 
        className="toc-container"
        role="navigation"
        aria-label="목차 네비게이션"
      >
        <StyledTocList role="list" aria-label="목차 목록">
          {renderTocItems(items, activeId, handleTocClick, handleKeyDown)}
        </StyledTocList>
      </StyledTocContainer>
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
    position: fixed;
    top: 6rem;
    right: max(1rem, calc((100vw - 1200px) / 2 - 1rem));
    max-height: calc(100vh - 9rem);
    width: 280px;
    z-index: 10;
    
    /* 화면이 작으면 완전히 숨김 (반응형 지원) */
    @media (max-width: 1300px) {
      display: none !important;
    }
  }

  &[data-variant="inline"] {
    position: relative;
    width: 100%;
    max-width: none;
    margin: 1rem 0;
    
    /* 모바일에서도 표시 */
    ${respondMobile} {
      display: block;
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
  max-height: calc(100vh - 12rem);
  overflow-y: auto;
  
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

  /* tocbot 스타일 오버라이드 - 수직 라인 문제 해결 */
  .toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    line-height: 1.4;
    
    /* 모든 수직 라인 제거 */
    &::before,
    &::after {
      display: none !important;
    }
  }

  .toc-list-item {
    margin: 0;
    padding: 0;
    position: relative;
    
    /* 수직 라인 제거 */
    &::before,
    &::after {
      display: none !important;
    }
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
    position: relative;

    /* 모든 수직 라인과 연결선 제거 */
    &::before,
    &::after {
      display: none !important;
    }

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
      
      /* 활성 상태 시각적 표시 - 고정 크기 */
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background-color: ${({ theme }) => theme.colors.indigo9};
        border-radius: 0 2px 2px 0;
        display: block !important;
      }
    }
  }

  /* 중첩된 목록 들여쓰기 */
  .toc-list .toc-list {
    padding-left: 1rem;
    margin-top: 0.25rem;
  }

  .toc-list .toc-list .toc-list {
    padding-left: 1.5rem;
  }

  /* 레벨별 스타일 */
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
`

const StyledTocList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  line-height: 1.4;
`

const StyledTocItem = styled.li`
  margin: 0;
  padding: 0;
  
  /* 리스트 아이템 역할 명확화 */
  &[role="listitem"] {
    display: list-item;
  }
`

const StyledTocLink = styled.a<{ $isActive: boolean; $level: number }>`
  display: block;
  padding: 0.375rem 0.5rem;
  padding-left: ${({ $level }) => 0.5 + ($level - 1) * 1}rem;
  color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray11 : theme.colors.gray11};
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ $level }) => 
    $level === 1 ? '0.9rem' : 
    $level === 2 ? '0.875rem' : '0.85rem'};
  font-weight: ${({ $level, $isActive }) => 
    $isActive ? 600 :
    $level === 1 ? 600 : 
    $level === 2 ? 500 : 400};
  line-height: 1.4;
  border: none;
  background: ${({ $isActive, theme }) =>
    $isActive 
      ? theme.scheme === "light" ? theme.colors.indigo4 : theme.colors.indigo4
      : 'none'};
  
  /* 접근성 개선 */
  position: relative;
  
  /* 마우스 호버 상태 */
  &:hover {
    background-color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo3 : theme.colors.indigo3};
    color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo11 : theme.colors.indigo11};
  }

  /* 키보드 포커스 상태 (접근성 강화) */
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.indigo8};
    outline-offset: 2px;
    background-color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo3 : theme.colors.indigo3};
    color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.indigo11 : theme.colors.indigo11};
  }

  /* 활성 상태 스타일 */
  ${({ $isActive, theme }) => $isActive && `
    color: ${theme.scheme === "light" ? theme.colors.indigo12 : theme.colors.indigo12};
    
    /* 활성 상태 시각적 표시 */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background-color: ${theme.colors.indigo9};
      border-radius: 0 2px 2px 0;
    }
  `}

  /* 터치 디바이스에서 탭 하이라이트 제거 */
  -webkit-tap-highlight-color: transparent;
  
  /* 사용자 선택 방지 (더블클릭 방지) */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`