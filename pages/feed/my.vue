<template>
  <section class="feed">
    <div class="feed__header">
      <h1 class="feed__title">feed</h1>
      <!-- 검색창 -->
      <!-- <div class="feed__search"> -->
      <form class="feed__form">
        <input class="feed__input" id="feed-search" type="text" placeholder="검색어를 입력해주세요">
        <label for="feed-search">
          <i class="fa-solid fa-magnifying-glass"></i>
        </label>
        <input type="submit" value="submit" style="display: none;">
      </form>
    </div>

    <div class="feed__menu"> <!--메뉴버튼 줄-->
      <div class="feed__menu-column">
        <RouterLink to="/feed" exact :class="{'is-inactive': currentRoute !== '/feed'}">
          <span :class="{'is-active': currentRoute === '/feed'}">all</span>
        </RouterLink>
        <RouterLink to="/feed/my" exact :class="{'is-inactive': currentRoute !== '/feed/my'}">
          <span :class="{'is-active': currentRoute === '/feed/my'}">my</span>
        </RouterLink>
      </div>

      <div class="feed__menu-column">
        <span 
          @click="filterByCategory(null)" 
          :class="{ 'is-active': selectedCategory === null }"
          style="cursor: pointer"
        >All</span>
        <span 
          @click="filterByCategory('popup')" 
          :class="{ 'is-active': selectedCategory === 1 }"
          style="cursor: pointer"
        >Popup</span>
        <span 
          @click="filterByCategory('concert')" 
          :class="{ 'is-active': selectedCategory === 2 }"
          style="cursor: pointer"
        >Concert</span>
        <span 
          @click="filterByCategory('musical')" 
          :class="{ 'is-active': selectedCategory === 3 }"
          style="cursor: pointer"
        >Musical</span>
        <span 
          @click="filterByCategory('exhibition')" 
          :class="{ 'is-active': selectedCategory === 4 }"
          style="cursor: pointer"
        >Exhibition</span>
      </div>
    </div>

    <!-- 새로운 영역 시작 -->
    <div class="my-feed__wrap">
      <div class="my-feed__profile">
        <img 
          class="my-feed__user-image"
          :src="profileImageUrl"
          :alt="userNickname"
          @error="handleImageError"
        />
        <div class="my-feed__info">
          <span class="my-feed__user-name">{{ userNickname }}</span>
        </div>
      </div>  

      <!-- 버튼 -->
      <div class="my-feed__buttons">
        <RouterLink to="/mypage/info/modify" class="my-feed__profile-edit">프로필 편집</RouterLink>
        <div class="my-feed__dropdown">
          <button class="my-feed__options" @click="toggleMyDropdown">
            <i class='bx bx-dots-horizontal-rounded'></i>
          </button>
          <ul class="dropdown-list myfeed-dropdown-list" v-if="isMyDropdownOpen">
            <li>
              <RouterLink to="/feed/reg">피드 작성</RouterLink>
            </li>
            <li>
              <RouterLink to="/feed/like">좋아요한 피드</RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- 사진 영역 - API 데이터 바인딩 -->
      <div class="my-feed__container">
        <div v-for="feed in myFeeds" :key="feed.id" class="my-feed__item">
          <a @click="() => router.push(`/feed/${feed.id}`)">
            <img 
              v-if="feed.images && feed.images.length > 0" 
              :src="`${apiBase}${feed.images[0].imagePath}`"
              :alt="feed.content"
            />
          </a>
        </div>
      </div>

      <!-- 빈 피드 표시 -->
      <div v-if="myFeeds.length === 0 && !loading" class="my-feed__empty">
        <div class="my-feed__empty-icon">
          <i class='bx bx-camera my-feed__icon-location'></i>
        </div>
        <span>게시물 없음</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth.js';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const currentRoute = computed(() => route.path);
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// 마이 피드 조회
const myFeeds = ref([]);
const loading = ref(false);
const isMyDropdownOpen = ref(false);
const selectedCategory = ref(null);

const categoryMapping = {
  'popup': 1,
  'concert': 2,
  'musical': 3,
  'exhibition': 4
};

const profileImageUrl = computed(() => {
  return authStore.profileImageUrl;
});

const handleImageError = (e) => {
  e.target.src = `${apiBase}/uploads/images/user/basic.png`;
  console.error("프로필 이미지 로드 실패, 기본 이미지로 대체");
}

const userNickname = computed(() => {
  return user.value.nickname || '사용자';
});

const fetchMyFeeds = async () => {
  loading.value = true;
  try {
    let url = '/feed/my';
    if(selectedCategory.value) {
      url += `?categoryId=${selectedCategory.value}`;
    }

    const { data } = await useAuthFetch(url);
    myFeeds.value = data.value || [];

  } catch(error) {
    console.error("마이 피드 조회 실패: ", error);
  
  } finally {
    loading.value = false;
  }
};

const filterByCategory = (category) => {
  selectedCategory.value = category ? categoryMapping[category] : null;
  fetchMyFeeds();
};

const toggleMyDropdown = (event) => {
  event.stopPropagation();  // 이벤트 전파 방지
  isMyDropdownOpen.value = !isMyDropdownOpen.value;
};

const handleOutsideClick = (event) => {
  const dropdown = document.querySelector('.my-feed__dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    isMyDropdownOpen.value = false;
  }
};

onMounted(() => {
  if (!authStore.isLoggedIn) {
    navigateTo('/login');
    return;
  }

  fetchMyFeeds();
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

</script>

<style scoped>
@import url('public/css/feed/index.css');
@import url('public/css/feed/my.css');
</style>