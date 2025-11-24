# 1:1 문의 기능 구현 계획 (Frontend)

## 📋 개요
현재 하드코딩되어 있는 1:1 문의 기능을 백엔드 API와 연동하여 완전한 기능으로 구현합니다.

## 🎯 요구사항
1. **비회원 문의 가능**: 비회원도 문의를 작성할 수 있어야 함
2. **제목 고정**: 모든 문의 제목은 "문의"로 고정
3. **비밀번호 처리**:
   - 비회원: 숫자 비밀번호 필수 입력 (4자리)
   - 회원: 비밀번호 입력 불필요 (자동으로 회원 정보와 연동)
4. **비밀글 처리**: 모든 문의글은 비밀글로 작성됨
5. **마이페이지 연동**: 회원은 마이페이지에서 자신의 문의 내역 확인 가능

## 📂 현재 구조 분석

### 기존 페이지
```
pages/mypage/inquiry/
├── index.vue          # 문의 목록 (하드코딩)
├── write.vue          # 문의 작성 (하드코딩)
└── {id}/
    ├── index.vue      # 문의 상세 (하드코딩)
    └── answer.vue     # 답변 확인 (하드코딩)

pages/admin/inquiries/
├── index.vue          # 관리자 문의 목록
├── personal.vue       # 1:1 문의 관리 (하드코딩)
└── business.vue       # 사업자 문의 관리
```

### 문제점
- 모든 데이터가 하드코딩되어 있음
- API 연동 없음
- 인증/비인증 사용자 구분 로직 없음
- 비밀번호 입력/검증 로직 없음

## 🔧 구현 계획

### Phase 1: API 연동 준비
#### 1.1 Composable 생성
**파일**: `composables/useInquiry.js`

```javascript
// 문의 관련 API 호출 로직 담당
- createInquiry(data)      // 문의 작성
- getInquiryList(params)   // 문의 목록 조회
- getInquiryDetail(id, password?) // 문의 상세 조회
- updateInquiry(id, data)  // 문의 수정
- deleteInquiry(id)        // 문의 삭제
- verifyPassword(id, password) // 비밀번호 검증 (비회원용)
```

**기능**:
- `useAuthFetch` 활용하여 인증된 요청 처리
- 비회원 요청은 일반 fetch 사용
- 에러 핸들링 및 로딩 상태 관리

#### 1.2 Store 생성 (선택사항)
**파일**: `stores/inquiry.js`

```javascript
// 문의 상태 관리
- inquiryList: []        // 문의 목록
- currentInquiry: null   // 현재 조회 중인 문의
- totalCount: 0          // 전체 문의 수
- pagination: {}         // 페이지네이션 정보
```

### Phase 2: 문의 작성 페이지 구현
**파일**: `pages/mypage/inquiry/write.vue` (회원용)
**파일**: `pages/inquiry/write.vue` (비회원용 - 신규)

#### 2.1 회원용 작성 폼
```vue
<template>
  <form @submit.prevent="submitInquiry">
    <!-- 제목은 자동으로 "문의"로 설정 (hidden 또는 disabled) -->
    <input type="text" value="문의" disabled />
    
    <!-- 내용 입력 -->
    <textarea 
      v-model="content" 
      placeholder="내용을 입력해주세요."
      maxlength="500"
      required
    ></textarea>
    
    <!-- 비밀번호 입력 필드 없음 -->
    
    <button type="submit">등록</button>
  </form>
</template>
```

#### 2.2 비회원용 작성 폼
```vue
<template>
  <form @submit.prevent="submitInquiry">
    <!-- 제목 고정 -->
    <input type="text" value="문의" disabled />
    
    <!-- 내용 입력 -->
    <textarea 
      v-model="content" 
      placeholder="내용을 입력해주세요."
      maxlength="500"
      required
    ></textarea>
    
    <!-- 비회원 이메일 (선택사항) -->
    <input 
      type="email" 
      v-model="email" 
      placeholder="답변 받으실 이메일 (선택)"
    />
    
    <!-- 비밀번호 입력 (필수, 숫자 4자리) -->
    <input 
      type="password" 
      v-model="password" 
      placeholder="비밀번호 (숫자 4자리)"
      pattern="[0-9]{4}"
      maxlength="4"
      required
    />
    
    <button type="submit">등록</button>
  </form>
</template>

<script setup>
const validatePassword = () => {
  if (!/^\d{4}$/.test(password.value)) {
    alert('비밀번호는 숫자 4자리로 입력해주세요.');
    return false;
  }
  return true;
}
</script>
```

