import { CONFIG } from "site.config"
import { useEffect, useRef, useState } from "react"
import styled from "@emotion/styled"
import useScheme from "src/hooks/useScheme"
import { useRouter } from "next/router"

type Props = {
  issueTerm: string
}

const Utterances: React.FC<Props> = ({ issueTerm }) => {
  const [scheme] = useScheme()
  const router = useRouter()
  const commentsRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const theme = `github-${scheme}`
    const anchor = commentsRef.current
    if (!anchor) return

    setIsLoaded(false)

    // 기존 내용 안전하게 제거
    try {
      while (anchor.firstChild) {
        anchor.removeChild(anchor.firstChild)
      }
    } catch (error) {
      console.warn('Error clearing utterances container:', error)
    }

    // 스크립트 로드
    const timer = setTimeout(() => {
      try {
        const script = document.createElement("script")
        script.src = "https://utteranc.es/client.js"
        script.crossOrigin = "anonymous"
        script.async = true
        script.setAttribute("issue-term", issueTerm)
        script.setAttribute("theme", theme)

        const config: Record<string, string> = CONFIG.utterances.config
        Object.keys(config).forEach((key) => {
          script.setAttribute(key, config[key])
        })

        script.onload = () => setIsLoaded(true)
        script.onerror = (error) => {
          console.error('Utterances script failed to load:', error)
          setIsLoaded(false)
        }

        anchor.appendChild(script)
      } catch (error) {
        console.error('Error creating utterances script:', error)
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      setIsLoaded(false)
    }
  }, [scheme, router.asPath, issueTerm])

  return (
    <StyledWrapper>
      <div ref={commentsRef} />
      {!isLoaded && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          댓글을 불러오는 중...
        </div>
      )}
    </StyledWrapper>
  )
}

export default Utterances

const StyledWrapper = styled.div`
  @media (min-width: 768px) {
    margin-left: -4rem;
  }
`
