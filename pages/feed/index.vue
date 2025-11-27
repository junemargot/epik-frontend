<template>
  <section class="feed">
    <Button @click="handleCreateFeed" class="feed__floating-btn">
      <i class='bx bx-plus'></i>
    </Button>
    <div class="feed__header">
      <h1 class="feed__title">feed</h1>
      <form class="feed__form" @submit.prevent="handleSearch">
        <input class="feed__input" type="text" placeholder="검색어를 입력해주세요" />
        <label for="feed-search">
          <i class='bx bx-search'></i>
        </label>
        <input type="submit" value="submit" style="display: none;">
      </form>
    </div>

    <!-- 메뉴 -->
    <div class="feed__menu">
      <div class="feed__menu-column">
        <RouterLink to="/feed" exact :class="{ 'is-inactive': currentRoute !== '/feed' }">
          <span :class="{ 'is-active': currentRoute === '/feed' }">all</span>
        </RouterLink>
        <RouterLink to="/feed/my" exact :class="{ 'is-inactive': currentRoute !== '/feed/my' }">
          <span :class="{ 'is-active': currentRoute === '/feed/my' }">my</span>
        </RouterLink>
      </div>

      <!-- 카테고리 필터링 -->
      <div class="feed__menu-column">
        <span
          @click="filterByCategory('popup')"
          :class="{ 'is-active': selectedCategory === 1}"
          style="cursor: pointer"
        >Popup</span>
        <span
          @click="filterByCategory('concert')"
          :class="{ 'is-active': selectedCategory === 2}"
          style="cursor: pointer"
        >Concert</span>
        <span
          @click="filterByCategory('musical')"
          :class="{ 'is-active': selectedCategory === 3}"
          style="cursor: pointer"
        >Musical</span>
        <span
          @click="filterByCategory('exhibition')"
          :class="{ 'is-active': selectedCategory === 4}"
          style="cursor: pointer"
        >Exhibition</span>
      </div>
    </div>

    <!-- 피드 목록 -->
    <div class="feed__container">
      <div class="feed__info-wrap">
        <FeedItem 
          v-for="feed in feeds"
          :key="feed.feedId"
          :feed="feed"
          @delete="handleDeleteFeed"
          @update="handleUpdateFeed"
          @report="handleReportFeed"
        />
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="feed__loading">
      <p>로딩 중...</p>
    </div>

    <!-- 데이터가 없는 경우 -->
    <div v-if="feeds.length === 0 && !loading && feedStore.initialized" class="feed__empty">
      <p>등록된 피드가 없습니다.</p>
    </div>

    <!-- 무한 스크롤 끝 (데이터는 있지만 더 이상 불러올 데이터가 없을 경우) -->
    <div v-if="feeds.length > 0 && !hasMore && !loading" class="feed__no-more">
      <p>더 이상 피드가 없습니다.</p>
    </div>

    <!-- 신고 모달 (전역) -->
    <div class="modal-report" v-if="isReportModalOpen">
      <div class=" modal-report__contents">
        <h3 class="modal-report__title">신고하기</h3>
        <span class="modal-report__subtitle">신고 사유 선택</span>
        <form class="modal-report__form">
          <div class="modal-report__radio-group">
            <div class="modal-report__radio-item">
              <input type="radio" id="reason1" name="report-reason" value="욕설, 비방, 차별, 혐오" v-model="reportReason">
              <label for="reason1">욕설, 비방, 차별, 혐오</label>
            </div>
            <div class="modal-report__radio-item">
              <input type="radio" id="reason2" name="report-reason" value="홍보, 영리목적" v-model="reportReason">
              <label for="reason2">홍보, 영리목적</label>
            </div>
            <div class="modal-report__radio-item">
              <input type="radio" id="reason3" name="report-reason" value="불법 정보" v-model="reportReason">
              <label for="reason3">불법 정보</label>
            </div>
            <div class="modal-report__radio-item">
              <input type="radio" id="reason4" name="report-reason" value="음란, 청소년 유해" v-model="reportReason">
              <label for="reason4">음란, 청소년 유해</label>
            </div>
            <div class="modal-report__radio-item">
              <input type="radio" id="reason5" name="report-reason" value="개인 정보 유출, 유포, 거래" v-model="reportReason">
              <label for="reason5">개인 정보 유출, 유포, 거래</label>
            </div>
            <div class="modal-report__radio-item">
              <input type="radio" id="reason6" name="report-reason" value="도배, 스팸" v-model="reportReason">
              <label for="reason6">도배, 스팸</label>
            </div>
            <div class="modal-report__radio-item">
              <input class="report-reason" type="radio" id="reason7" name="report-reason" value="기타" v-model="reportReason">
              <label for="reason7">기타</label>
            </div>
            <div class="modal-report__text-input" v-if="reportReason === '기타'">
              <textarea 
                v-model="reportDetail"
                placeholder="신고 사유를 직접 입력해주세요.(최대 500자)"
                maxlength="500"
              ></textarea>
            </div>
          </div>
          <p class="modal-report__warning">
            신고가 허위 또는 악의적인 목적으로 판단될 경우,<br />
            운영 정책에 따라 신고자의 활동이 제한될 수 있습니다.<br />
            정확한 내용을 바탕으로 신고해 주시기 바랍니다.
          </p>
          <div class="modal-report__buttons">
            <button type="button" class="modal-report__cancel" @click="closeReportModal">취소</button>
            <button type="button" class="modal-report__check" @click.stop="confirmReport">확인</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 신고 확인 모달 -->
    <div class="modal-check" v-if="isReportCheckModalOpen">
      <div class="modal-check__contents">
        <h2 class="modal-check__title">신고가 접수되었습니다.</h2>
        <p class="modal-check__text">
          신고 내용이 정상적으로 접수되었습니다.<br />
          보내주신 내용은 운영팀에서 확인 후 규정에 따라 처리될 예정입니다.<br />
          처리에 다소 시간이 소요될 수 있는 점 양해 부탁드립니다.
        </p>
        <button class="modal-check__close" @click.stop="closeReportCheckModal">확인</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FeedItem from '~/components/feed/FeedItem.vue';