#### 2.3 작성 로직
```javascript
const submitInquiry = async () => {
  const authStore = useAuthStore();
  
  const inquiryData = {
    title: '문의', // 고정
    content: content.value,
    isSecret: true, // 항상 비밀글
  };
  
  // 회원/비회원 구분
  if (authStore.isLoggedIn) {
    // 회원: 토큰과 함께 요청
    await createInquiry(inquiryData);
  } else {
    // 비회원: 비밀번호 포함
    if (!validatePassword()) return;
    
    inquiryData.password = password.value;
    inquiryData.email = email.value; // 선택사항
    
    await createInquiry(inquiryData);
  }
  
  // 성공 시 목록 페이지로 이동
  navigateTo('/mypage/inquiry');
};
```

### Phase 3: 문의 목록 페이지 구현
**파일**: `pages/mypage/inquiry/index.vue`

#### 3.1 회원 목록
```vue
<template>
  <div class="inquiry-list">
    <!-- 필터링 -->
    <div class="filters">
      <select v-model="period">
        <option value="1">1개월</option>
        <option value="3">3개월</option>
        <option value="6">6개월</option>
        <option value="12">12개월</option>
      </select>
      
      <select v-model="status">
        <option value="">전체</option>
        <option value="PENDING">준비 중</option>
        <option value="PROCESSING">처리 중</option>
        <option value="COMPLETED">처리 완료</option>
      </select>
      
      <button @click="loadInquiries">조회</button>
    </div>
    
    <!-- 문의 목록 -->
    <ul class="inquiry-items">
      <li 
        v-for="inquiry in inquiryList" 
        :key="inquiry.id"
        @click="goToDetail(inquiry.id)"
      >
        <span class="title">{{ inquiry.title }}</span>
        <span class="date">{{ formatDate(inquiry.createdAt) }}</span>
        <span 
          class="status" 
          :class="inquiry.status"
        >
          {{ getStatusText(inquiry.status) }}
        </span>
      </li>
    </ul>
    
    <!-- 페이지네이션 -->
    <pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @change="loadInquiries"
    />
  </div>
</template>

<script setup>
const { getInquiryList } = useInquiry();
const authStore = useAuthStore();

const inquiryList = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const period = ref(3);
const status = ref('');

const loadInquiries = async () => {
  const params = {
    page: currentPage.value,
    period: period.value,
    status: status.value
  };
  
  const response = await getInquiryList(params);
  inquiryList.value = response.data;
  totalPages.value = response.totalPages;
};

onMounted(() => {
  if (!authStore.isLoggedIn) {
    navigateTo('/login');
    return;
  }
  loadInquiries();
});
</script>
```

### Phase 4: 문의 상세 페이지 구현
**파일**: `pages/mypage/inquiry/[id]/index.vue`

#### 4.1 회원용 상세 페이지
```vue
<template>
  <div v-if="inquiry" class="inquiry-detail">
    <h1>{{ inquiry.title }}</h1>
    
    <div class="content">
      {{ inquiry.content }}
    </div>
    
    <div class="info">
      <span>작성일: {{ formatDate(inquiry.createdAt) }}</span>
      <span>상태: {{ getStatusText(inquiry.status) }}</span>
    </div>
    
    <!-- 답변이 있는 경우 -->
    <div v-if="inquiry.answer" class="answer">
      <h2>답변</h2>
      <div class="answer-content">
        {{ inquiry.answer.content }}
      </div>
      <span class="answer-date">
        {{ formatDate(inquiry.answer.createdAt) }}
      </span>
    </div>
    
    <!-- 버튼 그룹 -->
    <div class="buttons">
      <button @click="goToList">목록</button>
      <button 
        v-if="!inquiry.answer" 
        @click="goToEdit"
      >
        수정
      </button>
      <button 
        v-if="!inquiry.answer" 
        @click="deleteInquiry"
      >
        삭제
      </button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const { getInquiryDetail, deleteInquiry: deleteInquiryApi } = useInquiry();

const inquiry = ref(null);

const loadInquiry = async () => {
  const id = route.params.id;
  inquiry.value = await getInquiryDetail(id);
};

const deleteInquiry = async () => {
  if (!confirm('문의를 삭제하시겠습니까?')) return;
  
  await deleteInquiryApi(route.params.id);
  navigateTo('/mypage/inquiry');
};

onMounted(loadInquiry);
</script>
```

