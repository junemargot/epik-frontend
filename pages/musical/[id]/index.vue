<template>
  <div class="wrap" v-if="musical">
    <!-- section 1 -->
    <div class="event">
      <EventHeader 
        :title="musical.title"
        @notification-click="handleNotification"
        @bookmark-click="handleBookmark"
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
        <EventIntro title="뮤지컬" :content="musical.content" :youtube-url="musical.youtubeUrl"
          :images="musical.musicalImages" />

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
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import EventHeader from '~/components/event/EventHeader.vue';
import EventInfo from '~/components/event/EventInfo.vue';
import EventIntro from '~/components/event/EventIntro.vue';
import EventLocation from '~/components/event/EventLocation.vue';

// 라우터 및 환경 변수 설정
const route = useRoute();
const musicalId = route.params.id;

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 상태 관리 위한 ref 선언
const musical = ref(null);

// 데이터 가져오기
watchEffect(async () => {
  const { data } = await useFetch(`/admin/musical/${musicalId}`, {
    baseURL: apiBase,
    key: `musical-${musicalId}`,
  });

  if (data.value) {
    musical.value = data.value;
  }
});

// 이벤트 핸들러 추가
function handleNotification() {
  console.log('알림 설정');
}

function handleBookmark() {
  console.log('북마크 설정');
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
