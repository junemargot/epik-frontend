<template>
  <div class="oauth-redirect">
    <div v-if="loading" class="loading">
      <p>로그인 처리 중입니다...</p>
    </div>
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goToLogin">로그인 페이지로 돌아가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
import { useAuthStore } from '~/stores/auth.js';

const config = useRuntimeConfig();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref(null);

const goToLogin = () => {
  navigateTo('/login');
};

// URL 정규화 함수
const normalizeUrl = (url) => {
  if (!url) return '/';

  try {
    // 전체 URL인 경우 경로만 추출
    if(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname + urlObj.search + urlObj.hash;
    }
    // 이미 경로 형태인 경우 그대로 반환
    return url.startsWith('/') ? url : `/${url}`;
  } catch (e) {
    console.error('URL 정규화 오류: ', e);
    return '/';
  }
};

// 쿠키에서 jwt_token 읽기 함수
const getCookieValue = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
};

onMounted(async () => {
  try {
    console.log("OAuthRedirect 컴포넌트 마운트됨");

    // 1. 쿠키에서 토큰 확인
    let token = getCookieValue('jwt_token');
    console.log("쿠키에서 토큰 확인: ", token ? '토큰 있음' : '토큰 없음');
    
    // 2. 쿠키에 없으면 URL에서 토큰 파라미터 확인
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
      console.log("URL 파라미터에서 토큰 확인: ", token ? '토큰 있음' : '토큰 없음');
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login_success');
    console.log("로그인 성공 여부: ", loginSuccess);

    // 로그인 성공이고 토큰이 있으면 처리
    if(loginSuccess === 'true' && token) {
      console.log("토큰 처리 시작");

      try {
        const loginSuccess = authStore.login(token);

        if(!loginSuccess) {
          throw new Error("토큰 검증 실패");
        }

        console.log("사용자 인증 정보 설정 완료: ", authStore.user);

        // 리다이렉트 URL 확인
        const rawRedirectUrl = sessionStorage.getItem('redirectUrl') || '/';
        const redirectUrl = normalizeUrl(rawRedirectUrl);
        console.log("원본 리다이렉트 URL: ", rawRedirectUrl);
        console.log("정규화된 리다이렉트 URL:", redirectUrl);

        // 세션 스토리지 정리
        sessionStorage.removeItem('redirectUrl');
        
        // 정규화된 내부 경로로 리다이렉트
        await navigateTo(redirectUrl, { external: false });
        return;
      
      } catch(decodeError) {
        console.error("토큰 처리 실패: ", decodeError);
        error.value = "토큰 처리 중 오류가 발생했습니다.";
      }
    } else {
      console.error("토큰 또는 로그인 성공 파라미터 없음");
      error.value = "인증 정보를 찾을 수 없습니다. 다시 로그인해 주세요.";
    }
  } catch (err) {
    console.error('OAuth 리다이렉트 처리 오류:', err);
    error.value = '로그인 처리 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류');
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped>
.oauth-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

.loading, .error {
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error {
  color: var(--accent-1);
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--accent-1);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>