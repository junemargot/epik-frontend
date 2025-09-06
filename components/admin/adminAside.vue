<template>
  <div class="wrap">
  <!-- SIDEBAR -->
  <section id="sidebar">
    <RouterLink to="/admin" class="logo">
      <strong>EPIK</strong><span>관리자페이지</span>
    </RouterLink>
    <ul class="sidebar__menu">
      <li>
        <RouterLink to="/admin" class="active"> <!-- active 수정 -->
          <i class='bx bx-home icon'></i>Dashboard
        </RouterLink>
      </li>
      <li class="sidebar__menu-divider" data-text="menu">member</li>
      <li v-for="(item, index) in memberMenuItems" :key="index" :class="{ active: activeMenu === item.name, 'is-open': activeDropdown === item.name }">
        <a href="#" @click.prevent="toggleDropdown(item.name)">
          <i class='bx bx-user icon'></i>{{ item.label }}
          <i class='bx bxs-chevron-right icon-right'></i>
        </a>
        <ul class="sidebar__menu-dropdown" :class="{ show: activeDropdown === item.name }">
          <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
            <RouterLink :to="subItem.link" :class="{ active: activeMenu === item.name }">{{ subItem.label }}</RouterLink> <!--여기까지 일단 수정 -->
          </li>
        </ul>
      </li>
      <li class="sidebar__menu-divider">contents</li>
      <li v-for="(item, index) in contentsMenuItems" :key="index" :class="{ 'is-open': activeDropdown === item.name }">
        <a href="#" @click.prevent="toggleDropdown(item.name)">
          <i class='bx bx-box icon'></i>{{ item.label }}
          <i class='bx bxs-chevron-right icon-right'></i>
        </a>
        <ul class="sidebar__menu-dropdown" :class="{ show: activeDropdown === item.name }">
          <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
            <RouterLink :to="subItem.link">{{ subItem.label }}</RouterLink>
          </li>
        </ul>
      </li>
      <li v-for="(item, index) in feedMenuItems" :key="index">
        <a href="#" @click.prevent="toggleDropdown(item.name)">
          <i class='bx bx-book-content icon'></i>{{ item.label }}
          <i class='bx bxs-chevron-right icon-right'></i>
        </a>
        <ul class="sidebar__menu-dropdown" :class="{ show: activeDropdown === item.name }">
          <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
            <RouterLink :to="subItem.link">{{ subItem.label }}</RouterLink>
          </li>
        </ul>
      </li>
      <li class="sidebar__menu-divider">manage</li>
      <li v-for="(item, index) in dataSyncMenuItems" :key="index">
        <a href="#" @click.prevent="toggleDropdown(item.name)">
          <i class='bx bx-book-content icon'></i>{{ item.label }}
          <i class='bx bxs-chevron-right icon-right'></i>
        </a>
        <ul class="sidebar__menu-dropdown" :class="{ show: activeDropdown === item.name }">
          <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
            <RouterLink :to="subItem.link">{{ subItem.label }}</RouterLink>
          </li>
        </ul>
      </li>
      <li v-for="(item, index) in reportMenuItems" :key="index" :class="{ 'is-open': activeDropdown === item.name }">
        <a href="#" @click.prevent="toggleDropdown(item.name)">
          <i class='bx bx-flag icon'></i>{{ item.label }}
          <i class='bx bxs-chevron-right icon-right'></i>
        </a>
        <ul class="sidebar__menu-dropdown" :class="{ show: activeDropdown === item.name }">
          <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
            <RouterLink :to="subItem.link">{{ subItem.label }}</RouterLink>
          </li>
        </ul>
      </li>
      <li v-for="(item, index) in inquiryMenuItems" :key="index" :class="{ 'is-open': activeDropdown === item.name }">
        <a href="#" @click.prevent="toggleDropdown(item.name)">
          <i class='bx bx-edit icon'></i>{{ item.label }}
          <i class='bx bxs-chevron-right icon-right'></i>
        </a>
        <ul class="sidebar__menu-dropdown" :class="{ show: activeDropdown === item.name }">
          <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
            <RouterLink :to="subItem.link">{{ subItem.label }}</RouterLink>
          </li>
        </ul>
      </li>
      <li v-for="(item, index) in noticeMenuItems" :key="index" :class="{ 'is-open': activeDropdown === item.name }">
        <a href="#" @click.prevent="toggleDropdown(item.name)">
          <i class='bx bx-bell icon'></i>{{ item.label }}
          <i class='bx bxs-chevron-right icon-right'></i>
        </a>
        <ul class="sidebar__menu-dropdown" :class="{ show: activeDropdown === item.name }">
          <li v-for="(subItem, subIndex) in item.subItems" :key="subIndex">
            <RouterLink :to="subItem.link">{{ subItem.label }}</RouterLink>
          </li>
        </ul>
      </li>
    </ul>
    <div class="sidebar__profile">
      <div class="profile" ref="profile">
        <!-- <img src="/images/profile3.jpg" alt="프로필사진" ref="imgProfile" /> -->
        <img :src="profileUrl" alt="프로필이미지" ref="imgProfile" />
        <div class="profile__name" ref="nameProfile" @click="profileToggleDropdown">
          {{ currentNickname }}
          <ul 
            class="profile__link" 
            ref="dropdownProfile" 
            :class="{ show: profileDropdownVisible }">
            <li>
              <a @click="logoutHandler" href="#">
                <i class='bx bx-log-out'></i>
                로그아웃
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  </div>
  <!-- END SIDEBAR -->
