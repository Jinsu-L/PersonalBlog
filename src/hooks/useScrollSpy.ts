import { useState, useEffect } from 'react'

export function useScrollSpy() {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    // 모든 헤딩 요소를 관찰
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading)
      }
    })

    return () => {
      headings.forEach((heading) => {
        if (heading.id) {
          observer.unobserve(heading)
        }
      })
    }
  }, [])

  return activeId
}