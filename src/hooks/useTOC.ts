import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { TOCItemWithCache, TOCConfig, TOCState } from '../types'
import {
  extractTOCWithCache,
  flattenTOC,
  shouldShowTOC,
  updateTOCItemOffsets
} from '../libs/utils/toc'
import { tocLogger, perfLogger } from '../libs/utils/logger'

const DEFAULT_CONFIG: TOCConfig = {
  headingSelector: 'h1, h2, h3',
  minHeadings: 3,
  scrollOffset: 80,
  throttleDelay: 100
}

export interface UseTOCOptions {
  contentSelector?: string
  headingSelector?: string
  minHeadings?: number
  scrollOffset?: number
  throttleDelay?: number
}

export interface UseTOCReturn {
  tocItems: TOCItemWithCache[]
  activeId: string | null
  isVisible: boolean
  scrollToHeading: (id: string) => void
}

/**
 * TOC (Table of Contents) 훅
 * 
 * 블로그 포스트의 헤딩 구조를 추출하여 목차를 생성하고 스크롤 동기화를 제공합니다.
 * 
 * @param options TOC 설정 옵션
 * @returns TOC 상태 및 제어 함수들
 */
export function useTOC(options: UseTOCOptions = {}): UseTOCReturn {
  // 반응형 최적화: 모바일이나 TOC가 숨겨지는 화면에서는 초기화 건너뛰기
  const shouldSkipInitialization = useMemo(() => {
    if (typeof window === 'undefined') return false
    
    const isMobile = window.matchMedia('(max-width: 960px)').matches
    const shouldHideTOC = window.matchMedia('(max-width: 1300px)').matches
    
    const shouldSkip = isMobile || shouldHideTOC
    
    if (shouldSkip) {
      tocLogger.info('TOC initialization skipped due to responsive breakpoint', {
        isMobile,
        shouldHideTOC,
        screenWidth: window.innerWidth
      })
    }
    
    return shouldSkip
  }, [])

  // 성능 측정을 위한 초기화 시간 기록
  const initStartTime = useRef<number>(performance.now())
  const [isInitialized, setIsInitialized] = useState(false)

  // 설정값 병합
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...options
  }), [options])

  // TOC 상태 관리
  const [tocState, setTocState] = useState<TOCState>({
    items: [],
    activeId: null,
    isVisible: false
  })

  // 스크롤 동기화를 위한 ref들
  const observerRef = useRef<IntersectionObserver | null>(null)
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isScrollingRef = useRef(false)

  const contentSelector = config.contentSelector || 'article'

  // TOC 데이터 상태 관리
  const [tocItems, setTocItems] = useState<TOCItemWithCache[]>([])
  const [lastExtractTime, setLastExtractTime] = useState<number>(0)

  // TOC 데이터 추출 함수
  const extractTOCData = useCallback(() => {
    if (shouldSkipInitialization) {
      tocLogger.debug('TOC data extraction skipped due to responsive optimization')
      setTocItems([])
      return []
    }

    const startTime = performance.now()
    tocLogger.debug('Extracting TOC data...')
    
    try {
      const items = extractTOCWithCache(
        contentSelector,
        config.headingSelector,
        config.minHeadings
      )
      
      const endTime = performance.now()
      const extractionTime = endTime - startTime
      
      tocLogger.info(`Successfully extracted ${items.length} TOC items in ${extractionTime.toFixed(2)}ms`)
      perfLogger.info(`TOC extraction time: ${extractionTime.toFixed(2)}ms`)
      
      setTocItems(items)
      setLastExtractTime(Date.now())
      return items
    } catch (error) {
      tocLogger.error('Error extracting TOC data:', error)
      setTocItems([])
      return []
    }
  }, [contentSelector, config.headingSelector, config.minHeadings, shouldSkipInitialization])

  // 초기 TOC 데이터 추출 및 지연된 재추출
  useEffect(() => {
    let isMounted = true
    
    extractTOCData()

    // Notion 콘텐츠 로딩을 위한 지연된 재추출
    const timeouts = [500, 1000, 2000, 3000].map(delay => 
      setTimeout(() => {
        if (isMounted) {
          tocLogger.debug(`Delayed re-extraction after ${delay}ms`)
          extractTOCData()
        }
      }, delay)
    )

    return () => {
      isMounted = false
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // MutationObserver로 DOM 변경 감지 및 TOC 재추출
  useEffect(() => {
    if (shouldSkipInitialization) {
      tocLogger.debug('MutationObserver setup skipped due to responsive optimization')
      return
    }

    const contentElement = document.querySelector(contentSelector)
    if (!contentElement) {
      tocLogger.warn(`Content element not found: ${contentSelector}`)
      return
    }

    tocLogger.debug('Setting up MutationObserver for dynamic content...')
    
    let debounceTimeout: NodeJS.Timeout | null = null

    const mutationObserver = new MutationObserver((mutations) => {
      let shouldReextract = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.matches && (
                element.matches(config.headingSelector) ||
                element.querySelector && element.querySelector(config.headingSelector)
              )) {
                shouldReextract = true
              }
            }
          })
        }
      })

      if (shouldReextract) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout)
        }
        
        debounceTimeout = setTimeout(() => {
          tocLogger.debug('DOM changes detected, re-extracting TOC...')
          extractTOCData()
        }, 500)
      }
    })

    mutationObserver.observe(contentElement, {
      childList: true,
      subtree: true
    })

    return () => {
      mutationObserver.disconnect()
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [contentSelector, config.headingSelector, shouldSkipInitialization])

  // TOC 가시성 결정
  const isVisible = useMemo(() => {
    const shouldShow = shouldShowTOC(tocItems, config.minHeadings)
    tocLogger.debug(`Visibility determined - ${shouldShow ? 'visible' : 'hidden'}`)
    return shouldShow
  }, [tocItems, config.minHeadings])

  // 평면화된 TOC 아이템 목록 (스크롤 동기화용)
  const flatTocItems = useMemo((): TOCItemWithCache[] => {
    return flattenTOC(tocItems)
  }, [tocItems])

  // TOC 상태 업데이트 및 초기화 완료 측정
  useEffect(() => {
    setTocState(prevState => ({
      ...prevState,
      items: tocItems,
      isVisible
    }))

    if (!isInitialized && tocItems.length > 0) {
      const initEndTime = performance.now()
      const initTime = initEndTime - initStartTime.current
      
      perfLogger.info(`TOC initialization completed in ${initTime.toFixed(2)}ms`)
      
      if (initTime <= 500) {
        perfLogger.info(`TOC initialization meets 500ms requirement (${initTime.toFixed(2)}ms)`)
      } else {
        perfLogger.warn(`TOC initialization exceeds 500ms requirement (${initTime.toFixed(2)}ms)`)
      }
      
      setIsInitialized(true)
    }
  }, [tocItems, isVisible, isInitialized])

  // 스크롤 위치 업데이트
  const updateOffsets = useCallback(() => {
    if (tocItems.length > 0) {
      updateTOCItemOffsets(tocItems)
    }
  }, [tocItems])

  // 리사이즈 이벤트 핸들러
  useEffect(() => {
    const handleResize = () => {
      updateOffsets()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [updateOffsets])

  // 스크롤 동기화 로직 (IntersectionObserver 사용)
  useEffect(() => {
    if (shouldSkipInitialization || !isVisible || flatTocItems.length === 0) {
      if (shouldSkipInitialization) {
        tocLogger.debug('Scroll synchronization skipped due to responsive optimization')
      }
      return
    }

    tocLogger.debug('Setting up scroll synchronization...')

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observerOptions: IntersectionObserverInit = {
      rootMargin: `-${config.scrollOffset}px 0px -35% 0px`,
      threshold: [0, 0.1, 0.5, 1.0]
    }

    const throttledUpdateActiveSection = (entries: IntersectionObserverEntry[]) => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }

      throttleTimeoutRef.current = setTimeout(() => {
        if (isScrollingRef.current) {
          return
        }

        let activeEntry: IntersectionObserverEntry | null = null
        let maxIntersectionRatio = 0

        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio
            activeEntry = entry
          }
        })

        if (!activeEntry) {
          activeEntry = entries.find(entry => entry.isIntersecting) || null
        }

        if (activeEntry) {
          const newActiveId = activeEntry.target.id
          tocLogger.debug(`Active section changed to: ${newActiveId}`)
          
          setTocState(prevState => ({
            ...prevState,
            activeId: newActiveId
          }))
        }
      }, config.throttleDelay)
    }

    observerRef.current = new IntersectionObserver(
      throttledUpdateActiveSection,
      observerOptions
    )

    flatTocItems.forEach(item => {
      if (item.element) {
        observerRef.current!.observe(item.element)
      } else {
        const element = document.getElementById(item.id)
        if (element) {
          item.element = element as HTMLElement
          observerRef.current!.observe(element)
        }
      }
    })

    tocLogger.debug(`Started observing ${flatTocItems.length} heading elements`)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
    }
  }, [isVisible, flatTocItems, config.scrollOffset, config.throttleDelay, shouldSkipInitialization])

  // 스크롤 이동 함수
  const scrollToHeading = useCallback((id: string) => {
    tocLogger.info(`Scroll to heading requested: ${id}`)
    
    try {
      const element = document.getElementById(id)
      if (!element) {
        tocLogger.warn(`Heading element not found: ${id}`)
        return
      }

      if (isScrollingRef.current) {
        tocLogger.debug('Interrupting previous scroll')
      }

      isScrollingRef.current = true

      const elementRect = element.getBoundingClientRect()
      const currentScrollTop = window.scrollY || document.documentElement.scrollTop
      const targetScrollTop = currentScrollTop + elementRect.top - config.scrollOffset

      tocLogger.debug(`Scrolling from ${currentScrollTop} to ${targetScrollTop}`)

      window.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })

      setTocState(prevState => ({
        ...prevState,
        activeId: id
      }))

      const checkScrollComplete = () => {
        const currentScroll = window.scrollY || document.documentElement.scrollTop
        const scrollDiff = Math.abs(currentScroll - targetScrollTop)
        
        if (scrollDiff < 5) {
          isScrollingRef.current = false
          tocLogger.debug('Scroll completed')
          return
        }

        setTimeout(() => {
          if (isScrollingRef.current) {
            isScrollingRef.current = false
            tocLogger.debug('Scroll timeout - force complete')
          }
        }, 2000)
      }

      setTimeout(checkScrollComplete, 100)

    } catch (error) {
      tocLogger.error('Error scrolling to heading:', error)
      isScrollingRef.current = false
      
      try {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      } catch (fallbackError) {
        tocLogger.error('Fallback scroll also failed:', fallbackError)
      }
    }
  }, [config.scrollOffset])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
    }
  }, [])

  return {
    tocItems,
    activeId: tocState.activeId,
    isVisible: tocState.isVisible,
    scrollToHeading
  }
}