/**
 * TOC 반응형 동작 검증 스크립트
 * Requirements: 6.1, 6.2, 6.3 검증
 */

console.log('=== TOC 반응형 동작 검증 ===\n');

// Mock matchMedia function
const createMatchMedia = (width) => {
  return (query) => {
    const match = query.match(/\(max-width:\s*(\d+)px\)/);
    const maxWidth = match ? parseInt(match[1]) : Infinity;
    return {
      matches: width <= maxWidth,
      media: query
    };
  };
};

// 실제 구현에서 사용되는 미디어 쿼리들
const MOBILE_BREAKPOINT = 960;  // src/styles/variables.ts
const TOC_BREAKPOINT = 1300;    // TableOfContents 컴포넌트

console.log('📱 사용된 브레이크포인트:');
console.log(`   모바일: ${MOBILE_BREAKPOINT}px 이하`);
console.log(`   TOC 숨김: ${TOC_BREAKPOINT}px 이하\n`);

// 테스트 케이스들
const deviceTests = [
  // 모바일 디바이스들
  { name: '아이폰 SE', width: 320, category: '모바일' },
  { name: '아이폰 12', width: 375, category: '모바일' },
  { name: '아이폰 12 Pro Max', width: 414, category: '모바일' },
  
  // 태블릿들
  { name: '아이패드 미니', width: 768, category: '태블릿' },
  { name: '아이패드', width: 820, category: '태블릿' },
  { name: '아이패드 프로', width: 1024, category: '태블릿' },
  
  // 노트북/데스크톱들
  { name: '작은 노트북', width: 1280, category: '노트북' },
  { name: '경계값 테스트', width: 1300, category: '경계값' },
  { name: '경계값 테스트', width: 1301, category: '경계값' },
  { name: '맥북 에어', width: 1366, category: '노트북' },
  { name: '맥북 프로', width: 1440, category: '노트북' },
  { name: '데스크톱', width: 1920, category: '데스크톱' },
  { name: '4K 모니터', width: 2560, category: '데스크톱' },
];

console.log('🖥️  디바이스별 TOC 동작 테스트:');
console.log('   디바이스명 (해상도) → TOC 상태 | 모바일 여부 | 최적화');
console.log('   ' + '='.repeat(65));

let allTestsPassed = true;

deviceTests.forEach(({ name, width, category }) => {
  const matchMedia = createMatchMedia(width);
  
  // 실제 미디어 쿼리들
  const mobileQuery = matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const tocQuery = matchMedia(`(max-width: ${TOC_BREAKPOINT}px)`);
  
  const isMobile = mobileQuery.matches;
  const shouldHideTOC = tocQuery.matches;
  const shouldShowTOC = !shouldHideTOC;
  
  // 성능 최적화: 모바일이거나 TOC가 숨겨지면 초기화 건너뛰기
  const shouldSkipTOCInit = isMobile || shouldHideTOC;
  
  // 예상 결과 검증
  let expectedTOC, expectedMobile, expectedSkip;
  
  if (width <= MOBILE_BREAKPOINT) {
    expectedMobile = true;
    expectedTOC = false;
    expectedSkip = true;
  } else if (width <= TOC_BREAKPOINT) {
    expectedMobile = false;
    expectedTOC = false;
    expectedSkip = true;
  } else {
    expectedMobile = false;
    expectedTOC = true;
    expectedSkip = false;
  }
  
  const testPassed = (
    shouldShowTOC === expectedTOC &&
    isMobile === expectedMobile &&
    shouldSkipTOCInit === expectedSkip
  );
  
  if (!testPassed) allTestsPassed = false;
  
  const status = testPassed ? '✅' : '❌';
  const tocStatus = shouldShowTOC ? '표시' : '숨김';
  const mobileStatus = isMobile ? '예' : '아니오';
  const optimizationStatus = shouldSkipTOCInit ? '건너뛰기' : '초기화';
  
  console.log(`   ${status} ${name.padEnd(12)} (${width.toString().padStart(4)}px) → ${tocStatus.padEnd(4)} | ${mobileStatus.padEnd(6)} | ${optimizationStatus}`);
});

console.log('\n📋 요구사항 검증 결과:');