#### 4.2 비회원 상세 페이지 접근
**파일**: `pages/inquiry/[id]/index.vue` (신규)

```vue
<template>
  <div v-if="!isVerified" class="password-verify">
    <h1>비밀번호 확인</h1>
    <form @submit.prevent="verifyPassword">
      <input 
        type="password" 
        v-model="password" 
        placeholder="비밀번호 (숫자 4자리)"
        pattern="[0-9]{4}"
        maxlength="4"
        required
      />
      <button type="submit">확인</button>
    </form>
  </div>
  
  <div v-else-if="inquiry" class="inquiry-detail">
    <!-- 회원용과 동일한 UI -->
  </div>
</template>

<script setup>
const route = useRoute();
const { getInquiryDetail, verifyPassword: verifyPasswordApi } = useInquiry();

const password = ref('');
const isVerified = ref(false);
const inquiry = ref(null);

const verifyPassword = async () => {
  const id = route.params.id;
  const result = await verifyPasswordApi(id, password.value);
  
  if (result.success) {
    isVerified.value = true;
    inquiry.value = result.data;
  } else {
    alert('비밀번호가 일치하지 않습니다.');
  }
};
</script>
```

### Phase 5: 라우팅 및 네비게이션
#### 5.1 라우팅 구조
```
/mypage/inquiry          # 회원 문의 목록
/mypage/inquiry/write    # 회원 문의 작성
/mypage/inquiry/[id]     # 회원 문의 상세

/inquiry/write           # 비회원 문의 작성 (신규)
/inquiry/[id]            # 비회원 문의 상세 (신규)
```

#### 5.2 Footer 링크 추가
**파일**: `components/Footer.vue`

```vue
<template>
  <footer>
    <!-- 기존 링크들 -->
    <NuxtLink to="/inquiry/write">1:1 문의</NuxtLink>
  </footer>
</template>
```

### Phase 6: 관리자 페이지 연동
**파일**: `pages/admin/inquiries/personal.vue`

```vue
<template>
  <div class="admin-inquiry-list">
    <h1>문의 관리 - 1:1 문의내역</h1>
    <p>총 게시물수: {{ totalCount }}건</p>
    
    <!-- 필터링 -->
    <div class="filters">
      <select v-model="status">
        <option value="">전체</option>
        <option value="PENDING">준비 중</option>
        <option value="PROCESSING">처리 중</option>
        <option value="COMPLETED">처리 완료</option>
      </select>
      
      <button @click="loadInquiries">조회</button>
    </div>
    
    <!-- 목록 테이블 -->
    <table class="inquiry-table">
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>작성자</th>
          <th>문의접수일</th>
          <th>답변일</th>
          <th>처리상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inquiry in inquiryList" :key="inquiry.id">
          <td>{{ inquiry.id }}</td>
          <td>
            <NuxtLink :to="`/admin/inquiries/${inquiry.id}`">
              {{ inquiry.title }}
            </NuxtLink>
          </td>
          <td>
            {{ inquiry.isMember ? inquiry.memberName : '비회원' }}
          </td>
          <td>{{ formatDate(inquiry.createdAt) }}</td>
          <td>
            {{ inquiry.answeredAt ? formatDate(inquiry.answeredAt) : '-' }}
          </td>
          <td>{{ getStatusText(inquiry.status) }}</td>
          <td>
            <button @click="goToAnswer(inquiry.id)">답변</button>
            <button @click="deleteInquiry(inquiry.id)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- 페이지네이션 -->
    <pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @change="loadInquiries"
    />
  </div>
</template>

<script setup>
const { getInquiryList, deleteInquiry: deleteInquiryApi } = useInquiry();

const inquiryList = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const status = ref('');

const loadInquiries = async () => {
  const params = {
    page: currentPage.value,
    status: status.value,
    isAdmin: true // 관리자 모드
  };
  
  const response = await getInquiryList(params);
  inquiryList.value = response.data;
  totalPages.value = response.totalPages;
  totalCount.value = response.totalCount;
};

onMounted(loadInquiries);
</script>
```

