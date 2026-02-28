# 관리자 대시보드 리팩터링

## 이슈 개요

| 항목 | 내용 |
|------|------|
| 대상 파일 | `pages/admin/index.vue` (770줄) |
| 목표 | Nuxt 3 / Composition API best practice에 맞게 컴포넌트 분리, composable 활용, 코드 중복 제거 |
| 우선순위 | 중 (기능 동작에는 문제없으나, 유지보수성·확장성 저하) |
| 관련 파일 | `composables/useAdminDashboard.js`, `composables/useDateUtils.js`, `components/admin/` |

---

## 현재 문제점

### 1. 단일 파일에 과도한 책임 (770줄)

하나의 페이지 컴포넌트에 아래 기능이 전부 들어가 있음:

- 통계 카드 4종 (전체/진행중/오늘등록/동기화)
- 도넛 차트 3개 + 바 차트 2개 (Chart.js 인스턴스 직접 관리)
- 게시글 섹션 (공지사항, 문의내역)
- 메뉴 토글, 날짜 포맷, 동기화 시간 계산 등 유틸 함수

### 2. 차트 코드 심각한 중복

| 함수 | 타입 | 비고 |
|------|------|------|
| `createTotalChart()` | 도넛 | 데이터만 다르고 구조 동일 |
| `createOngoingChart()` | 도넛 | 〃 |
| `createTodayChart()` | 도넛 | 〃 |
| `createRegionChart()` | 바 | 데이터만 다르고 구조 동일 |
| `createGenreChart()` | 바 | 〃 |

→ 5개 함수가 거의 동일한 Chart.js 보일러플레이트를 반복

### 3. 상태 관리 미흡

- 대시보드 데이터를 페이지에서 직접 `useAuthFetch`로 호출 → 다른 곳에서 재사용 불가
- `progressItems`가 `getRandomInt()`로 랜덤값 생성 (실제 데이터 아님)
- `useAdminDashboard.js` composable이 존재하지만 미완성 (2줄)

### 4. 유틸리티 함수가 컴포넌트에 묶여있음

`formatDate`, `formatSyncTime`, `formatDateOnly`, `getToday`, `getNextSyncTime` 등이 페이지 컴포넌트 내부에 정의되어 있음.
`composables/useDateUtils.js`가 이미 존재하지만 대시보드에서 활용하지 않고 있음.

### 5. 기타

- `onMounted`가 2번 분리 호출됨
- `defineProps`로 `contentSections`를 선언했지만 실제로는 내부 computed로 사용
- console.log 디버그 코드 잔존
- 하드코딩 데이터 (문의내역이 API 연동으로 교체되었으나, 비즈니스 문의 섹션은 이미 삭제 확인 필요)
- 문의내역 링크가 구 경로 (`/admin/inquiries/personal`) → `/admin/inquiry`로 변경 필요

---

## 리팩터링 계획

### Phase 1: composable 분리 (데이터 레이어)

#### `composables/useAdminDashboard.js` 재작성

현재 미완성 상태 (2줄)인 composable을 아래 역할로 재작성:

```
역할:
- /admin/dashboard/stats API 호출
- /admin/notice 최근 5건 호출
- /admin/inquiry 최근 5건 호출
- 응답 데이터를 computed로 정규화하여 반환

반환값:
- stats: 대시보드 통계 (전체, 진행중, 오늘등록, 동기화 등)
- notices: 공지사항 최근 5건
- inquiries: 문의 최근 5건
- pending: 로딩 상태
```

#### `composables/useChart.js` 신규 생성

```
역할:
- Chart.js 인스턴스 생성/파괴 라이프사이클 관리
- 도넛 차트, 바 차트 생성 헬퍼 제공
- onBeforeUnmount 시 자동 destroy

반환값:
- chartRef: template ref
- createDoughnut(labels, data, colors)
- createHorizontalBar(labels, data)
```

### Phase 2: 컴포넌트 분리 (UI 레이어)

#### 대상 컴포넌트

```
components/admin/dashboard/
├── StatCard.vue            # 통계 카드 (도넛 차트 포함, 재사용)
├── SyncStatusCard.vue      # 동기화 상태 카드 (별도 UI 구조)
├── ChartSection.vue        # 접기/펼치기 바 차트 (지역별, 장르별)
├── ContentSection.vue      # 게시글 테이블 (공지사항, 문의내역)
```

#### `StatCard.vue`

| props | 타입 | 설명 |
|-------|------|------|
| `count` | Number | 총 건수 |
| `label` | String | 카드 제목 ("전체 콘텐츠") |
| `icon` | String | BoxIcon 클래스명 |
| `breakdown` | Object | `{ popups, concerts, musicals, exhibitions }` |
| `emptyMessage` | String | 데이터 없을 때 메시지 |

→ 내부에서 `useChart` composable 사용, 차트 자동 렌더링

#### `ChartSection.vue`

| props | 타입 | 설명 |
|-------|------|------|
| `title` | String | 섹션 제목 |
| `data` | Array | `[{ name, count }]` 형태 |
| `labelKey` | String | 라벨로 쓸 키 ("regionName") |
| `valueKey` | String | 값으로 쓸 키 ("count") |

→ 접기/펼치기 토글, `useChart` 바 차트 사용

