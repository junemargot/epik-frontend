<template>
  <div class="wrap" v-if="musical">
    <!-- section 1 -->
    <div class="event">
      <EventHeader 
        :title="musical.title"
        :is-bookmarked="isBookmarked"
        @notification-click="handleNotification"
        @toggle-bookmark="handleBookmark"
      />

      <!-- 맨 위로 버튼 -->
      <button id="go-top" class="hidden">
        <i class="bx bx-chevron-up"></i> TOP
      </button>

      <!-- section 2 -->
      <main>
        <EventInfo 
          :image-url="getImageUrl(musical)" 
          :image-alt="`${musical.title} 포스터`" 
          :venue="musical.venue"
          :running-time="musical.runningTime" 
          :start-date="musical.startDate" 
          :end-date="musical.endDate"
          :age-restriction="musical.ageRestriction" 
          :ticket-prices="musical.ticketPrices"
          :ticket-offices="musical.ticketOffices" 
          :address="musical.address" 
          :facility-name="musical.facilityName"
          :facility-tel="musical.facilityTel" 
          :facility-url="musical.facilityUrl" 
        />

        <!-- section 3 -->
        <EventIntro 
          title="뮤지컬" 
          :content="musical.content" 
          :youtube-url="musical.youtubeUrl"
          :images="musical.musicalImages"
        />

        <!-- section 4 -->
        <!-- <EventLocation 
          :address="musical.address"
          :venue-name="musical.venue"
        /> -->
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, nextTick } from 'vue';
import { useRoute, useRouter} from 'vue-router';
import EventHeader from '~/components/event/EventHeader.vue';
import EventInfo from '~/components/event/EventInfo.vue';
import EventIntro from '~/components/event/EventIntro.vue';
import EventLocation from '~/components/event/EventLocation.vue';

// 라우터 및 환경 변수 설정
const route = useRoute();
const router = useRouter();
const musicalId = route.params.id;
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 북마크 composable 사용
const { getBookmarkStatus, toggleBookmark } = useBookmark('musical');

// 상태 관리 위한 ref 선언
const musical = ref(null);
const isBookmarked = ref(false);
const isAuthenticated = ref(false);

// 데이터 가져오기
watchEffect(async () => {
  const { data } = await useFetch(`/admin/musical/${musicalId}`, {
    baseURL: apiBase,
    key: `musical-${musicalId}`,
  });

  if (data.value) {
    musical.value = data.value;
    console.log("뮤지컬 데이터 로드됨:", musical.value);
  }
});

// 북마크 상태 초기화
onMounted(async() => {
  try {
    const status = await getBookmarkStatus(musicalId);
    console.log("북마크 상태 응답: ", status);

    isBookmarked.value = status.isBookmarked;
    isAuthenticated.value = status.authenticated;
    
  } catch(error) {
    console.error("onMounted 에러: ", error);
  }
});

// 이벤트 핸들러 추가
function handleNotification() {
  console.log('알림 설정');
}

// 북마크 핸들러
async function handleBookmark() {
  const result = await toggleBookmark(musicalId);
  if(result.needLogin) {
    const shouldLogin = confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?');
    if(shouldLogin) {
      sessionStorage.setItem('redirectUrl', route.fullPath);
      router.push('/login');
    }
    return;
  }

  if(result.success) {
    // 상태 업데이트
    isBookmarked.value = result.isBookmarked;
    await nextTick();
    // alert(result.message);
  } else {
    alert(result.message || '북마크 처리 중 오류가 발생했습니다.');
  }
}

// 이미지 URL 동적 생성 함수
const getImageUrl = (musical) => {
  if (!musical) return null;

  // KOPIS API 데이터인 경우
  if (musical.dataSource === 'KOPIS_API') {
    // imageUrl이 있으면 그것을 사용 (KOPIS API에서 제공하는 포스터 URL)
    if (musical.imageUrl) {
      return musical.imageUrl;
    }

    // imageUrl이 없으면 saveImageName이 HTTP URL인 경우
    if (musical.saveImageName && musical.saveImageName.startsWith('http')) {
      return musical.saveImageName;
    }
  }

  // 수기 데이터이거나 로컬 이미지인 경우
  if (musical.saveImageName && !musical.saveImageName.startsWith('http')) {
    return `http://localhost:8081/api/v1/uploads/images/musical/${musical.saveImageName}`;
  }

  return null;
};

// 이미지 로드 에러 처리
const handleImageError = (event) => {
  console.warn('이미지 로드 실패:', event.target.src);
  // 기본 이미지로 대체하거나 숨김 처리
  event.target.style.display = 'none';
};
</script>

<style lang="css" scoped>
@import url('/public/css/components/event.css');
</style>