</template>

<script setup>
import { jwtDecode } from 'jwt-decode';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { useAuthStore } from '~/stores/auth.js';

const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// SIDEBAR DROPDOWN ===========================
// dropdown status
const activeDropdown = ref(null);
const activeMenu = ref(null); // 현재 활성화된 메뉴 항목

// menu list toggle event
const memberMenuItems = [
  {
    name: 'user',
    label: '회원 관리',
    icon: ['far', 'user'],
    subItems: [{ label: '회원 목록', link: '/admin/member' }],
  },
];

const contentsMenuItems = [
  {
    name: 'contents',
    label: '컨텐츠 관리',
    icon: ['fas', 'inbox'],
    subItems: [
      { label: '팝업', link: '/admin/contents/popup' },
      { label: '콘서트', link: '/admin/contents/concert' },
      { label: '뮤지컬', link: '/admin/contents/musical' },
      { label: '전시회', link: '/admin/contents/exhibition' }
    ],
  },
];

// const feedMenuItems = [
//   {
//     name: 'feed',
//     label: '피드 관리',
//     icon: ['fat', 'list-alt'],
//     subItems: [
//       { label: '피드 관리', link: '/admin/feed' },
//       { label: '댓글 관리', link: '/admin/feed/comment' }
//     ],
//   },
// ];

// const reportMenuItems = [
//   {
//     name: 'report',
//     label: '신고 관리',
//     icon: ['fas', 'exclamation-triangle'],
//     subItems: [
//       { label: '피드 신고 내역', link: '/admin/reports/feed' },
//       { label: '댓글 신고 내역', link: '/admin/reports/comment' }
//     ],
//   },
// ];

const inquiryMenuItems = [
  {
    name: 'inquiry',
    label: '문의 관리',
    icon: ['far', 'edit'],
    subItems: [
      { label: '1:1 문의 내역', link: '/admin/inquiries/personal' },
      { label: '비즈니스 문의 내역', link: '/admin/inquiries/business' }
    ],
  },
];

const noticeMenuItems = [
  {
    name: 'notice',
    label: '공지 관리',
    icon: ['fas', 'volume-up'],
    subItems: [
    { label: '공지사항 관리', link: '/admin/notice' }
    ]
  }
]

const dataSyncMenuItems = [
  {
    name: 'dataSync',
    label: '데이터 관리',
    icon: ['fas', 'sync'],
    subItems: [
      { label: 'KOPIS 데이터 동기화', link: '/admin/kopis' }
    ]
  }
]

