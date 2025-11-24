export function useAuthFetch(url, options = {}) {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  // 쿠키 기반 인증을 위한 설정
  const fetchOptions = {
    ...options,
    credentials: 'include',
    server: false,
    headers: {
      ...options.headers,
      ...(authStore.token && { 'Authorization': `Bearer ${authStore.token}` })
    },
    onResponse({ request, response, options }) {
      console.log(`[useAuthFetch] 응답: ${request}`, response._data);
    },
    onResponseError({ request, response, options }) {
      console.error(`[useAuthFetch] 에러: ${request}`, response);

      if(response.status === 401) {
        console.warn("인증 토큰이 만료되었습니다. 로그아웃 처리합니다.");
        authStore.logout();
        navigateTo('/login');
      }
    }
  };

  return useFetch(`${config.public.apiBase}${url}`, fetchOptions);
}