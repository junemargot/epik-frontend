import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 서버 사이드에서는 건너뛰기 (persist는 클라이언트에서만 동작)
  if (process.server) {
    return;
  }

  const authStore = useAuthStore();

  // Pinia persist가 localStorage에서 상태를 복원할 때까지 대기
  // nextTick을 사용하여 hydration 완료 후 체크
  await new Promise((resolve) => {
    if (authStore.token) {
      resolve();
    } else {
      // localStorage에서 직접 토큰 확인 (persist 복원 전)
      const persistedState = localStorage.getItem('auth');
      if (persistedState) {
        try {
          const parsed = JSON.parse(persistedState);
          if (parsed.token) {
            // persist가 아직 복원되지 않았으면 수동으로 복원
            authStore.$patch({
              token: parsed.token,
              user: parsed.user,
              isLoggedIn: parsed.isLoggedIn
            });
          }
        } catch (e) {
          console.error('Failed to parse persisted auth state:', e);
        }
      }
      resolve();
    }
  });

  // 인증 상태 확인
  const isAuthenticated = authStore.checkAuth();

  if (!isAuthenticated) {
    // 인증되지 않으면 로그인 페이지로 리다이렉트
    return navigateTo('/login');
  }
});