// dropdown toggle method
const toggleDropdown = (menuName) => {
  activeDropdown.value = activeDropdown.value === menuName ? null : menuName;
  console.log("사이드바 버튼 클릭됨");
};

const setActiveMenu = (menuName, subMenuName = null) => {
  activeMenu.value = subMenuName ? `${menuName} - ${subMenuName}` : menuName;
};



// PROFILE DROPDOWN
// const profile = ref(null);
const imgProfile = ref(null);
const nameProfile = ref(null);
const dropdownProfile = ref(null);
const profileDropdownVisible = ref(false);


// dropdown toggle method
const profileToggleDropdown = () => {
  profileDropdownVisible.value = !profileDropdownVisible.value;
};

const handleClickOutside = (e) => {
  const dropdownEl = dropdownProfile.value;
  const imgEl = imgProfile.value;
  const nameEl = nameProfile.value;

  if(!profileDropdownVisible.value) return;

  if(
    dropdownProfile.value?.contains(e.target) ||
    imgProfile.value?.contains(e.target) ||
    nameProfile.value?.contains(e.target)
  ) {
    return;
  }

  profileDropdownVisible.value = false;
}

// when component unmount remove event
onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

// 유저 정보 가져오기
const userDetails = useUserDetails(); 

const currentNickname = computed(() => {
  if(!userDetails.nickname.value && process.client) {
    const storedNickname = localStorage.getItem('nickname');
    if(storedNickname) return storedNickname;
  }
  return userDetails.nickname.value || '관리자';
});

const currentProfileImg = computed(() => {
  // userDetails.profileImg이 null이면 localStorage에서 직접 확인
  if (!userDetails.profileImg.value && process.client) {
    const storedProfileImg = localStorage.getItem("profile_img");
    if (storedProfileImg) return storedProfileImg;
  }
  return userDetails.profileImg.value || 'basic.png';
});

// 프로필 이미지 url 생성 함수
const profileUrl = computed(() => {
  if (currentProfileImg.value.startsWith('uploads/')) {
    return `${apiBase}/uploads/${currentProfileImg.value.substring('uploads/'.length)}`;
  } else {
    return `${apiBase}/uploads/images/user/basic.png`;
  }
});

// 로그아웃 처리
const logoutHandler = () => {
  if (process.client) {
    
    // AuthStore 인스턴스 생성
    const authStore = useAuthStore();

    userDetails.logout(); // userDetails 로그아웃
    authStore.logout(); // authStore 로그아웃
    
    // 로그인 페이지로 리디렉션
    window.location.href = 'http://localhost:3000/login';
  }
};

onMounted(() => {
  if (process.client) {
    // 사용자 정보 로드 시도
    userDetails.loadUserFromStorage();

    // 여전히 값이 없으면 직접 설정
    if (!userDetails.nickname.value && localStorage.getItem('nickname')) {
      userDetails.nickname.value = localStorage.getItem('nickname');
      console.log('직접 설정 후 nickname:', userDetails.nickname.value);
    }
    
    if (!userDetails.profileImg.value && localStorage.getItem('profile_img')) {
      userDetails.profileImg.value = localStorage.getItem('profile_img');
      console.log('직접 설정 후 profileImg:', userDetails.profileImg.value);
    }
  }
  
  window.addEventListener('click', handleClickOutside);
});

onMounted(() => {
  if (process.client) {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('토큰 전체 내용:', decoded);
        console.log('토큰에 nickname 키 존재:', 'nickname' in decoded);
        console.log('토큰에 profileImg 키 존재:', 'profileImg' in decoded);
        
        // 토큰에 키가 있지만 값이 없는 경우
        console.log('nickname 값:', decoded.nickname);
        console.log('profileImg 값:', decoded.profileImg);
      } catch (e) {
        console.error('토큰 디코딩 실패:', e);
      }
    }
  }
});

</script>
<style lang="css" scoped>
@import url("/public/css/admin/aside.css");

</style>