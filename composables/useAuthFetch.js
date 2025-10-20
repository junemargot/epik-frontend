export function useAuthFetch(url, options = {}) {
  const config = useRuntimeConfig();

  // 쿠키 기반 인증을 위한 설정
  const fetchOptions = {
    ...options,
    credentials: 'include', // 쿠키 포함
    headers: {
      ...options.headers,
    }
  };

  return useFetch(`${config.public.apiBase}${url}`, fetchOptions);
}