// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  components: true,
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8081/api/v1',
      backendBaseUrl: 'http://localhost:8081',
      kakaoMapApiKey: process.env.NUXT_PUBLIC_KAKAO_MAP_API_KEY || '',
      kakaoLoginApiKey: process.env.NUXT_PUBLIC_KAKAO_LOGIN_API_KEY || '',
    }
  },
  modules: ['lenis/nuxt', '@pinia/nuxt'],
  vite: {
    build: {
      rollupOptions: {
        // external: ['/image/시카고.jpg'],  // 외부화 처리, 빌드 시 이 파일을 제외
      },
    },
  },
  // ssr: true,

  nitro: {
    routeRules: {
      // toast-ui editor가 SSR을 지원하지 않아 reload시 에러가 나는 것을 방지
      "/admin/notice/:id/edit": { ssr: false }, // 실제 사용하는 경로를 넣어줘야함.
      "/admin/contents/popup/:id/edit": { ssr: false },
      "/admin/contents/concert/:id/edit": { ssr: false },
      "/admin/contents/exhibition/:id/edit": { ssr: false },
      "/admin/notice/:id": { ssr: false },
      // "/admin/contents/musical/:id": { ssr: false }
    }
  },

  css: [
    // '/node_modules/@toast-ui/editor/dist/toastui-editor.css',
    '@toast-ui/editor/dist/toastui-editor.css',
    'boxicons/css/boxicons.min.css',
    '/public/css/fonts.css',
    '/public/css/p-style.css',
    '/public/css/icon.css'
  ],

  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css' },
        { rel: 'stylesheet', href: 'https://uicdn.toast.com/editor/latest/toastui-editor.min.css' },
        // { rel: 'stylesheet', href: '/node_modules/@toast-ui/editor/dist/toastui-editor.css' }
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/jquery/latest/jquery.min.js', defer: true },
        { src: 'https://code.jquery.com/ui/1.13.2/jquery-ui.js', integrity: 'sha256-xLD7nhI62fcsEZK2/v8LsBcb4lG7dgULkuXoXB/j91c=', crossorigin: 'anonymous', defer: true },
        { src: 'https://cdn.jsdelivr.net/momentjs/latest/moment.min.js', defer: true },
        { src: 'https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js', defer: true },
        { src: 'https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js', defer: true },
        { src: 'https://uicdn.toast.com/editor-plugin-color-syntax/latest/toastui-editor-plugin-color-syntax.min.js', defer: true },
        { src: '//dapi.kakao.com/v2/maps/sdk.js?appkey=NUXT_PUBLIC_KAKAO_MAP_API_KEY&libraries=services&autoload=false', defer: true },
      ],
    }
  }
})