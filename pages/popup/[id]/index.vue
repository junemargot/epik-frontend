<!-- popup/[id]/-->
<template>
  <main class="popup__wrap">
    <section class="popup__infomation">
      <div class="popup__information-inner">
        <ClientOnly>
        <div class="popup-info__slider">
          <div class="popup-info__slides" ref="slideContainer">
            <img class="popup-info__slide" 
              v-for="(imageName, index) in popup?.saveImageNames" 
              :key="index"
              :src="`http://localhost:8081/api/v1/uploads/images/popup/${imageName}`" 
              :alt="`이미지 #${index + 1}`" 
              @load="onImageLoad(index)"  
            />
          </div>
          <a class="popup-info__prev" :class="{ disabled: !canGoPrev }" @click="prevSlide">
            <i class='bx bx-chevron-left'></i>
          </a>
          <a class="popup-info__next" :class="{ disabled: !canGoNext }" @click="nextSlide">
            <i class='bx bx-chevron-right'></i>
          </a>
        </div>
        </ClientOnly>
        <!-- POPUP DETAILS -->
        <div class="popup__details">
          <div class="">
            <div class="popup__title-wrapper">
              <h1 class="popup__title">{{ popup?.title }}</h1>
              <button
                @click="handleBookmark"
                class="popup__bookmark-btn"
                :class="{ 'bookmarked': isBookmarked }"
                :title="isBookmarked ? '북마크 제거' : '북마크 추가'"
              >
                <i :class="isBookmarked ? 'bx bxs-bookmark' : 'bx bx-bookmark'"></i>
              </button>
            </div>
            <div class="popup__address">
              <i class='bx bx-map'></i>
              <span>{{ popup?.address }}</span>
            </div>
            <div class="popup__date">
              <i class='bx bx-calendar'></i>
              <span name="startDate">{{ formatDate(popup?.startDate) }}</span>
              <span>~</span>
              <span name="endDate">{{ formatDate(popup?.endDate) }}</span>
            </div>
            <div class="popup__tags">
              <span v-for="(tag, index) in popup?.tags" :key="index" class="popup__tag">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- <div class="popup__links">
            <a href="#" class="popup__icon-link" @click.prevent="clickBookmark">
              <i :class="['icon', isBookmark ? 'bx bxs-bookmark' : 'bx bx-bookmark', { bookmarkCheck: isBookmark }]"></i>
              <span>북마크</span>
            </a>
          </div> -->
        </div>
        <!-- END POPUP DETAILS -->
      </div>
      <!-- END POPUP INFORMATION INNER -->
    </section>

    <!-- section 2 -->
    <div class="popup__description popup__information-inner" v-html="popup?.content"></div>

    <!-- section 3 -->
    <section class="popup__addinfo popup__information-inner">
      <!-- 카카오맵 지도 API -->
      <div id="kakao-map" style="width: 100%; height: 400px;"></div>

      <div class="popup__location-box">
        <div class="popup__location-address">
          <span>{{ popup?.addressDetail }}</span>
          <button class="copy-btn" @click="copyAddress">주소복사</button>
        </div>

        <div class="popup__location-link" @click="openLink(popup?.snsLink)">
          <a :href="popup?.snsLink" class="popup__sns-link" target="_blank">
            <span>SNS 바로가기</span>
          </a>
          <i class='bx bx-chevron-right'></i>
        </div>

        <div class="popup__location-link" @click="openLink(popup?.webLink)">
          <a :href="popup?.webLink" class="popup__sns-link" target="_blank">
            <span>브랜드 홈페이지 바로가기</span>
          </a>
          <i class='bx bx-chevron-right'></i>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from 'nuxt/app';
import { useFetch } from '#app';

const route = useRoute();
const router = useRouter();
const popupId = route.params.id;
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const kakaoMapApiKey = config.public.kakaoMapApiKey; // 환경변수에서 API_KEY 로드
const { getBookmarkStatus, toggleBookmark } = useBookmark('popup');

// 카카오맵 관련
let kakaoMap;
let kakaoMarker;

// 북마크 상태 관리
const isBookmarked = ref(false);
const isAuthenticated = ref(false);

// 슬라이드 인덱스 & 상태 관리
const currentIdx = ref(0);
const slideWidth = ref(0);
const slideContainer = ref(null);
const slides = ref([]);
const imagesLoaded = ref(false);
const canGoPrev = ref(false);
const canGoNext = ref(false);

const totalImages = ref(0);
const loadedImages = ref(0);

// 한 화면에 보여질 슬라이드 개수
const slidesPerView = computed(() => {
  if(process.client && typeof window !== 'undefined') {
    if(window.innerWidth <= 768) return 1;
    return 2;
  }
  return 2;
});

function onImageLoad(index) {
  loadedImages.value++;
  console.log(`Image ${index} loaded. ${loadedImages.value}/${totalImages.value}`);

  if(loadedImages.value === totalImages.value && totalImages.value > 0) {
    initializeSlider();
  }
}

