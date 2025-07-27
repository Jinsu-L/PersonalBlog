# Design Document

## Overview

이 설계 문서는 기존 Next.js 기반 노션 블로그에 6가지 핵심 기능을 추가하는 방법을 정의합니다. 현재 코드베이스의 구조와 디자인 시스템을 최대한 보존하면서 새로운 기능들을 자연스럽게 통합하는 것이 주요 목표입니다.

## Architecture

### Current System Analysis

**기존 아키텍처:**
- Next.js 13.4.9 with TypeScript
- Emotion for styling with theme system
- TanStack React Query for data fetching
- Notion API as CMS
- 반응형 디자인 (960px 브레이크포인트)

**기존 컴포넌트 구조:**
```
src/
├── layouts/RootLayout/Header/     # 네비게이션 시스템
├── routes/Detail/PostDetail/      # 포스트 상세 페이지
├── routes/Feed/PostList/          # 포스트 목록
├── components/                    # 재사용 컴포넌트
└── styles/                        # 테마 시스템
```

### New Architecture Integration

새로운 기능들은 기존 구조를 확장하는 방식으로 통합됩니다:

```
src/
├── components/
│   ├── ReadingTime/              # 읽기 시간 표시 컴포넌트
│   ├── TableOfContents/          # TOC 컴포넌트
│   ├── SeriesNavigation/         # 시리즈 네비게이션
│   └── SEOHead/                  # SEO 메타태그 컴포넌트
├── libs/utils/
│   ├── readingTime.ts            # 읽기 시간 계산 유틸
│   ├── toc.ts                    # TOC 생성 유틸
│   └── seo.ts                    # SEO 데이터 생성 유틸
├── pages/api/
│   └── rss.xml.ts                # RSS 피드 API
└── hooks/
    ├── useReadingTime.ts         # 읽기 시간 훅
    ├── useTOC.ts                 # TOC 훅
    └── useSeriesData.ts          # 시리즈 데이터 훅
```

## Components and Interfaces

### 1. ReadingTime Component

**위치:** `src/components/ReadingTime/index.tsx`

**Props Interface:**
```typescript
interface ReadingTimeProps {
  readingTime: number  // 미리 계산된 읽기 시간 (분)
  variant?: 'compact' | 'full'
  className?: string
}
```

**통합 위치:**
- PostCard (포스트 목록): 날짜 옆에 표시
- PostHeader (포스트 상세): 메타데이터 영역에 표시

**성능 최적화:**
- 읽기 시간은 `getPageProperties` 함수에서 노션 데이터 파싱 시점에 계산
- `TPost` 타입에 `readingTime` 필드 추가하여 저장
- ISR을 통해 60초마다 갱신되므로 실시간성 유지
- 클라이언트에서는 계산된 값만 표시

### 2. TableOfContents Component

**위치:** `src/components/TableOfContents/index.tsx`

**Props Interface:**
```typescript
interface TOCProps {
  headings: TOCItem[]  // 미리 파싱된 헤딩 데이터
  isCollapsible?: boolean
  isMobile?: boolean
}

interface TOCItem {
  id: string
  title: string
  level: number
  children?: TOCItem[]
}
```

**통합 위치:**
- PostDetail: 데스크톱에서는 사이드바, 모바일에서는 상단 또는 점 형태

**성능 최적화:**
- TOC 데이터는 개별 포스트 페이지의 `getStaticProps`에서 `getRecordMap` 호출 시점에 파싱
- 노션 HTML 콘텐츠가 렌더링된 후 헤딩 구조 추출
- `PostDetail` 타입에 `headings` 필드 추가하여 저장
- 클라이언트에서는 파싱된 데이터만 사용

### 3. SeriesNavigation Component

**위치:** `src/components/SeriesNavigation/index.tsx`

**Props Interface:**
```typescript
interface SeriesNavigationProps {
  currentPost: TPost
  seriesPosts: TPost[]
  isCollapsible?: boolean
}

interface SeriesPost {
  id: string
  title: string
  slug: string
  order: number
  isCurrent: boolean
}
```

