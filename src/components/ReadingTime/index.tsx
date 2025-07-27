import React from 'react'
import styled from '@emotion/styled'

interface ReadingTimeProps {
  readingTime: number  // 미리 계산된 읽기 시간 (분)
  variant?: 'compact' | 'full'
  className?: string
}

const ReadingTime: React.FC<ReadingTimeProps> = ({ 
  readingTime, 
  variant = 'compact',
  className 
}) => {
  const text = readingTime < 1 ? '1분 미만 읽기' : `${readingTime}분 읽기`
  
  if (variant === 'compact') {
    return (
      <StyledCompact className={className}>
        {text}
      </StyledCompact>
    )
  }

  return (
    <StyledFull className={className}>
      <span className="icon">📖</span>
      <span className="text">{text}</span>
    </StyledFull>
  )
}

export default ReadingTime

const StyledCompact = styled.span`
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.colors.gray10};
  
  @media (min-width: 768px) {
    margin-left: 0;
  }
`

const StyledFull = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.colors.gray11};
  
  .icon {
    font-size: 0.75rem;
  }
  
  .text {
    color: ${({ theme }) => theme.colors.gray10};
  }
`