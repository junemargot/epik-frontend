# 이미지 로딩 성능 측정 가이드

## 🎯 목적
KOPIS API 이미지 최적화 작업 전/후 성능 비교를 위한 측정 가이드

## 📊 측정 방법

### 방법 1: 자동 측정 (코드 기반) ⭐ 권장

#### 설정 완료
- ✅ `composables/useImagePerformance.js` 추가됨
- ✅ `pages/index.vue`에 측정 코드 통합됨

#### 사용 방법

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **브라우저에서 메인 페이지 접속**
   ```
   http://localhost:3000
   ```

3. **콘솔에서 결과 확인 (5초 후 자동 출력)**
   - F12 > Console 탭
   - 다음과 같은 리포트가 자동 출력됨:
   ```
   📊 ========== 이미지 로딩 성능 리포트 ==========
   총 이미지 수: 28개
   성공: 26개 | 실패: 2개
   총 로딩 시간: 15430.50ms
   평균 로딩 시간: 593.48ms
   최소 로딩 시간: 123.40ms
   최대 로딩 시간: 1847.30ms
   
   📁 카테고리별 통계:
     [concert-kopis]
       - 개수: 6개
       - 평균: 687.23ms
       - 최소/최대: 345.20ms / 1234.50ms
     [musical-kopis]
       - 개수: 6개
       - 평균: 734.45ms
       - 최소/최대: 412.10ms / 1847.30ms
   ```

4. **JSON 파일로 다운로드**
   - 콘솔에서 실행:
   ```javascript
   window.downloadImageReport()
   ```
   - `image-performance-[날짜].json` 파일 다운로드됨

5. **수동으로 리포트 확인**
   ```javascript
   // 콘솔에서 언제든지 확인 가능
   window.imagePerformanceReport
   ```

#### 측정 데이터 구조
```json
{
  "totalImages": 28,
  "successfulLoads": 26,
  "failedLoads": 2,
  "totalLoadTime": "15430.50",
  "averageLoadTime": "593.48",
  "minLoadTime": "123.40",
  "maxLoadTime": "1847.30",
  "categoryStats": {
    "concert-kopis": {
      "count": 6,
      "average": "687.23",
      "min": "345.20",
      "max": "1234.50"
    },
    "popup-kopis": { ... },
    "musical-kopis": { ... },
    "exhibition-kopis": { ... }
  },
  "measurements": [
    {
      "url": "http://www.kopis.or.kr/upload/...",
      "category": "concert-kopis",
      "loadTime": "687.50",
      "timestamp": "2025-10-15T12:34:56.789Z",
      "success": true
    }
  ]
}
```

---

### 방법 2: Chrome DevTools Network Tab

#### 사용 방법

1. **DevTools 열기**
   - F12 또는 우클릭 > 검사

2. **Network 탭 설정**
   - Network 탭 클릭
   - 필터: `Img` 선택
   - `Disable cache` 체크 (정확한 측정)
   - Throttling: `No throttling` (기본 속도)

3. **페이지 새로고침**
   - Ctrl+R (또는 Cmd+R)

4. **측정 지표 확인**
   - **Time 열**: 각 이미지 로딩 시간
   - **Waterfall**: 시각적 타임라인
   - **Size**: 이미지 파일 크기
   - 하단: `DOMContentLoaded`, `Load` 시간

5. **스크린샷 저장**
   - 우클릭 > Save all as HAR
   - 또는 스크린샷 캡처

#### 주요 확인 사항
- ✅ KOPIS 이미지 URL (`www.kopis.or.kr`) 로딩 시간
- ✅ 로컬 이미지 URL (`localhost:8081`) 로딩 시간
- ✅ 전체 페이지 로드 완료 시간

---

### 방법 3: Lighthouse 성능 측정

#### 사용 방법

1. **Chrome DevTools Lighthouse**
   - F12 > Lighthouse 탭
   - Categories: `Performance` 체크
   - Device: `Desktop` 또는 `Mobile`
   - `Analyze page load` 클릭

