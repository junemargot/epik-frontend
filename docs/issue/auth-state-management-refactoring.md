# Auth 상태 관리 리팩토링 계획

## 문제 상황

### 현재 구조의 문제점

현재 프로젝트에서 **두 개의 중복된 상태 관리 시스템**이 존재하여 데이터 동기화 문제가 발생합니다.

| 시스템 | 파일 | 저장 위치 |
|--------|------|----------|
| authStore | `stores/auth.js` | localStorage `auth` 키 (JSON) |
| useUserDetails | `composables/useUserDetails.js` | localStorage 개별 키들 (`access_token`, `profile_img`, `nickname` 등) |

### 발생하는 문제들

1. **데이터 불일치**: 두 시스템이 서로 다른 localStorage 키를 사용하여 동기화 안 됨
2. **덮어쓰기 충돌**: 새로고침 시 한 시스템이 다른 시스템의 데이터를 덮어씀
3. **깜빡거림(Flicker)**: 초기 렌더링 시 데이터가 null → 복원 후 실제 값으로 변경
4. **복잡한 수동 동기화**: middleware, onMounted 등에서 수동으로 상태 복원 필요
5. **유지보수 어려움**: 어디서 상태를 변경해야 하는지 혼란

---

## 해결 방향

### authStore (Pinia + persist)로 통합

**이유:**
- Pinia는 Vue 3 공식 상태 관리 라이브러리
- pinia-plugin-persistedstate가 localStorage 동기화 자동 처리
- Vue devtools에서 상태 확인 가능
- getter, action으로 구조화되어 유지보수 용이

---

## 현재 authStore 구조 (stores/auth.js)

### State
```javascript
state: () => ({
  isLoggedIn: false,
  user: {
    id: null,
    username: null,
    email: null,
    nickname: null,
    profileImg: null,
    role: null,
  },
  token: null,
})
```

### Getters
- `profileImageUrl`: 프로필 이미지 URL 생성
- `isAuthenticated`: 인증 상태 확인

### Actions
- `login(token)`: JWT 토큰으로 로그인
- `logout(options)`: 로그아웃
- `checkAuth()`: 토큰 유효성 검증
- `updateProfileImage(newToken, profileImgPath)`: 프로필 이미지 업데이트

---

## useUserDetails에서 이전해야 할 기능

### 1. Getters 추가 필요

```javascript
// authStore getters에 추가
isAnonymous: (state) => state.user.username === null,

hasRole: (state) => (roleToCheck) => {
  if (!state.user.role) return false;

  if (Array.isArray(state.user.role)) {
    return state.user.role.some(r => {
      if (typeof r === 'object' && r.authority) {
        return r.authority === roleToCheck;
      }
      return r === roleToCheck;
    });
  }

  return state.user.role === roleToCheck;
},
```

### 2. Actions는 이미 충분

- `login()` → `setAuthentication()` 대체
- `logout()` → 이미 존재
- `checkAuth()` → `loadUserFromStorage()` 대체

---

## 수정해야 할 파일 목록

### 1. components/Header.vue

**현재 사용:**
- `userDetails.setAuthentication()` - 로그인 정보 설정
- `userDetails.logout()` - 로그아웃

**수정 내용:**
```javascript
// 변경 전
const userDetails = useUserDetails();
userDetails.setAuthentication({...});
userDetails.logout();

// 변경 후
import { useAuthStore } from '~/stores/auth.js';
const authStore = useAuthStore();
authStore.login(token);  // setAuthentication 대체
authStore.logout();
```

**세부 수정 위치:**
- 112번 줄: `useUserDetails()` → `useAuthStore()` import
- 126번 줄: `userDetails.setAuthentication()` → `authStore.login(token)`
- 168번 줄: `userDetails.logout()` → `authStore.logout()`

---

### 2. components/admin/adminAside.vue

**현재 사용:**
- `userDetails.nickname.value` - 닉네임 표시
- `userDetails.profileImg.value` - 프로필 이미지 표시
- `userDetails.logout()` - 로그아웃
- `userDetails.loadUserFromStorage()` - 스토리지에서 로드

**수정 내용:**
```javascript
// 변경 전
const userDetails = useUserDetails();
userDetails.nickname.value
userDetails.profileImg.value
userDetails.loadUserFromStorage()
userDetails.logout()

// 변경 후
import { useAuthStore } from '~/stores/auth.js';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// nickname
user.value.nickname

// profileImg
user.value.profileImg

// loadUserFromStorage는 불필요 (Pinia persist가 자동 처리)

// logout
authStore.logout()
```

**세부 수정 위치:**
- 268번 줄: composable 변경
- 271-275번 줄: nickname 접근 방식 변경
- 279-284번 줄: profileImg 접근 방식 변경
- 303번 줄: logout 호출 변경
- 314-324번 줄: loadUserFromStorage 관련 코드 제거

---

### 3. pages/feed/my.vue

**현재 사용:**
- `userDetails.profileImg.value` - 프로필 이미지
- `userDetails.nickname.value` - 닉네임
- `userDetails.loadUserFromStorage()` - 스토리지에서 로드

**수정 내용:**
```javascript
// 변경 전
const userDetails = useUserDetails();
userDetails.profileImg.value
userDetails.nickname.value
userDetails.loadUserFromStorage()

// 변경 후
import { useAuthStore } from '~/stores/auth.js';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

user.value.profileImg
user.value.nickname
// loadUserFromStorage 불필요
```

