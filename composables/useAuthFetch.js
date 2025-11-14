export function useAuthFetch(url, options = {}) {
  const config = useRuntimeConfig();

  // 쿠키 기반 인증을 위한 설정
  const fetchOptions = {
    ...options,
    credentials: 'include',
    server: false,
    headers: {
      ...options.headers,
    },
    onResponse({ request, response, options }) {
      console.log(`[useAuthFetch] 응답: ${request}`, response._data);
    },
    onResponseError({ request, response, options }) {
      console.error(`[useAuthFetch] 에러: ${request}`, response);
    }
  };

  return useFetch(`${config.public.apiBase}${url}`, fetchOptions);
}