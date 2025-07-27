# Implementation Plan

## Task Overview

이 구현 계획은 기존 Next.js 노션 블로그에 6가지 핵심 기능을 단계별로 추가하는 작업을 정의합니다. 각 단계는 기존 기능에 영향을 주지 않도록 점진적으로 구현하며, 기존 라이브러리를 최대한 활용합니다.

## Implementation Tasks

- [x] 1. 프로젝트 기반 설정 및 타입 확장
  - 기존 TPost 타입에 새로운 필드 추가 (readingTime, series, seriesOrder)
  - 필요한 최소한의 라이브러리만 설치
  - 기존 노션 API 클라이언트 구조 분석 및 확장 준비
  - _Requirements: 1.1, 2.8, 6.9_

- [x] 2. 읽기 시간 계산 기능 구현
  - [x] 2.1 읽기 시간 계산 유틸리티 함수 작성
    - 기존 프로젝트 구조를 활용하여 `src/libs/utils/readingTime.ts` 생성
    - 한국어와 영어 텍스트를 고려한 계산 로직 구현
    - 이미지와 코드 블록 추가 시간 계산 포함
    - _Requirements: 2.4, 2.5, 2.6, 2.7_

  - [x] 2.2 노션 API 클라이언트에 읽기 시간 계산 통합
    - `getPageProperties` 함수에서 텍스트 콘텐츠 추출 시 읽기 시간 계산
    - TPost 타입의 readingTime 필드에 계산된 값 저장
    - 기존 데이터 플로우에 영향을 주지 않도록 구현
    - _Requirements: 2.8_

  - [x] 2.3 ReadingTime 컴포넌트 생성
    - `src/components/ReadingTime/index.tsx` 컴포넌트 작성
    - 기존 Emotion 스타일링 시스템과 일관된 디자인 적용
    - compact와 full 두 가지 표시 형태 지원
    - _Requirements: 2.3_

  - [x] 2.4 기존 컴포넌트에 읽기 시간 표시 통합
    - PostCard 컴포넌트의 날짜 옆에 읽기 시간 추가
    - PostHeader 컴포넌트의 메타데이터 영역에 읽기 시간 추가
    - 기존 레이아웃과 스타일을 유지하면서 자연스럽게 통합
    - _Requirements: 2.1, 2.2_

- [x] 3. RSS 피드 기능 구현
  - [x] 3.1 RSS 피드 생성 API 엔드포인트 작성
    - `src/pages/api/rss.xml.ts` 파일 생성
    - 기존 getPosts 함수를 활용하여 포스트 데이터 가져오기
    - RSS 2.0 표준 형식으로 XML 생성 (외부 라이브러리 최소 사용)
    - _Requirements: 3.1, 3.2, 3.5, 3.7_

  - [x] 3.2 RSS 피드 메타데이터 최적화
    - 포스트 제목, 설명, 링크, 발행일, 작성자 정보 포함
    - HTML 콘텐츠 안전 처리 및 이스케이핑
    - 적절한 Content-Type 헤더 설정
    - _Requirements: 3.3, 3.6_

  - [x] 3.3 네비게이션에 RSS 링크 추가
    - `src/layouts/RootLayout/Header/NavBar.tsx` 수정
    - 기존 About 링크 옆에 RSS 아이콘 링크 추가
    - 기존 스타일링과 일관된 디자인 적용
    - _Requirements: 3.4_

- [x] 4. Utterances 댓글 시스템 확인 및 개선
  - [x] 4.1 기존 Utterances 구현 검토
    - 현재 구현된 Utterances 컴포넌트 동작 확인
    - 환경변수 설정 상태 점검
    - 테마 변경 동작 테스트
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.2 필요시 Utterances 컴포넌트 개선
    - 환경변수 미설정 시 graceful degradation 확인
    - 다크/라이트 테마 전환 최적화
    - 기존 스타일링과의 일관성 확인
    - _Requirements: 1.4_

- [ ] 5. SEO 및 OpenGraph 최적화
  - [ ] 5.1 기존 MetaConfig 컴포넌트 확장
    - `src/components/MetaConfig/index.tsx` 수정
    - OpenGraph 메타태그 추가 및 개선
    - 포스트별 동적 메타데이터 생성 로직 강화
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ] 5.2 구조화된 데이터 (JSON-LD) 추가
    - Article 스키마를 위한 JSON-LD 생성
    - 기존 MetaConfig에 구조화된 데이터 통합
    - 검색엔진 최적화를 위한 메타데이터 완성
    - _Requirements: 5.6_

  - [ ] 5.3 기본 이미지 및 썸네일 처리 개선
    - 썸네일이 없는 포스트를 위한 기본 이미지 처리
    - OpenGraph 이미지 최적화
    - 기존 이미지 처리 로직과 통합
    - _Requirements: 5.3_