**통합 위치:**
- PostDetail: 포스트 하단, 댓글 위에 표시

### 4. SEOHead Component

**위치:** `src/components/SEOHead/index.tsx`

**Props Interface:**
```typescript
interface SEOHeadProps {
  post: TPost
  type: 'article' | 'website'
}
```

**통합 위치:**
- 기존 MetaConfig 컴포넌트를 확장하여 사용

## Data Models

### Extended Post Type

기존 `TPost` 타입을 확장하여 새로운 필드를 추가합니다:

```typescript
interface TPost {
  // 기존 필드들...
  series?: string          // 시리즈 이름
  seriesOrder?: number     // 시리즈 내 순서
  readingTime?: number     // 계산된 읽기 시간 (분)
  wordCount?: number       // 단어 수
  headings?: TOCItem[]     # TOC 데이터
}
```

### Notion Schema Extension

노션 데이터베이스에 추가할 컬럼:
- `series` (Select 또는 Text): 시리즈 이름
- `series_order` (Number): 시리즈 내 순서 (선택사항)

## Error Handling

### Graceful Degradation Strategy

1. **읽기 시간 계산 실패**: 기본값 "1분 읽기" 표시
2. **TOC 생성 실패**: TOC 섹션 숨김
3. **시리즈 데이터 로딩 실패**: 시리즈 네비게이션 숨김
4. **RSS 피드 생성 실패**: 빈 피드 반환
5. **SEO 메타태그 생성 실패**: 기본 메타태그 사용

### Error Boundaries

새로운 컴포넌트들은 각각 에러 바운더리로 감싸서 전체 페이지 렌더링에 영향을 주지 않도록 합니다.

## Testing Strategy

### Unit Testing

각 새로운 컴포넌트와 유틸리티 함수에 대한 단위 테스트:

1. **ReadingTime 유틸리티**
   - 한국어/영어 텍스트 읽기 시간 계산
   - 이미지/코드 블록 추가 시간 계산
   - 엣지 케이스 (빈 콘텐츠, 매우 긴 콘텐츠)

2. **TOC 생성 유틸리티**
   - HTML 헤딩 파싱
   - 중첩 구조 생성
   - 잘못된 HTML 처리

3. **시리즈 데이터 처리**
   - 시리즈 포스트 정렬
   - 현재 포스트 식별
   - 페이지네이션 로직

### Integration Testing

1. **기존 기능 영향도 테스트**
   - 포스트 목록 렌더링
   - 포스트 상세 페이지 렌더링
   - 네비게이션 기능
   - 반응형 레이아웃

2. **새로운 기능 통합 테스트**
   - RSS 피드 생성 및 접근
   - SEO 메타태그 렌더링
   - 모바일/데스크톱 TOC 전환

### Performance Testing

1. **번들 크기 영향도 측정**
2. **페이지 로딩 시간 측정**
3. **TOC 스크롤 성능 측정**

## Performance Optimization Strategy

### Build-time Data Processing

현재 데이터 플로우를 분석한 결과, 다음과 같이 최적화:

1. **읽기 시간 계산**: 
   - `getPageProperties()` 함수에서 노션 텍스트 콘텐츠 파싱 시점에 계산
   - 각 포스트의 `summary` 필드와 노션 블록 데이터를 활용
   - `TPost` 타입에 `readingTime` 필드 추가

2. **TOC 데이터 파싱**: 
   - 개별 포스트 페이지의 `getStaticProps`에서 `getRecordMap()` 호출 후
   - 노션 HTML이 렌더링된 시점에 헤딩 구조 추출
   - `PostDetail` 타입에 `headings` 필드 추가

3. **시리즈 데이터 정리**: 
   - `getPosts()` 함수에서 전체 포스트 목록을 가져온 후
   - 시리즈별로 그룹핑 및 정렬하여 각 포스트에 시리즈 정보 추가

4. **SEO 메타데이터**: 
   - 기존 `MetaConfig` 컴포넌트를 확장하여 구조화된 데이터 추가
   - 포스트 데이터에서 필요한 정보 추출하여 JSON-LD 생성