2. **확인 지표**
   - **First Contentful Paint (FCP)**: 첫 콘텐츠 렌더링 시간
   - **Largest Contentful Paint (LCP)**: 가장 큰 콘텐츠 렌더링 (이미지)
   - **Speed Index**: 페이지 로딩 체감 속도
   - **Total Blocking Time**: 메인 스레드 차단 시간

3. **결과 저장**
   - 우측 상단 `View Original Trace` 클릭
   - 또는 JSON 다운로드

---

## 📈 최적화 전/후 비교 방법

### 1단계: 최적화 전 측정
```bash
# 1. 현재 상태에서 측정
npm run dev

# 2. 콘솔에서 리포트 확인 후 다운로드
window.downloadImageReport()

# 3. 파일 이름 변경
image-performance-before-optimization.json
```

### 2단계: 최적화 작업
- 이미지 프록시/캐싱 구현
- 또는 다른 최적화 방법 적용

### 3단계: 최적화 후 측정
```bash
# 1. 최적화 후 측정
npm run dev

# 2. 콘솔에서 리포트 확인 후 다운로드
window.downloadImageReport()

# 3. 파일 이름 변경
image-performance-after-optimization.json
```

### 4단계: 비교 분석
```javascript
// 두 JSON 파일을 비교하여 개선율 계산
const before = { averageLoadTime: 593.48 }; // ms
const after = { averageLoadTime: 89.23 };   // ms

const improvement = ((before.averageLoadTime - after.averageLoadTime) / before.averageLoadTime * 100).toFixed(2);
console.log(`개선율: ${improvement}%`);
// 예시: 개선율: 84.97%
```

---

## 📋 측정 시 주의사항

### ✅ DO
- 브라우저 캐시 비활성화 상태로 측정
- 동일한 네트워크 환경에서 측정 (Wi-Fi 속도 일정하게)
- 최소 3회 측정 후 평균값 사용
- KOPIS 서버 상태가 안정적인 시간대 선택
- 백그라운드 다운로드/업로드 없는 상태

### ❌ DON'T
- VPN 사용 중 측정 금지
- 네트워크 불안정한 환경 (카페, 공공 Wi-Fi)
- 브라우저 확장 프로그램 많이 실행된 상태
- 다른 탭에서 동영상 재생 중인 상태

---

## 🎯 목표 성능 지표

### 현재 (최적화 전)
- **평균 로딩 시간**: ~500-800ms (예상)
- **최대 로딩 시간**: ~1500-2000ms
- **LCP**: ~2-3초

### 목표 (최적화 후)
- **평균 로딩 시간**: ~50-150ms (80%+ 개선)
- **최대 로딩 시간**: ~300ms 이하
- **LCP**: ~1초 이하

---

## 💡 추가 팁

### 실시간 모니터링
```javascript
// 콘솔에서 실시간으로 측정 데이터 확인
setInterval(() => {
  console.clear();
  window.imagePerformanceReport && console.table(
    window.imagePerformanceReport.measurements
  );
}, 2000);
```

### 카테고리별 비교
```javascript
// 특정 카테고리만 필터링
const kopisImages = window.imagePerformanceReport.measurements
  .filter(m => m.category.includes('kopis'));

const localImages = window.imagePerformanceReport.measurements
  .filter(m => m.category.includes('local'));

console.log('KOPIS 평균:', 
  kopisImages.reduce((sum, m) => sum + parseFloat(m.loadTime), 0) / kopisImages.length
);
```

---

## 📞 문제 해결

### Q: 리포트가 출력되지 않아요
A: 페이지 로드 후 5초 이상 기다렸는지 확인하세요. 또는 수동 실행:
```javascript
window.imagePerformanceReport
```

### Q: 일부 이미지만 측정돼요
A: `getImageUrl()` 함수에서 null을 반환하는 이미지는 측정되지 않습니다. 정상 동작입니다.

### Q: 측정값이 매번 달라요
A: 네트워크 상태에 따라 변동 가능합니다. 3-5회 측정 후 평균값을 사용하세요.