**세부 수정 위치:**
- 122번 줄: composable 변경
- 138번 줄: profileImg 접근 변경
- 166번 줄: nickname 접근 변경
- 204번 줄: loadUserFromStorage 제거

---

### 4. pages/redirect.vue

**현재 사용:**
- `userDetails.setAuthentication()` - OAuth 로그인 후 정보 설정

**수정 내용:**
```javascript
// 변경 전
const userDetails = useUserDetails();
userDetails.setAuthentication({...});

// 변경 후
import { useAuthStore } from '~/stores/auth.js';
const authStore = useAuthStore();
authStore.login(token);
```

**참고:** 현재 이미 `authStore.login(token)`을 호출하고 있음. `userDetails.setAuthentication()` 호출만 제거하면 됨.

**세부 수정 위치:**
- 18번 줄: useAuthStore import 확인
- 21-22번 줄: useUserDetails 제거
- 92-102번 줄: setAuthentication 호출 제거

---

### 5. pages/mypage/password/update.vue

**현재 사용:**
- `userDetails.setAuthentication()` - 비밀번호 변경 후 토큰 갱신

**수정 내용:**
```javascript
// 변경 전
userDetails.setAuthentication({...});

// 변경 후
authStore.login(token);
```

**세부 수정 위치:**
- 61번 줄: composable 변경
- 94번 줄, 154번 줄: setAuthentication → authStore.login

---

### 6. pages/mypage/password/check.vue

**현재 사용:**
- `userDetails.setAuthentication()` - 비밀번호 확인 후 토큰 갱신

**수정 내용:**
```javascript
// 변경 전
userDetails.setAuthentication({...});

// 변경 후
authStore.login(token);
```

**세부 수정 위치:**
- 47번 줄: composable 변경
- 74번 줄: setAuthentication → authStore.login

---

### 7. pages/mypage/info/modify.vue

**현재 사용:**
- `userDetails.setAuthentication()` - 회원정보 수정 후 토큰 갱신

**수정 내용:**
```javascript
// 변경 전
userDetails.setAuthentication({...});

// 변경 후
authStore.login(token);
```

**세부 수정 위치:**
- 87번 줄: composable 변경
- 191번 줄, 246번 줄: setAuthentication → authStore.login

---

### 8. pages/find/password/change.vue

**현재 사용:**
- `useUserDetails()` - 사용만 하고 메서드 호출 없음

**수정 내용:**
- useUserDetails import 제거
- 필요시 authStore로 대체

**세부 수정 위치:**
- 62번 줄: useUserDetails 제거

---

### 9. composables/useUserDetails.js

**최종 작업:**
- 모든 파일 마이그레이션 완료 후 **삭제**

---

## 실행 순서

### Phase 1: authStore 기능 보강

1. `stores/auth.js`에 getter 추가:
   - `isAnonymous`
   - `hasRole`

### Phase 2: 파일별 마이그레이션

우선순위에 따라 순차적으로 수정:

1. **pages/redirect.vue** - OAuth 로그인의 핵심
2. **components/Header.vue** - 전역 컴포넌트
3. **pages/mypage/\*\*** - 마이페이지 관련 파일들
4. **components/admin/adminAside.vue** - 관리자 컴포넌트
5. **pages/feed/my.vue** - 피드 페이지

### Phase 3: 정리

1. `useUserDetails.js` 삭제
2. 불필요한 localStorage 키 정리 코드 추가 (마이그레이션 시)
3. middleware/auth.js 단순화 (수동 복원 로직 제거 가능)

---

## 마이그레이션 체크리스트

- [ ] authStore에 `isAnonymous`, `hasRole` getter 추가
- [ ] pages/redirect.vue 수정
- [ ] components/Header.vue 수정
- [ ] pages/mypage/password/update.vue 수정
- [ ] pages/mypage/password/check.vue 수정
- [ ] pages/mypage/info/modify.vue 수정
- [ ] pages/find/password/change.vue 수정
- [ ] components/admin/adminAside.vue 수정
- [ ] pages/feed/my.vue 수정
- [ ] composables/useUserDetails.js 삭제
- [ ] 테스트: 로그인/로그아웃
- [ ] 테스트: OAuth 로그인
- [ ] 테스트: 프로필 이미지 변경 및 새로고침
- [ ] 테스트: 마이페이지 접근
- [ ] 테스트: 관리자 페이지 접근

---

## 예상 효과

1. **단일 저장소**: `auth` 키 하나로 통합
2. **자동 동기화**: Pinia persist가 처리
3. **깜빡거림 제거**: 초기 렌더링부터 올바른 데이터
4. **코드 단순화**: 수동 동기화 로직 제거
5. **유지보수 용이**: 상태 변경 위치가 명확

---

## 주의사항

1. 각 파일 수정 후 **반드시 테스트** 진행
2. 기존 localStorage의 개별 키들(`access_token`, `profile_img` 등)은 마이그레이션 후 정리 필요
3. 로그아웃 시 모든 localStorage 키 정리 확인
4. OAuth 로그인 플로우 특히 주의 (redirect.vue)

---

## 작성일

2024-11-20