### Caching Strategy

- Next.js ISR을 활용한 데이터 캐싱
- React Query를 통한 클라이언트 사이드 캐싱
- 계산된 데이터는 포스트 객체에 포함하여 전달

## Implementation Phases

### Phase 1: 기반 유틸리티 및 타입 확장
- TPost 타입 확장 (readingTime, headings, series 필드 추가)
- 읽기 시간 계산 유틸리티 (빌드 타임용)
- TOC 생성 유틸리티 (빌드 타임용)
- 노션 API 클라이언트 확장 (getPosts 함수 수정)

### Phase 2: 기본 컴포넌트 구현
- ReadingTime 컴포넌트
- 기존 PostCard, PostHeader에 통합
- 기존 기능 영향도 확인

### Phase 3: RSS 피드 및 SEO
- RSS API 엔드포인트 구현
- 네비게이션에 RSS 링크 추가
- SEO 메타태그 개선

### Phase 4: TOC 기능
- TOC 컴포넌트 구현
- 데스크톱/모바일 반응형 처리
- 스크롤 동기화

### Phase 5: 시리즈 기능
- 노션 스키마 확장
- SeriesNavigation 컴포넌트
- 시리즈 데이터 처리 로직

### Phase 6: 최종 통합 및 테스트
- 모든 기능 통합 테스트
- 성능 최적화
- 접근성 개선

## Technology Choices

### Recommended Libraries

#### 1. **읽기 시간 계산**
```bash
yarn add reading-time
yarn add -D @types/reading-time
```
- **장점**: 가장 인기 있는 라이브러리, 안정적
- **단점**: 영어 기준이므로 한국어 커스터마이징 필요
- **번들 크기**: ~2KB

#### 2. **TOC 기능**
```bash
yarn add cheerio  # HTML 파싱용
yarn add react-scrollspy-nav  # 스크롤 동기화
```
- **cheerio**: 노션 HTML에서 헤딩 추출
- **react-scrollspy-nav**: 스크롤 위치에 따른 TOC 하이라이트
- **모바일 점 형태**: 직접 구현 (Intersection Observer API)

#### 3. **RSS 피드**
```bash
yarn add rss
yarn add -D @types/rss
```
- **장점**: RSS 2.0 표준 완벽 지원
- **대안**: `feed` 라이브러리 (RSS/Atom/JSON 지원)

#### 4. **SEO 최적화**
- **추천**: 기존 `MetaConfig` 컴포넌트 확장
- **이유**: `next-seo`는 기존 구조와 중복, 불필요한 의존성

#### 5. **시리즈 기능**
- **UI**: 기존 Emotion + Radix UI 색상 시스템 활용
- **페이지네이션**: 직접 구현 (5개씩 표시, 좌우 화살표)

#### 6. **유틸리티**
```bash
yarn add date-fns  # 날짜 처리 (필요시)
```
- **HTML 파싱**: cheerio (TOC용)
- **날짜 처리**: 기존 Date 객체 또는 date-fns

### Styling Approach

모든 새로운 컴포넌트는 기존 Emotion + 테마 시스템을 사용:
- `styled-components` 패턴 유지
- 기존 색상 팔레트 활용
- 반응형 브레이크포인트 준수
- 다크/라이트 테마 지원

## Security Considerations

1. **RSS 피드**: XSS 방지를 위한 HTML 이스케이핑
2. **사용자 입력**: 노션 데이터 검증
3. **SEO 메타태그**: 적절한 길이 제한
4. **TOC 링크**: 안전한 앵커 링크 생성

## Accessibility

1. **TOC**: 키보드 네비게이션 지원
2. **시리즈 네비게이션**: 스크린 리더 지원
3. **RSS 링크**: 적절한 aria-label
4. **접기/펼치기**: 상태 변화 알림

## Monitoring and Analytics

1. **RSS 피드 사용량 추적**
2. **TOC 사용 패턴 분석**
3. **시리즈 네비게이션 클릭률**
4. **읽기 시간 정확도 검증**