<template>
  <section class="feed">
    <div class="feed__header"> <!-- 맨 첫 줄-->
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
      <!-- </div> -->
    </div>

    <div class="feed__menu"> <!--메뉴버튼 줄-->
      <div class="feed__menu-column">
        <RouterLink to="/feed" exact>
          <span>all</span>
        </RouterLink>
        <RouterLink to="/feed/my" exact>
          <span>my</span>
        </RouterLink>
      </div>

      <div class="feed__menu-column">
        <span 
          @click="filterByCategory(null)" 
          :class="{ 'is-active': selectedCategory === null }"
          style="cursor: pointer"
        >all</span>
        <span 
          @click="filterByCategory('popup')" 
          :class="{ 'is-active': selectedCategory === 1 }"
          style="cursor: pointer"
        >pop-up</span>
        <span 
          @click="filterByCategory('concert')" 
          :class="{ 'is-active': selectedCategory === 2 }"
          style="cursor: pointer"
        >concert</span>
        <span 
          @click="filterByCategory('musical')" 
          :class="{ 'is-active': selectedCategory === 3 }"
          style="cursor: pointer"
        >musical</span>
        <span 
          @click="filterByCategory('exhibition')" 
          :class="{ 'is-active': selectedCategory === 4 }"
          style="cursor: pointer"
        >exhibition</span>
      </div>
    </div>

    <!-- 새로운 영역(좋아요) -->
    <div class="my-feed__wrap">
      <div class="my-feed__header">
        <div class="my-feed__likes">
          <i class='bx bx-heart'></i>
          <span>좋아요</span>
        </div>
        <div class="my-feed__sort">
          <select @change="changeSortOrder" v-model="sortOrder">
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>
      </div>

      <!-- 데이터 바인딩 -->
      <div class="my-feed__container">
        <div v-for="feed in likedFeeds" :key="feed.id" class="my-feed__item">
          <a @click="() => router.push(`/feed/${feed.id}`)">
            <img v-if="feed.images && feed.images.length > 0" :src="feed.images[0].imagePath" :alt="feed.content">
          </a>
        </div>
      </div>

      <!-- 빈 상태 표시 -->
      <div v-if="likedFeeds.length === 0 && !loading" class="my-feed__empty">
        <div class="my-feed__empty-icon">
          <i class='bx bx-heart my-feed__icon-location'></i>
        </div>
        <span>좋아요한 게시물이 없습니다</span>
      </div>
    </div>
  </section><!-- section end -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 좋아요한 피드 조회
const likedFeeds = ref([]);
const loading = ref(false);
const sortOrder = ref('latest'); // 최신순, 오래된순
const selectedCategory = ref(null);

const categoryMapping = {
  'popup': 1,
  'concert': 2,
  'musical': 3,
  'exhibition': 4
};

const fetchLikedFeeds = async () => {
  loading.value = true;
  try {
    // 카테고리 파라미터
    let url = `/feed/liked?sort=${sortOrder.value}`;
    if(selectedCategory.value) {
      url += `&categoryId=${selectedCategory.value}`;
    }

    // TODO: 백엔드 GET /api/v1/feed/liked API 추가 필요
    const { data } = await useAuthFetch(url);
    likedFeeds.value = data.value || [];
  } catch(error) {
    console.error("좋아요한 피드 조회 실패: ", error);
  } finally {
    loading.value = false;
  }
};

const changeSortOrder = (event) => {
  sortOrder.value = event.target.value;
  fetchLikedFeeds();
};

const filterByCategory = (category) => {
  selectedCategory.value = category ? categoryMapping[category] : null;
  fetchLikedFeeds();
};

onMounted(() => {
  fetchLikedFeeds();
});

</script>

<style scoped>
@import url('public/css/feed/index.css');
@import url('public/css/feed/my.css');

.my-feed__header {
  display: flex;
  justify-content: space-between;
  margin: 18px 0;
  align-items: center;
}

.my-feed__likes span {
  font-family: 'pretendard-semibold';
}

.my-feed__sort select {
  border-radius: 10px;
  width: 96px;
  height: 26px;
  padding: 0 8px;
}
</style>