- [ ] 6. TOC (목차) 기능 구현
  - [ ] 6.1 TOC 데이터 추출 유틸리티 작성
    - `src/libs/utils/toc.ts` 파일 생성
    - 노션 블록 데이터에서 헤딩 구조 추출 로직 구현
    - 기존 getRecordMap 함수와 연동하여 TOC 데이터 생성
    - _Requirements: 4.6_

  - [ ] 6.2 TOC 컴포넌트 구현
    - `src/components/TableOfContents/index.tsx` 컴포넌트 작성
    - 기존 Emotion 스타일링 시스템 활용
    - 접기/펼치기 기능 구현 (기존 React 상태 관리 활용)
    - _Requirements: 4.5, 4.9, 4.10, 4.11_

  - [ ] 6.3 반응형 TOC 구현
    - 데스크톱: 고정 사이드바 형태
    - 모바일: 상단 접기/펼치기 형태 (점 형태는 추후 고려)
    - 기존 반응형 브레이크포인트 (960px) 활용
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 6.4 TOC 스크롤 동기화 구현
    - Intersection Observer API를 활용한 현재 섹션 감지
    - 기존 프로젝트의 React 훅 패턴 활용
    - TOC 클릭 시 부드러운 스크롤 구현
    - _Requirements: 4.3, 4.4_

  - [ ] 6.5 PostDetail에 TOC 통합
    - 기존 PostDetail 컴포넌트에 TOC 추가
    - 헤딩이 3개 이상인 경우에만 표시
    - 기존 레이아웃을 유지하면서 자연스럽게 통합
    - _Requirements: 4.1, 4.7_

- [ ] 7. 시리즈 기능 구현
  - [ ] 7.1 노션 스키마 확장 및 데이터 처리
    - 노션 데이터베이스에 series 컬럼 추가 가이드 작성
    - `getPageProperties` 함수에서 series 필드 처리 추가
    - 기존 select/multi_select 처리 로직 활용
    - _Requirements: 6.1, 6.9_

  - [ ] 7.2 시리즈 데이터 정리 로직 구현
    - `src/libs/utils/series.ts` 유틸리티 함수 작성
    - 시리즈별 포스트 그룹핑 및 시간순 정렬
    - 현재 포스트 식별 및 시리즈 내 순서 계산
    - _Requirements: 6.2_

  - [ ] 7.3 SeriesNavigation 컴포넌트 구현
    - `src/components/SeriesNavigation/index.tsx` 컴포넌트 작성
    - 기존 Emotion 스타일링 시스템과 일관된 디자인
    - 현재 포스트 강조 표시 및 다른 포스트 링크
    - _Requirements: 6.3, 6.4, 6.6, 6.8_

  - [ ] 7.4 시리즈 네비게이션 UI 기능 구현
    - 접기/펼치기 기능 (기존 React 상태 관리 활용)
    - 5개 초과 시 페이지네이션 구현
    - 시리즈 이름만 표시하는 축소 모드
    - _Requirements: 6.5, 6.9, 6.10, 6.11_

  - [ ] 7.5 PostDetail에 시리즈 네비게이션 통합
    - 기존 PostDetail 컴포넌트의 댓글 위에 시리즈 네비게이션 추가
    - 시리즈가 있는 포스트에만 표시
    - 기존 레이아웃과 자연스럽게 통합
    - _Requirements: 6.2, 6.7_

- [ ] 8. 통합 테스트 및 최적화
  - [ ] 8.1 기존 기능 영향도 테스트
    - 홈페이지 포스트 목록 렌더링 확인
    - 개별 포스트 페이지 렌더링 확인
    - 네비게이션 및 반응형 레이아웃 동작 확인
    - 다크/라이트 테마 전환 테스트

  - [ ] 8.2 새로운 기능 통합 테스트
    - 모든 새로운 컴포넌트의 렌더링 확인
    - RSS 피드 접근 및 유효성 검증
    - TOC 스크롤 동기화 동작 테스트
    - 시리즈 네비게이션 동작 테스트

  - [ ] 8.3 성능 최적화 및 번들 크기 확인
    - 새로 추가된 라이브러리의 번들 크기 영향 측정
    - 페이지 로딩 시간 측정 및 최적화
    - React Query 캐싱 동작 확인

  - [ ] 8.4 접근성 및 사용성 개선
    - 키보드 네비게이션 지원 확인
    - 스크린 리더 호환성 테스트
    - 모바일 사용성 최종 점검

## Implementation Notes

### 기존 라이브러리 활용 우선순위
1. **Emotion**: 모든 새로운 컴포넌트 스타일링
2. **React**: 상태 관리 및 훅 패턴
3. **Next.js**: 빌드 타임 최적화 및 API 라우트
4. **TanStack React Query**: 데이터 캐싱
5. **Radix UI Colors**: 색상 시스템

### 최소한의 새로운 의존성
- `reading-time`: 읽기 시간 계산 (필요시)
- `rss`: RSS 피드 생성 (또는 직접 구현)
- 기타 유틸리티는 가능한 한 직접 구현

### 각 단계별 검증 포인트
- 기존 기능 동작 확인
- 새로운 기능 단위 테스트
- 반응형 레이아웃 유지
- 성능 영향도 측정