// 슬라이드 버튼 활성화 로직
function updateSlideControls() {
  if(!slides.value.length) return;

  const total = slides.value.length;
  // const maxSlideIdx = Math.max(0, total - slidesPerView);
  const maxSlideIdx = Math.max(0, total - slidesPerView.value);

  canGoPrev.value = currentIdx.value > 0;
  canGoNext.value = currentIdx.value < maxSlideIdx;

  console.log(`슬라이드 상태 업데이트: 현재=${currentIdx.value}, 전체=${total}, slidesPerView=${slidesPerView.value}, maxIdx=${maxSlideIdx}, 이전=${canGoPrev.value}, 다음=${canGoNext.value}`);
};

// 이미지 로드 확인
function checkImagesLoaded() {
  const images = Array.from(document.querySelectorAll('.popup-info__slide'));
  console.log('슬라이드 이미지 개수: ', images.length);
  
  if (!images.length) {
    // 이미지가 0개면, imagesLoaded 바로 true로 세팅 (혹은 그대로 false로 두고 빈슬라이더 표시)
    imagesLoaded.value = false;
    console.log('이미지가 없습니다.');

    return;
  }

  // 이미지가 이미 모두 로드되었는지 확인
  const allLoaded = images.every(img => img.complete);
  if(allLoaded) {
    console.log('모든 이미지가 이미 로드되었습니다.');
    imagesLoaded.value = true;
    initializeSlider();
    return;
  }

  // 이미지 로드 이벤트 처리
  let loadedCount = 0;
  const imageLoaded = () => {
    loadedCount++;
    console.log('로딩완료', loadedCount, '/', images.length);
    if (loadedCount === images.length) {
      console.log('모든 이미지 로드 완료')
      imagesLoaded.value = true;
      initializeSlider();
    }
  };

  images.forEach((img) => {
    if (img.complete) {
      imageLoaded();
    } else {
      img.addEventListener('load', imageLoaded);
      img.addEventListener('error', imageLoaded);
    }
  });
}

// 슬라이더 초기화
function initializeSlider() {
  nextTick(() => {
    slideContainer.value = document.querySelector('.popup-info__slides');
    slides.value = Array.from(document.querySelectorAll('.popup-info__slide')); // 원본 슬라이드만 추출

    // 슬라이드가 없으면 좋료
    if(slides.value.length === 0) {
      console.log('슬라이드가 없습니다.');
      return;
    }

    const firstSlide = slides.value[0];
    const img = firstSlide.querySelector('img') || firstSlide;

    if(img.complete || firstSlide.offsetWidth > 0) {
      slideWidth.value = firstSlide.offsetWidth;
      console.log('실제 슬라이드 너비: ', slideWidth.value);
      setupSlider();
    } else {
      // 이미지 로드 대기
      img.onload = () => {
        slideWidth.value = firstSlide.offsetWidth;
        console.log("이미지 로드 후 슬라이드 너비: ", slideWidth.value);
        setupSlider();
      };
      return; // 이미지 로드 대기
    }
  });
}

 // 슬라이더 설정을 별도 함수로 분리
function setupSlider() {
  if (!slideContainer.value || !slides.value.length) return;
  
  const totalWidth = slideWidth.value * slides.value.length;
  slideContainer.value.style.width = `${totalWidth}px`;

  // 초기 위치 설정
  currentIdx.value = 0;
  slideContainer.value.style.transform = `translateX(0px)`;

  updateSlideControls();

  console.log(`슬라이더 초기화 완료: ${slides.value.length}개, 슬라이드 너비: ${slideWidth.value}px, 총 너비: ${totalWidth}px`);
}

// 슬라이드 이동 함수
function moveSlide(num) {
  if (!slideContainer.value || !slides.value.length) return;
  
  // 인덱스 범위 제한
  const maxIndex = Math.max(0, slides.value.length - slidesPerView.value);
  currentIdx.value = Math.max(0, Math.min(num, maxIndex));
  
  // 실제 이
  const translateX = currentIdx.value * slideWidth.value
  slideContainer.value.style.transform = `translateX(-${translateX}px)`;
  
  console.log(`슬라이드 이동: ${currentIdx.value}/${maxIndex}, 변환: -${translateX}px`);
  
  // 상태 업데이트
  updateSlideControls();
}

function prevSlide() {
  moveSlide(currentIdx.value - 1);
}

function nextSlide() {
  moveSlide(currentIdx.value + 1);
}

// 데이터 가져오기
const popup = ref(null);
const { data, error } = await useFetch(`/admin/popup/${popupId}`, {
  baseURL: apiBase,
  key: `popup-${popupId}`,
  server: true,  // SSR에서 동작 보장
  lazy: false    // 바로 fetch
});

// fetch 성공 시 이미지 로드 감지 -> 슬라이더 셋업
watchEffect(() => {
  if (data.value && data.value.saveImageNames) {
    popup.value = data.value;
    totalImages.value = popup.value.saveImageNames?.length || 0;
    loadedImages.value = 0; // reset counter

    nextTick(() => {
      checkImagesLoaded(); // 이미지 로드 이후에 슬라이더 초기화
    });

  } else if (error.value) {
    console.error('Failed to fetch popup data:', error.value);
  }
});

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '');
}