#### `ContentSection.vue`

| props | 타입 | 설명 |
|-------|------|------|
| `title` | String | 섹션 제목 |
| `link` | String | 더보기 링크 |
| `items` | Array | `[{ id, title, writer, date }]` |
| `showWriteButton` | Boolean | 글작성 버튼 표시 여부 |

→ 현재 `contentSections` 반복 렌더링 로직 대체

### Phase 3: 유틸리티 정리

#### `utils/chartConfig.js` 신규 생성

```js
// 차트 공통 상수
export const CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
export const CHART_LABELS = ['팝업', '콘서트', '뮤지컬', '전시회'];
```

#### `composables/useDateUtils.js` 활용

현재 `useDateUtils.js`에 `formatDate`, `formatRelativeDate`, `formatTimeAgo`가 이미 있음.
대시보드 내부의 중복 함수를 제거하고 기존 composable을 활용.

추가 필요한 함수만 `useDateUtils.js`에 병합:
- `getToday()` — 오늘 날짜 ("2025.04.30" 형식)
- `getNextSyncTime()` — 다음 동기화까지 남은 시간

### Phase 4: 정리

- `defineProps` 불필요한 선언 제거
- `onMounted` 통합 (1회로)
- console.log 제거
- `progressItems` 랜덤값 → 실제 API 연동 또는 제거 검토
- 문의내역 링크 `/admin/inquiries/personal` → `/admin/inquiry` 수정

---

## 리팩터링 전후 비교

### 파일 구조 변경

```
Before:
pages/admin/index.vue                  # 770줄 (모든 로직)
composables/useAdminDashboard.js       # 2줄 (미완성)

After:
pages/admin/index.vue                  # ~80줄 (조합만)
composables/useAdminDashboard.js       # ~60줄 (데이터 fetch + 가공)
composables/useChart.js                # ~70줄 (Chart.js 래퍼)
components/admin/dashboard/
  ├── StatCard.vue                     # ~80줄 (통계 카드)
  ├── SyncStatusCard.vue               # ~50줄 (동기화 카드)
  ├── ChartSection.vue                 # ~60줄 (바 차트 섹션)
  └── ContentSection.vue               # ~70줄 (게시글 테이블)
utils/chartConfig.js                   # ~5줄 (상수)
```

### 코드량 비교

| 항목 | Before | After |
|------|--------|-------|
| 메인 페이지 | 770줄 | ~80줄 |
| 도넛 차트 코드 | 3회 복붙 (~180줄) | composable 1개로 재사용 |
| 바 차트 코드 | 2회 복붙 (~100줄) | 동일 composable 재사용 |
| 날짜 포맷 함수 | 5개 (컴포넌트 내부) | useDateUtils 활용 |
| 파일 수 | 1개 | 8개 (단일 책임) |

---

## 작업 순서 (권장)

1. **`composables/useChart.js`** 생성 — 차트 중복 제거의 핵심
2. **`utils/chartConfig.js`** 생성 — 상수 분리
3. **`composables/useAdminDashboard.js`** 재작성 — 데이터 레이어
4. **`components/admin/dashboard/StatCard.vue`** — 도넛 차트 카드 (3개 → 1 컴포넌트)
5. **`components/admin/dashboard/SyncStatusCard.vue`** — 동기화 카드
6. **`components/admin/dashboard/ChartSection.vue`** — 바 차트 섹션
7. **`components/admin/dashboard/ContentSection.vue`** — 게시글 테이블
8. **`pages/admin/index.vue`** 재작성 — 위 컴포넌트 조합
9. **정리** — console.log 제거, 불필요 코드 삭제, 동작 검증

---

## Nuxt 3 Best Practice 체크리스트

해당 리팩터링에서 적용할 Nuxt 3 권장 패턴:

- [x] **Composable로 로직 분리** — `useChart`, `useAdminDashboard`
- [x] **컴포넌트 단일 책임 원칙** — 카드, 차트, 테이블 각각 분리
- [x] **Props 기반 재사용** — StatCard에 데이터를 props로 전달
- [x] **auto-import 활용** — composables/, utils/ 폴더는 Nuxt가 자동 import
- [x] **기존 composable 재사용** — useDateUtils, useAuthFetch 활용
- [x] **라이프사이클 관리** — useChart에서 onBeforeUnmount 시 Chart.js 인스턴스 자동 정리
- [x] **defineProps에서 불필요한 선언 제거**
- [x] **상수 분리** — 매직넘버, 색상코드를 utils/로

---

## 다른 페이지 리팩터링 시 공통 적용 기준

이 대시보드 리팩터링에서 확립한 패턴을 향후 다른 admin 페이지에도 적용:

| 기준 | 내용 |
|------|------|
| 페이지 컴포넌트 | 200줄 이하 유지, 조합(composition)만 담당 |
| 비즈니스 로직 | composable로 분리 (`composables/use*.js`) |
| UI 반복 패턴 | 컴포넌트로 추출 (`components/admin/`) |
| 유틸리티 함수 | `utils/` 또는 기존 composable에 병합 |
| API 호출 | `useAuthFetch` 래핑한 composable 사용 |
| 하드코딩 데이터 | API 연동 또는 상수 파일로 분리 |
| console.log | 개발 완료 후 제거 |
