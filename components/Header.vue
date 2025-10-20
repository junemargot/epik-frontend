<template>
  <div class="header-box">
    <header>
      <div class="top-bar">
        <div class="top-bar__column">
          <span>EXPAND YOUR LEISURE LIFE WITH EPIK.</span>
        </div>
        <div class="top-bar__column">
          <!-- 로그인 상태일 때 -->
          <div v-if="authStore.isLoggedIn">
            <a href="/mypage">마이페이지</a>
            <a @click="logoutHandler">로그아웃</a>
          </div>
          <!-- 로그아웃 상태일 때 -->
          <div v-else>
            <a href="/signup">회원가입</a>
            <a @click="goToLoginPageHandler">로그인</a>
          </div>
        </div>
      </div>
      <div class="main-header">
        <div class="main-header__title">
          <h1><RouterLink to="/">EPIK</RouterLink></h1>
        </div>
        <div class="main-header__icon" @click="toggleSidebar">
          <i class='bx bx-menu'></i>
        </div>

        <div class="dropdown-menu" :class="{ 'move-sidebar': isSidebarOpen }">
          <div class="dropdown-menu__inner">

            <div class="dropdown-menu__header">
              <div class="dropdown-menu__title">
                <h1><RouterLink to="/">EPIK</RouterLink></h1>
              </div>
              <div class="dropdown-menu__cancle" @click="closeSidebar">
                <i class='bx bx-x'></i>
              </div>
            </div>

            <!-- <div class="search-bar">
              <form>
                <button type="submit" class="search-bar__submintbutton">
                  <i class='bx bx-search'></i>
                </button>
                <div class="search-bar__input-wrap">
                  <input type="text" placeholder="검색어를 입력해주세요.">
                  <button type="reset" class="search-bar__clear" @click="clearSearch">
                    <i class='bx bx-x search-bar-remove-icon'></i>
                  </button>
                </div>
              </form>
            </div> -->

            <nav>
              <ul>
                <li class="dropdown-menu__link">
                  <NuxtLink to="/popup/region">Pop-Up</NuxtLink>
                  <ul>
                    <li><NuxtLink to="/popup/region" @click="closeSidebarOnNav">지역별</NuxtLink></li>
                    <li><NuxtLink to="/popup/category">카테고리별</NuxtLink></li>
                    <li><NuxtLink to="/popup/soon">오픈예정</NuxtLink></li>
                    <li><NuxtLink to="/popup/location">위치기반 팝업 추천지도</NuxtLink></li>
                  </ul>
                </li>
                <li class="dropdown-menu__link">
                  <NuxtLink to="/musical">Musical</NuxtLink>
                </li>
                <li class="dropdown-menu__link">
                  <NuxtLink to="/concert">Concert</NuxtLink>
                </li>
                <li class="dropdown-menu__link">
                  <NuxtLink to="/exhibition">Exhibition</NuxtLink>
                </li>
                <li class="dropdown-menu__link">
                  <NuxtLink to="/feed">Feed</NuxtLink>
                  <span>당신의 시간을 공유해주세요!</span>
                </li>
                <!-- <li class="dropdown-menu__link">
                  <NuxtLink to="chat">Chat</NuxtLink>
                  <span>다른 유저들과 이야기를 나눠보세요!</span>
                </li> -->
              </ul>
            </nav>

            <div class="dropdown-menu__auth">
              <div v-if="authStore.isLoggedIn">
                <a href="/mypage">마이페이지</a>
                <a @click="logoutHandler">로그아웃</a>
              </div>
              <!-- 로그아웃 상태일 때 -->
              <div v-else>
                <a href="/signup">회원가입</a>
                <a @click="goToLoginPageHandler">로그인</a>
              </div>
            </div>
          </div> <!-- sidebar-inner -->
        </div> <!-- sidebar -->
      </div> <!-- main-header -->
    </header>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '~/stores/auth.js';
import { storeToRefs } from 'pinia'

const router = useRouter()
const userDetails = useUserDetails();  // 사용자 정보를 가져오는 함수
const authStore = useAuthStore();

watch(() => authStore.isLoggedIn, (newValue) => {
  console.log('로그인 상태 변경: ', newValue);
}, { immediate: true });

onMounted(() => {
  // 초기 인증 상태 확인
  authStore.checkAuth();
  if(authStore.isLoggedIn) {
    try {
      const token = localStorage.getItem('access_token');
      const userInfo = jwtDecode(token);
      userDetails.setAuthentication({
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        role: Array.isArray(userInfo.role)
          ? userInfo.role.map(role => typeof role === 'object' ? role.authority : role).filter(Boolean)
          : [userInfo.role].filter(Boolean),
        nickname: userInfo.nickname,
        token: token
      });
    } catch(error) {
      console.error("토큰 디코딩 오류: ", error);
      authStore.logout(); // 토큰 오류 시 로그아웃 처리
    }
  }
});

//로그인 화면 이동 핸들러
const goToLoginPageHandler = () => {
  // 현재 페이지의 URL을 sessionStorage에 저장
  const currentUrl = window.location.href;
  sessionStorage.setItem('redirectUrl', currentUrl);  // 로그인 후 리디렉션할 URL 저장
  
  // 로그인 페이지로 이동
  router.push('/login');
  // location.href = 'http://localhost:3000/login/'
};

//로그아웃 핸들러
const logoutHandler = async () => {
  try {
    // 백엔드 로그아웃 API 호출 (쿠키 삭제)
    await $fetch('http://localhost:8081/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  
  } catch(error) {
    console.error("로그아웃 에러: ", error);
  } finally {
    // localStorage 정리
    userDetails.logout();

    // 페이지 이동
    // router.push('/');

    // 완전한 새로고침
    window.location.href = '/';
  }
};

// 사이드바 상태
const isSidebarOpen = ref(false);

// 사이드바 열기/닫기 토글 함수
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// 사이드바 닫기 함수
const closeSidebar = () => {
  isSidebarOpen.value = false;
};

router.afterEach(() => {
  isSidebarOpen.value = false;
})


// 사이드바 외부 영역 드롭다운 처리
const closeSidebarOnNav = () => {
  isSidebarOpen.value = false;
};

</script>


<style lang="css" scoped>
@import url('/public/css/header.css');
</style>
