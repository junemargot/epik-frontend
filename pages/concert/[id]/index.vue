<template>
  <div class="wrap" v-if="concert">
    <!-- section 1 -->
    <div class="event">
      <EventHeader
        :title="concert.title"
        :is-bookmarked="isBookmarked"
        @notification-click="handleNotification"
        @toggle-bookmark="handleBookmark"
      />

      <!-- 맨 위로 버튼 -->
      <button id="go-top" class="hidden">
        <i class='bx bx-chevron-up'></i> TOP
      </button>

      <!-- section 2 -->
      <main>
        <EventInfo
          :image-url="getImageUrl(concert)"
          :image-alt="`${concert.title} 포스터`"
          :venue="concert.venue"
          :running-time="concert.runningTime"
          :start-date="concert.startDate"
          :end-date="concert.endDate"
          :age-restriction="concert.ageRestriction"
          :ticket-prices="concert.ticketPrices"
          :ticket-offices="concert.ticketOffices"
          :address="concert.address"
          :facility-name="concert.facilityName"
          :facility-tel="concert.facilityTel"
          :facility-url="concert.facilityUrl"
        />

        <!-- section 3 -->
        <EventIntro
          title="콘서트"
          :content="concert.content"
          :youtube-url="concert.youtubeUrl"
          :images="concert.concertImages"
        />

        <!-- section 4 -->
        <!-- <EventLocation 
          :address="concert.address"
          :venue-name="concert.venue"
        /> -->
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import EventHeader from "~/components/event/EventHeader.vue";
import EventInfo from "~/components/event/EventInfo.vue";
import EventIntro from "~/components/event/EventIntro.vue";
import EventLocation from "~/components/event/EventLocation.vue";

const route = useRoute();
const router = useRouter();
const concertId = route.params.id;
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 북마크 composable 사용
const { getBookmarkStatus, toggleBookmark } = useBookmark('concert');

// 상태 관리 위한 ref 선언
const concert = ref(null);
const isBookmarked = ref(false);
const isAuthenticated = ref(false);

// 데이터 가져오기
watchEffect(async () => {
	const { data } = await useFetch(`/admin/concert/${concertId}`, {
		baseURL: apiBase,
		key: `concert-${concertId}`,
	});

	if (data.value) {
		concert.value = data.value;
		console.log("콘서트 데이터 로드됨:", concert.value);
	}
});

// 북마크 상태 초기화
onMounted(async() => {
  try {
    const status = await getBookmarkStatus(concertId);
    console.log("북마크 상태 응답: ", status);
    
    isBookmarked.value = status.isBookmarked;
    isAuthenticated.value = status.authenticated;

  } catch(error) {
    console.error("onMounted 에러: ", error);
  }
});

// 이벤트 핸들러 추가
function handleNotification() {
	console.log("알림 설정");
}

// 북마크 핸들러
async function handleBookmark() {
  const result = await toggleBookmark(concertId);
  if(result.needLogin) {
    const shouldLogin = confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?');
    if(shouldLogin) {
      router.push('/login');
    }
    return;
  }

  if(result.success) {
    console.log("북마크 상태 업데이트 전: ", isBookmarked.value);

    // 상태 업데이트
    isBookmarked.value = result.isBookmarked;
    console.log("북마크 상태 업데이트 후: ", isBookmarked.value);

    // nextTick을 사용하여 DOM 업데이트
    await nextTick();
    alert(result.message);
  } else {
    alert(result.message || '북마크 처리 중 오류가 발생했습니다.');
  }
}

// 이미지 URL 동적 생성 함수
const getImageUrl = (concert) => {
	if (!concert) return null;

	// KOPIS API 데이터인 경우
	if (concert.dataSource === "KOPIS_API") {
		// imageUrl이 있으면 그것을 사용 (KOPIS API에서 제공하는 포스터 URL)
		if (concert.imageUrl) {
			return concert.imageUrl;
		}

		// imageUrl이 없으면 saveImageName이 HTTP URL인 경우
		if (concert.saveImageName && concert.saveImageName.startsWith("http")) {
			return concert.saveImageName;
		}
	}

	// 수기 데이터이거나 로컬 이미지인 경우
	if (concert.saveImageName && !concert.saveImageName.startsWith("http")) {
		return `http://localhost:8081/api/v1/uploads/images/concert/${concert.saveImageName}`;
	}

	return null;
};

// 이미지 로드 에러 처리
const handleImageError = (event) => {
	console.warn("이미지 로드 실패:", event.target.src);
	// 기본 이미지로 대체하거나 숨김 처리
	event.target.style.display = "none";
};
</script>

<style scoped>
@import url('/public/css/components/event.css');
</style>
