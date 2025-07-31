import { useState, useEffect } from "react"
import tocbot from "tocbot"

// tocbot CSS 임포트
import "tocbot/dist/tocbot.css"

/**
 * tocbot을 사용한 간단한 TOC 훅
 */
export function useTOC() {
  const [hasTocContent, setHasTocContent] = useState(false)
  const [activeId, setActiveId] = useState<string>('')

  console.log('TOC Hook: useTOC called')

  // tocbot 초기화
  useEffect(() => {
    console.log('TOC Hook: Initializing tocbot - useEffect started')

    const initTocbot = () => {
      console.log('TOC Hook: Setting up tocbot')

      try {
        // 먼저 기존 tocbot 인스턴스 제거
        tocbot.destroy()

        // TOC 컨테이너가 존재하는지 확인
        const tocContainer = document.querySelector('.toc-container')
        console.log('TOC Hook: TOC container found:', !!tocContainer)
        
        if (!tocContainer) {
          console.log('TOC Hook: TOC container not found')
          setHasTocContent(false)
          return
        }

        // article 요소가 존재하는지 확인
        const articleElement = document.querySelector('article')
        console.log('TOC Hook: Article element found:', !!articleElement)
        
        if (!articleElement) {
          console.log('TOC Hook: Article element not found')
          setHasTocContent(false)
          return
        }

        // 헤딩 요소들 찾기 및 ID 부여 (h1, h2, h3까지만)
        const headings = articleElement.querySelectorAll('h1, h2, h3')
        console.log('TOC Hook: Found headings in article:', headings.length)

        if (headings.length < 3) {
          console.log('TOC Hook: Not enough headings (need at least 3)')
          setHasTocContent(false)
          return
        }

        // 헤딩에 ID 부여 (tocbot 요구사항)
        headings.forEach((heading, index) => {
          const headingElement = heading as HTMLElement
          if (!headingElement.id) {
            const text = headingElement.textContent?.trim() || ''
            // 더 안전한 ID 생성
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9가-힣\s-]/g, '') // 한글, 영문, 숫자, 공백, 하이픈만 허용
              .replace(/\s+/g, '-') // 공백을 하이픈으로
              .replace(/-+/g, '-') // 연속 하이픈을 하나로
              .replace(/^-|-$/g, '') // 시작/끝 하이픈 제거
              .trim()
            
            headingElement.id = id || `heading-${index}`
            console.log(`TOC Hook: Set ID "${headingElement.id}" for heading "${text}"`)
          }
        })

        console.log('TOC Hook: About to initialize tocbot')

        // tocbot 초기화
        tocbot.init({
          tocSelector: '.toc-container',
          contentSelector: 'article',
          headingSelector: 'h1, h2, h3', // h1, h2, h3까지만 표시
          hasInnerContainers: true,
          headingsOffset: 80,
          scrollSmoothOffset: -80,
          collapseDepth: 3, // 3단계까지만 표시
          activeLinkClass: 'is-active-link',
          listClass: 'toc-list',
          listItemClass: 'toc-list-item',
          linkClass: 'toc-link',
          activeListItemClass: 'is-active-li',
          includeHtml: false,
          orderedList: false,
          // 스크롤 동기화 설정
          throttleTimeout: 50,
        })

        console.log('TOC Hook: tocbot.init completed')

        // TOC 내용 확인
        setTimeout(() => {
          const tocElement = document.querySelector('.toc-container')
          const hasContent = tocElement && tocElement.innerHTML.trim() !== ''
          
          console.log('TOC Hook: TOC element:', tocElement)
          console.log('TOC Hook: TOC content length:', tocElement?.innerHTML?.length || 0)
          console.log('TOC Hook: Has content:', hasContent)
          
          setHasTocContent(!!hasContent)
          
          // 스크롤 스파이 설정
          if (hasContent) {
            setupScrollSpy()
          }
        }, 200)

      } catch (error) {
        console.error('TOC Hook: Error during tocbot initialization:', error)
        setHasTocContent(false)
      }
    }

    // 스크롤 스파이 설정 함수
    const setupScrollSpy = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id
              setActiveId(id)
              
              // TOC 링크 활성화 상태 업데이트
              const tocLinks = document.querySelectorAll('.toc-link')
              tocLinks.forEach((link) => {
                link.classList.remove('is-active-link')
                if (link.getAttribute('href') === `#${id}`) {
                  link.classList.add('is-active-link')
                }
              })
              
              console.log('TOC Hook: Active section:', id)
            }
          })
        },
        {
          rootMargin: '-20% 0% -35% 0%',
          threshold: 0.1
        }
      )

      // h1, h2, h3까지만 관찰
      const headings = document.querySelectorAll('article h1, article h2, article h3')
      headings.forEach((heading) => {
        if (heading.id) {
          observer.observe(heading)
        }
      })

      // cleanup 함수에서 observer 해제
      return () => {
        headings.forEach((heading) => {
          if (heading.id) {
            observer.unobserve(heading)
          }
        })
      }
    }

    // DOM이 완전히 로드된 후 실행
    const timer = setTimeout(() => {
      console.log('TOC Hook: Timer executed, initializing...')
      initTocbot()
    }, 2000) // 타이밍을 다시 2초로 늘림

    return () => {
      console.log('TOC Hook: Cleaning up')
      clearTimeout(timer)
      tocbot.destroy()
    }
  }, [])

  return {
    hasTocContent,
    activeId,
  }
}