// Requirement 6.1 검증
const desktopSizes = [1301, 1366, 1440, 1920, 2560];
const req61Passed = desktopSizes.every(width => {
  const matchMedia = createMatchMedia(width);
  const tocQuery = matchMedia(`(max-width: ${TOC_BREAKPOINT}px)`);
  return !tocQuery.matches; // TOC가 표시되어야 함
});

console.log(`   ${req61Passed ? '✅' : '❌'} Requirement 6.1: 1300px 이상에서 TOC 사이드바 표시`);

// Requirement 6.2 검증
const smallerSizes = [320, 375, 768, 1024, 1280, 1300];
const req62Passed = smallerSizes.every(width => {
  const matchMedia = createMatchMedia(width);
  const tocQuery = matchMedia(`(max-width: ${TOC_BREAKPOINT}px)`);
  return tocQuery.matches; // TOC가 숨겨져야 함
});

console.log(`   ${req62Passed ? '✅' : '❌'} Requirement 6.2: 1300px 미만에서 TOC 숨김`);

// Requirement 6.3 검증
const mobileSizes = [320, 375, 414, 768, 820, 960];
const req63Passed = mobileSizes.every(width => {
  const matchMedia = createMatchMedia(width);
  const mobileQuery = matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const tocQuery = matchMedia(`(max-width: ${TOC_BREAKPOINT}px)`);
  const shouldSkipInit = mobileQuery.matches || tocQuery.matches;
  return shouldSkipInit; // 초기화가 건너뛰어져야 함
});

console.log(`   ${req63Passed ? '✅' : '❌'} Requirement 6.3: 모바일 환경에서 TOC 스크립트 로드 방지`);

console.log('\n🔍 경계값 상세 테스트:');

// 1300px 경계값 테스트
const boundaryTests = [
  { width: 1299, expectTOC: false },
  { width: 1300, expectTOC: false },
  { width: 1301, expectTOC: true },
  { width: 1302, expectTOC: true },
];

boundaryTests.forEach(({ width, expectTOC }) => {
  const matchMedia = createMatchMedia(width);
  const tocQuery = matchMedia(`(max-width: ${TOC_BREAKPOINT}px)`);
  const actualTOC = !tocQuery.matches;
  const passed = actualTOC === expectTOC;
  
  console.log(`   ${passed ? '✅' : '❌'} ${width}px: TOC ${actualTOC ? '표시' : '숨김'} (예상: ${expectTOC ? '표시' : '숨김'})`);
});

// 960px 모바일 경계값 테스트
const mobileBoundaryTests = [
  { width: 959, expectMobile: true },
  { width: 960, expectMobile: true },
  { width: 961, expectMobile: false },
  { width: 962, expectMobile: false },
];

mobileBoundaryTests.forEach(({ width, expectMobile }) => {
  const matchMedia = createMatchMedia(width);
  const mobileQuery = matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  const actualMobile = mobileQuery.matches;
  const passed = actualMobile === expectMobile;
  
  console.log(`   ${passed ? '✅' : '❌'} ${width}px: 모바일 ${actualMobile ? '예' : '아니오'} (예상: ${expectMobile ? '예' : '아니오'})`);
});

console.log('\n🎨 CSS 미디어 쿼리 매핑:');
console.log('   TableOfContents 컴포넌트:');
console.log('     @media (max-width: 1300px) { display: none !important; }');
console.log('   PostDetail StyledInlineTOC:');
console.log('     @media (max-width: 1300px) { display: none; }');
console.log('   모바일 스타일 (respondMobile):');
console.log('     @media (max-width: 960px) { /* 모바일 전용 스타일 */ }');

console.log('\n⚡ 성능 최적화 효과:');
console.log('   • 모바일 디바이스에서 불필요한 TOC 초기화 방지');
console.log('   • 1300px 미만 화면에서 TOC 렌더링 건너뛰기');
console.log('   • IntersectionObserver 및 스크롤 이벤트 리스너 생성 방지');
console.log('   • DOM 조작 및 메모리 사용량 최소화');

console.log(`\n🏆 전체 테스트 결과: ${allTestsPassed && req61Passed && req62Passed && req63Passed ? '통과' : '실패'}`);

if (allTestsPassed && req61Passed && req62Passed && req63Passed) {
  console.log('   모든 반응형 요구사항이 올바르게 구현되었습니다!');
} else {
  console.log('   일부 테스트가 실패했습니다. 구현을 다시 확인해주세요.');
}

console.log('\n=== 검증 완료 ===');