import { useFeedStore } from '~/stores/feed';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const router = useRouter();
const currentRoute = computed(() => route.path);
const feedStore = useFeedStore();
const authStore = useAuthStore();

// computed로 store 상태 참조
const feeds = computed(() => feedStore.feeds);
const loading = computed(() => feedStore.loading);
const hasMore = computed(() => feedStore.hasMore);

// 상태
const selectedCategory = ref(null);
const searchKeyword = ref('');

// 카테고리 매핑
const categoryMapping = {
  'popup': 1,
  'concert': 2,
  'musical': 3,
  'exhibition': 4
}

// 카테고리 필터링
const filterByCategory = (category) => {
  selectedCategory.value = categoryMapping[category];
  feedStore.resetFeeds();
  feedStore.fetchFeeds(selectedCategory.value);
};

const handleCreateFeed = () => {
  if(!authStore.isAuthenticated) {
    const confirmed = confirm("로그인이 필요한 기능입니다. \n로그인 페이지로 이동하시겠습니까?");
    if(confirmed) {
      router.push('/login');
    }
    return;
  }

  router.push('/feed/reg');
};

const handleSearch = () => {
  // TODO: 검색 API 구현 필요
  console.log('검색: ', searchKeyword.value);
}

const handleDeleteFeed = async (feedId) => {
  // TODO: 피드 삭제 API 호출
  console.log('피드 삭제: ', feedId);
  // 성공 시 목록에서 제거
  feedStore.feeds = feedStore.feeds.filter(f => f.feedId !== feedId);
}

const handleUpdateFeed = async (feedId) => {
  // TODO: 피드 수정 로직
  console.log('Update feed:', feedId)
}

// 무한 스크롤 핸들러
const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if(scrollTop + clientHeight >= scrollHeight - 100 && !loading.value && hasMore.value) {
    feedStore.fetchFeeds(selectedCategory.value);
  }
}

// ===== 신고 모달 =====
const isReportModalOpen = ref(false);
const isReportCheckModalOpen = ref(false);
const reportReason = ref('');
const reportDetail = ref('');
const reportingFeedId = ref(null);

const handleReportFeed = (feedId) => {
  reportingFeedId.value = feedId;
  openReportModal();
};

const openReportModal = () => {
  isReportModalOpen.value = true;
};

const closeReportModal = () => {
  isReportModalOpen.value = false;
  reportReason.value = '';
  reportDetail.value = '';
  reportingFeedId.value = null;
};

const confirmReport = async () => {
  if (!reportReason.value) {
    alert("신고 사유를 선택해주세요.");
    return;
  }

  if(reportReason.value === '기타' && !reportDetail.value) {
    alert("신고 사유를 입력해주세요.");
    return;
  }

  try {
    const response = await useAuthFetch(`/feed/${reportingFeedId.value}/report`, {
      method: 'POST',
      body: {
        reason: reportReason.value,
        detail: reportDetail.value || ''
      }
    });

    if(response.error.value) {
      throw new Error("신고 실패");
    }
    
    console.log("신고 완료, 모달 닫기");
    closeReportModal();

    console.log("신고 완료 모달 열기");
    isReportCheckModalOpen.value = true;
    console.log('isReportCheckModalOpen: ', isReportCheckModalOpen.value);

  } catch (error) {
    console.error("신고 실패: ", error);
    alert("신고 처리 중 오류가 발생했습니다.");
  }
};

const closeReportCheckModal = () => {
  isReportCheckModalOpen.value = false;
};


// ######### hook ######### 
onMounted(() => {
  console.log('📌 onMounted 실행');
  feedStore.loadFromStorage();

  if(feedStore.feeds.length === 0) {
    feedStore.fetchFeeds();
  };

  window.addEventListener('scroll', handleScroll);

  watch(feeds, (newFeeds) => {
    console.log('📌 feeds 업데이트:', newFeeds);
    console.log('📌 feeds 길이:', newFeeds.length);
  });
});



onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
});

</script>
<style scoped>
@import url('public/css/feed/index.css');
@import url('public/css/feed/report-modal.css');
@import url('public/css/feed/check-report-modal.css');

</style>