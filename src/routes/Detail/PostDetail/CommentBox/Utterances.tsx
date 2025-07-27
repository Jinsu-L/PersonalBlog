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

  // Graceful degradation: 리포지토리가 설정되지 않은 경우 체크
  const repo = CONFIG.utterances.config.repo
  const shouldRender = repo && repo.trim() !== ''

  useEffect(() => {
    if (!shouldRender) return

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

    // 스크립트 로드 (테마 변경 시 약간의 지연으로 깜빡임 방지)
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
          // repo는 이미 검증했으므로 안전하게 설정
          if (key !== 'repo' || config[key]) {
            script.setAttribute(key, config[key])
          }
        })

        script.onload = () => {
          setIsLoaded(true)
        }
        
        script.onerror = (error) => {
          console.error('Utterances script failed to load:', error)
          setIsLoaded(true) // 에러가 발생해도 로딩 상태는 해제
        }

        anchor.appendChild(script)
      } catch (error) {
        console.error('Error creating utterances script:', error)
        setIsLoaded(true) // 에러가 발생해도 로딩 상태는 해제
      }
    }, scheme === 'dark' || scheme === 'light' ? 300 : 200) // 테마 변경 시 약간 더 긴 지연

    return () => {
      clearTimeout(timer)
      setIsLoaded(false)
    }
  }, [scheme, router.asPath, issueTerm, shouldRender])

  if (!shouldRender) {
    return null
  }

  return (
    <StyledWrapper>
      <div ref={commentsRef} />
      {!isLoaded && (
        <StyledLoadingMessage>
          댓글을 불러오는 중...
        </StyledLoadingMessage>
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

const StyledLoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray10};
  font-size: 0.875rem;
  opacity: 0.7;
`