// 주소 복사 
function copyAddress() {
  const fullAddress = `${popup.value?.address} ${popup.value?.addressDetail || ''}`.trim();
  navigator.clipboard.writeText(fullAddress).then(() => {
    alert('주소가 복사되었습니다.');
  });
}

// 외부 링크 열기
function openLink(url) {
  if (!url) return;
  window.open(url, '_blank');
}

// 북마크 핸들러
async function handleBookmark() {
  const result = await toggleBookmark(popupId);
  if(result.needLogin) {
    const shouldLogin = confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?');
    if(shouldLogin) {
      sessionStorage.setItem('redirectUrl', route.fullPath);
      router.push('/login');
    }
    return;
  }

  if(result.success) {
    console.log('북마크 상태 업데이트 전: ', isBookmarked.value);
    isBookmarked.value = result.isBookmarked;
    console.log('북마크 상태 업데이트 후: ', isBookmarked.value);
    await nextTick();
    // alert(result.message);
  } else {
    alert(result.message || '북마크 처리 중 오류가 발생했습니다.');
  }
}

// 알림 상태 관리 (나중에 구현)
const isNotification = ref(false);
function clickNotification() {
  isNotification.value = !isNotification.value;
}

// 카카오맵 초기화
function initKakaoMap() {
  console.log('카카오맵 초기화 시작')
  const container = document.getElementById('kakao-map');

  if(!container) {
    console.error('kakao-map 요소를 찾을 수 없습니다.');
    return;
  }
  
  try {
    // 지도 생성할 때 필요한 기본 옵션
    const options = {
      // center: new kakao.maps.LatLng(37.5297, 126.9647), // 지도의 중심 좌표
      center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심 좌표
      level: 3 // 지도의 레벨(확대, 축소 정도)
    };

    kakaoMap = new kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴

    // 마커 생성
    kakaoMarker = new kakao.maps.Marker({
      position: options.center,
      map: kakaoMap
    });

    // 팝업 데이터가 있으면 주소로 좌표 검색
    if (popup.value && popup.value.address) {
      updateMapLocation(popup.value.address);
    }
  } catch(e) {
    console.error('카카오맵 초기화 오류: ', e);
  }
};

// 지도 위치 업데이트 함수
function updateMapLocation(address) {
  if (!kakaoMap || !address) return;

  console.log('주소로 지도 위치 업데이트:', address);

  try {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        
        // 마커 위치 변경
        kakaoMarker.setPosition(coords);
        
        // 지도 중심 이동
        kakaoMap.setCenter(coords);
        console.log('지도 위치 업데이트 완료', coords);
      } else {
        console.error('주소 검색 실패: ', status);
      }
    });
  } catch(e) {
    console.error('지도 위치 업데이트 오류: ', e);
  }
};

// 카카오맵 스크립트 로드
function loadKakaoMapScript() {
  console.log('카카오맵 스크립트 로드 시작, API키:', kakaoMapApiKey);


  // 이미 로드된 경우 중복 로드 방지
  if(window.kakao && window.kakao.maps) {
    console.log('카카오맵 스크립트가 이미 로드되어 있습니다.');
    initKakaoMap();
    return;
  }

  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}&libraries=services&autoload=false`;
  script.onload = () => {
    console.log('카카오맵 스크립트 로드 완료');
    window.kakao.maps.load(() => {
      console.log('카카오맵 API 로드 완료')
      initKakaoMap();
    });
  };
  script.onerror = (e) => {
    console.error('카카오맵 스크립트 로드 오류: ', e);
  };

  document.head.appendChild(script);
};

const handleResize = () => {
  if(slides.value.length > 0) {
    slideWidth.value = slides.value[0].offsetWidth;
    const totalWidth = slideWidth.value * slides.value.length;
    if(slideContainer.value) {
      slideContainer.value.style.width = `${totalWidth}px`;
    }

    const translateX = currentIdx.value * slideWidth.value;
    if(slideContainer.value) {
      slideContainer.value.style.transform = `translateX(-${translateX}px)`;
    }

    updateSlideControls();
  }
};

onMounted(async () => {
  console.log('컴포넌트 마운트 완료');
  try {
    const status = await getBookmarkStatus(popupId);
    console.log("북마크 상태 응답: ", status);

    isBookmarked.value = status.isBookmarked;
    isAuthenticated.value = status.authenticated;

  } catch(error) {
    console.error("북마크 상태 조회 에러: ", error);
  }

  nextTick(() => {
    if (popup.value && popup.value.saveImageNames && popup.value.saveImageNames.length > 0) {
      checkImagesLoaded();
    } else {
      console.log('팝업 데이터가 없거나 이미지가 없습니다.');
    }
  });

  window.addEventListener('resize', handleResize);

  // 카카오맵 스크립트 로드
  loadKakaoMapScript();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

</script>


<style scoped>
@import url('/public/css/popup/[id]/index.css');
</style>