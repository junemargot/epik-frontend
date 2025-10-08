# #1 Scroll Position Management

## 문제 정의

### Issue #1: 페이지 전환 시 스크롤 위치 초기화 안됨

**증상**
- 메인 페이지에서 스크롤 후 다른 페이지로 이동 시, 새 페이지가 중간 위치에서 시작
- Lenis smooth scroll 라이브러리가 스크롤 상태를 유지

**원인**
- `plugins/lenis.client.js`의 `page:finish` 훅 오타: `'page: finish'` (공백 포함)
- 올바른 훅명: `'page:finish'` (공백 없음)
- 공백으로 인해 훅이 동작하지 않아 스크롤 초기화 로직 미실행

## 해결 방안

### 1단계: 기본 스크롤 초기화 (Issue #1 해결)

```javascript
// page:finish 훅 오타 수정
nuxtApp.hook("page:finish", () => {
  setTimeout(() => {
    lenis.scrollTo(0, { immediate: true });
  }, 50);
});
```

**결과**: 모든 페이지 전환 시 최상단으로 스크롤 초기화

### 2단계: 뒤로가기 시 스크롤 위치 복원

**요구사항**
- 뒤로가기: 이전 스크롤 위치로 복원
- 앞으로가기/일반 링크: 최상단으로 이동

**구현 방법**

1. **스크롤 위치 저장**
   - `router.beforeEach`에서 페이지 이동 직전 `lenis.scroll` 값 저장
   - `Map` 자료구조로 경로별 스크롤 위치 관리

2. **네비게이션 타입 감지**
   - `popstate` 이벤트로 브라우저 뒤로가기/앞으로가기 감지
   - `visitedPages` 배열로 방문 기록 추적하여 뒤로가기 판별

3. **스크롤 위치 복원**
   - 뒤로가기: 저장된 스크롤 위치로 복원
   - 그 외: 최상단(0)으로 이동

## 최종 구현

```javascript
// 스크롤 위치 저장소 및 네비게이션 타입 추적
const scrollPositions = new Map();
const visitedPages = [];
let isBackNavigation = false;

// 초기 페이지 기록
visitedPages.push(window.location.pathname);

// 뒤로가기 감지
window.addEventListener("popstate", () => {
  const targetPath = window.location.pathname;
  const lastVisitedIndex = visitedPages.lastIndexOf(targetPath);
  isBackNavigation = lastVisitedIndex >= 0 && lastVisitedIndex < visitedPages.length - 1;
});

// 페이지 이동 직전 스크롤 위치 저장
const router = useRouter();
router.beforeEach((to, from) => {
  if (from.path) {
    scrollPositions.set(from.path, lenis.scroll);
  }
});

// 페이지 전환 완료 후 스크롤 처리
nuxtApp.hook("page:finish", () => {
  setTimeout(() => {
    const currentPath = window.location.pathname;

    // 방문 기록 업데이트
    if (!isBackNavigation) {
      visitedPages.push(currentPath);
    }

    // 스크롤 위치 설정
    if (isBackNavigation && scrollPositions.has(currentPath)) {
      // 뒤로가기: 저장된 위치로 복원
      const savedPosition = scrollPositions.get(currentPath);
      lenis.scrollTo(savedPosition, { immediate: true });
      visitedPages.pop();
    } else {
      // 앞으로가기/일반 링크: 최상단으로
      lenis.scrollTo(0, { immediate: true });
    }

    isBackNavigation = false;
  }, 50);
});
```

## 핵심 포인트

### 1. `lenis.scroll` 사용
- `window.scrollY` 대신 `lenis.scroll` 사용 필수
- Lenis는 자체 스크롤 시스템을 사용하므로 native scroll 값과 불일치

### 2. `router.beforeEach`로 스크롤 저장
- `page:start` 훅보다 더 일찍 호출되어 정확한 스크롤 값 캡처
- `from.path`로 현재 페이지 경로 정확히 파악

### 3. `popstate` 이벤트 활용
- 브라우저 네비게이션(뒤로가기/앞으로가기) 감지
- 방문 기록 배열로 뒤로가기 정확히 판별

### 4. 50ms setTimeout
- Nuxt의 페이지 렌더링 완료 대기
- DOM 준비 후 스크롤 적용으로 깜빡임 방지

## 결과

✅ **페이지 전환 시 스크롤 초기화** (Issue #1 해결)
✅ **뒤로가기 시 이전 스크롤 위치 복원**
✅ **앞으로가기/링크 클릭 시 최상단 이동**
✅ **Lenis smooth scroll 기능 유지**

## 관련 파일

- `plugins/lenis.client.js` - Lenis 플러그인 설정 및 스크롤 관리 로직
