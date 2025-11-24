<template>
  <main class="login-in-wrap">
    <div class="login-in-inner">
      <section class="log-in__wrap small-wrap">
        <div class="log-in__intro">
          <h1 class="log-in__title intro-title">로그인</h1>
          <div class="log-in__text">당신의 일상에 특별한 문화 한 스푼, 지금 에픽에서 시작하세요.</div>
        </div>

        <!-- 로컬 로그인 -->
        <div class="log-in__form">
          <input class="log-in__id form" v-model="usernameModel" placeholder="아이디를 입력해주세요">
          <input type="password" class="log-in__password form" v-model="passwordModel" placeholder="비밀번호를 입력해주세요">
          <div class="message-container">
            <div v-if="memberCheck === false" class="small_text_red">
              아이디와 비밀번호를 확인해주세요
            </div>
            <div v-if="loginError" class="small_text_red">
              {{ loginErrorMessage }}
            </div>
          </div>
          <button class="long_btn" type="button" @click="localLoginHandler">로그인</button>
        </div>

        <!-- 소셜 로그인 -->
        <nav class="log-in__social">
          <ul class="log-in__icons">
            <!-- <li class="log-in__icon"><a @click.prevent="kakaoLoginHandler" class="log-in__kakao">카카오<br>로그인</a></li>
            <li class="log-in__icon"><a href="#" class="log-in__naver">네이버<br>로그인 </a></li>
            <li class="log-in__icon"><a @click.prevent="googleLoginHandler" class="log-in__google">구글<br>로그인 </a></li> -->
            <li class="log-in__icon"><a @click.prevent="socialLoginHandler('kakao')" class="log-in__kakao">카카오<br>로그인</a></li>
            <li class="log-in__icon"><a @click.prevent="socialLoginHandler('naver')" class="log-in__naver">네이버<br>로그인 </a></li>
            <li class="log-in__icon"><a @click.prevent="socialLoginHandler('google')" class="log-in__google">구글<br>로그인 </a></li>
            <!-- <li class="log-in__icon"><a @click.prevent="googleLoginHandler" class="log-in__google">구글<br>로그인 </a></li> -->
          </ul>
        </nav>

        <!-- 아이디/비밀번호 찾기 -->
        <div class="log-in__search">
          <nav>
            <ul class="log-in__search-form">
              <li><a href="http://localhost:3000/find/id" class="log-in__search-id">아이디찾기</a></li>
              <li><a href="http://localhost:3000/find/password" class="log-in__search-password">비밀번호찾기</a></li>
            </ul>
          </nav>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth.js';
import { useRouter } from 'vue-router';

// 1. 필요한 것들만 남깁니다.
const runtimeConfig = useRuntimeConfig();
const apiBase = runtimeConfig.public.apiBase;
const router = useRouter();
const authStore = useAuthStore();

// 2. 로그인 폼과 에러 메시지를 위한 반응형 변수
const usernameModel = ref('');
const passwordModel = ref('');
const loginError = ref(false);
const loginErrorMessage = ref('');

// 3. 로컬 로그인 핸들러 단순화
const localLoginHandler = async () => {
  loginError.value = false; // 에러 상태 초기화

  try {
    // API 호출
    const data = await $fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      body: {
        username: usernameModel.value,
        password: passwordModel.value,
      },
    });

    // 서버 응답에 토큰이 있는지, 유효한 문자열인지 확인
    if (!data || typeof data.token !== 'string' || !data.token.includes('.')) {
      console.error('유효하지 않은 토큰 형식:', data);
      loginError.value = true;
      loginErrorMessage.value = '서버 응답이 올바르지 않습니다. 관리자에게 문의하세요.';
      return;
    }

    // ✅ 가장 중요한 부분: authStore의 login 액션만 호출합니다.
    // 이 액션이 토큰 저장, 사용자 정보 저장을 모두 처리합니다.
    const loginSuccess = authStore.login(data.token);

    if (loginSuccess) {
      const fullUrl = sessionStorage.getItem('redirectUrl') || '/';
      // 로그인 성공 시, 이전 페이지 또는 메인 페이지로 이동
      sessionStorage.removeItem('redirectUrl');

      const redirectPath = new URL(fullUrl, window.location.origin).pathname;
      router.push(redirectPath);
    } else {
      // authStore.login 내부에서 토큰 검증 실패 시
      throw new Error('스토어에서 토큰 처리를 실패했습니다.');
    }

  } catch (error) {
    console.error('로그인 실패:', error);
    loginError.value = true;
    // error.data?.message는 $fetch가 반환하는 오류 객체에 있을 수 있습니다.
    loginErrorMessage.value = error.data?.message || '아이디와 비밀번호를 확인해주세요.';
  }
};

// 4. 소셜 로그인 핸들러
const socialLoginHandler = (provider) => {
  if (!['google', 'kakao', 'naver'].includes(provider)) {
    console.error('지원하지 않는 소셜 로그인 제공자: ', provider);
    return;
  }
  // Spring Security OAuth2 인증 엔드포인트로 리다이렉트
  const authorizationUrl = `${apiBase}/oauth2/authorization/${provider}`;
  window.location.href = authorizationUrl;
};

// 5. 불필요하고 오류를 유발하던 onMounted 훅은 완전히 제거합니다.
// (로그인 페이지에 이미 와있는데 또 로그인 처리를 할 필요가 없으며,
// 앱 로딩 시의 인증 처리는 layouts/default.vue에서 이미 하고 있습니다.)

</script>

<style>
@import url('/public/css/login/login.css');
.message-container {
  min-height: 13px;
  transition: height 0.2s ease;
}

.long_btn:hover {
  background-color: var(--accent-1);
  color: var(--white);
  cursor: pointer;
}

.log-in__icon {
  cursor: pointer;
}

.small_text_red {
  color: var(--accent-1);
  margin: 0 0 0 4px;
  font-size: var(--font-size-5);
}
</style>