## 📝 API 명세 (백엔드 요청사항)

### 1. 문의 작성
```
POST /api/inquiries (비회원)
POST /api/member/inquiries (회원)

Request Body:
{
  "title": "문의",
  "content": "문의 내용",
  "isSecret": true,
  "password": "1234",  // 비회원만
  "email": "user@example.com"  // 비회원 선택사항
}

Response:
{
  "id": 123,
  "title": "문의",
  "content": "문의 내용",
  "createdAt": "2024-11-17T10:00:00",
  "status": "PENDING"
}
```

### 2. 문의 목록 조회 (회원)
```
GET /api/member/inquiries?page=1&period=3&status=PENDING

Response:
{
  "data": [
    {
      "id": 123,
      "title": "문의",
      "createdAt": "2024-11-17T10:00:00",
      "status": "PENDING",
      "hasAnswer": false
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalCount": 50
}
```

### 3. 문의 상세 조회 (회원)
```
GET /api/member/inquiries/{id}

Response:
{
  "id": 123,
  "title": "문의",
  "content": "문의 내용",
  "createdAt": "2024-11-17T10:00:00",
  "status": "COMPLETED",
  "answer": {
    "content": "답변 내용",
    "createdAt": "2024-11-18T15:00:00"
  }
}
```

### 4. 비회원 문의 비밀번호 검증
```
POST /api/inquiries/{id}/verify

Request Body:
{
  "password": "1234"
}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "title": "문의",
    "content": "문의 내용",
    ...
  }
}
```

### 5. 관리자 문의 목록
```
GET /api/admin/inquiries?page=1&status=PENDING

Response:
{
  "data": [
    {
      "id": 123,
      "title": "문의",
      "isMember": true,
      "memberName": "홍길동",
      "createdAt": "2024-11-17T10:00:00",
      "answeredAt": null,
      "status": "PENDING"
    }
  ],
  "currentPage": 1,
  "totalPages": 10,
  "totalCount": 95
}
```

## ✅ 체크리스트

### 프론트엔드
- [ ] `composables/useInquiry.js` 생성
- [ ] `stores/inquiry.js` 생성 (선택)
- [ ] 회원 문의 작성 페이지 구현 (`/mypage/inquiry/write.vue`)
- [ ] 비회원 문의 작성 페이지 구현 (`/inquiry/write.vue`)
- [ ] 회원 문의 목록 페이지 구현 (`/mypage/inquiry/index.vue`)
- [ ] 회원 문의 상세 페이지 구현 (`/mypage/inquiry/[id]/index.vue`)
- [ ] 비회원 문의 상세 페이지 구현 (`/inquiry/[id]/index.vue`)
- [ ] 비회원 비밀번호 검증 로직 구현
- [ ] 관리자 문의 목록 페이지 구현 (`/admin/inquiries/personal.vue`)
- [ ] 관리자 답변 페이지 구현
- [ ] Footer에 1:1 문의 링크 추가
- [ ] 날짜 포맷팅 유틸 함수 추가
- [ ] 상태 텍스트 변환 함수 추가
- [ ] 에러 핸들링 및 로딩 상태 UI 구현

## 🚀 개발 순서
1. **Phase 1**: Composable 및 기본 유틸리티 작성
2. **Phase 2**: 회원 문의 작성/목록/상세 구현 및 테스트
3. **Phase 3**: 비회원 문의 작성/상세 구현 및 테스트
4. **Phase 4**: 관리자 페이지 구현 및 테스트
5. **Phase 5**: 통합 테스트 및 UI/UX 개선
6. **Phase 6**: 최종 검수 및 배포

## 🔍 주의사항
1. **보안**: 비회원 비밀번호는 해시화되어 저장되어야 함 (백엔드)
2. **인증**: 회원 문의는 JWT 토큰 기반 인증 필수
3. **권한**: 본인 문의만 조회/수정/삭제 가능하도록 제어
4. **에러 처리**: 네트워크 오류, 인증 실패 등 모든 케이스 처리
5. **UX**: 로딩 상태, 빈 목록 안내, 에러 메시지 명확하게 표시
