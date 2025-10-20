<!-- MAIN PAGE -->
<template>
  <div class="main-container">
    <div class="photo-slider">
      <div class="photo-slider__container" ref="sliderRef" :style="sliderStyle">
        <div v-for="(slide, index) in slides" :key="index" class="photo-slider__item">
          <RouterLink :to="`/popup/${slide.id}`" class="card__link" />
          <img class="photo-slider__image"
            :src="getImageUrl(slide, 'popup')"
            :alt="`Image ${index + 1}`"
            @error="handleImageError">
          <div class="photo-slider__overlay">
            <!-- 헤더 영역: 팝업 제목 -->
            <div class="overlay-header">
              <h2 class="photo-slider__title">{{ slide.title }}</h2>
            </div>
            <!-- 풋터 영역: 팝업 기간과 장소 -->
            <div class="overlay-footer">
              <p class="card__date-main">
                <span>{{ formatDate(slide.startDate) }}</span>
                <span>~</span>
                <span>{{ formatDate(slide.endDate) }}</span>
              </p>
              <p class="card__location">{{ slide.address }}</p>
            </div>
          </div>
        </div>
      </div>
      <button class="photo-slider__arrow photo-slider__arrow--left" @click="moveSlider(-1)">
        <i class='bx bx-chevron-left'></i>
      </button>
      <button class="photo-slider__arrow photo-slider__arrow--right" @click="moveSlider(1)">
        <i class='bx bx-chevron-right'></i>
      </button>
      <div class="photo-slider__scrollbar" @mousedown="onScrollbarClick">
        <div class="photo-slider__scrollbar-thumb" ref="scrollbarThumbRef" :style="scrollbarThumbStyle"></div>
      </div>
    </div>

    <div class="tag-buttons">
      <button class="tag-button">🎫 티켓 오픈 임박</button>
      <button class="tag-button">🔥 인기급상승 콘서트</button>
      <button class="tag-button">🎻 핫이슈 클래식 & 무용</button>
      <button class="tag-button">🖼️ 봄날에 가기 좋은 전시</button>
      <button class="tag-button">🛩️ 해외 내한 공연</button>
      <button class="tag-button">🍭 애니메이션 팝업</button>
      <button class="tag-button">🌈 체험형 인터랙티브</button>
      <button class="tag-button">🖋️ 기록덕후 추천 팝업</button>
    </div>

    <!-- 팝업 -->
    <div class="popup-area">
      <h2 class="card__title">Pop-up</h2>
      <div class="card__grid">
        <div v-for="(item, index) in popupItems" :key="index" class="card__item">
          <RouterLink :to="`/popup/${item.id}`" class="card__link" />
          <img :src="getImageUrl(item, 'popup')"
            :alt="`Popup ${index + 1}`"
            @error="handleImageError">
          <div class="card__info">
            <!-- 팝업 상태 라벨 -->
            <div class="card__status-tag">
              <span class="card__status">진행중</span>
            </div>
            <div class="card__info-header">
              <h3>{{ item.title }}</h3>
            </div>
            <div class="card__info-footer">
              <p class="card__location">{{ item.address }}</p>
              <p class="card__date-main">
                <span>{{ formatDate(item.startDate) }}</span>
                <span>~</span>
                <span>{{ formatDate(item.endDate) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 콘서트 -->
    <div class="concert">
      <h2 class="card__title">Concert</h2>
      <div class="card__grid">
        <div v-for="(item, index) in concertItems" :key="index" class="card__item">
          <RouterLink :to="`/concert/${item.id}`" class="card__link" />
          <img :src="getImageUrl(item, 'concert')"
               :alt="`Image ${index + 1}`"
               @error="handleImageError">
          <div class="card__info">
            <!-- 상태 라벨 -->
            <div class="card__status-tag">
              <span class="card__status">진행중</span>
            </div>
            <div class="card__info-header">
              <h3>{{ item.title }}</h3>
            </div>
            <div class="card__info-footer">
              <p class="card__location">{{ item.venue }}</p>
              <p class="card__date-main">
                <span>{{ formatDate(item.startDate) }}</span>
                <span>~</span>
                <span>{{ formatDate(item.endDate) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 뮤지컬 -->
    <div class="musical">
      <h2 class="card__title">Musical</h2>
      <div class="card__grid">
        <div v-for="(item, index) in musicalItems" :key="index" class="card__item">
          <RouterLink :to="`/musical/${item.id}`" class="card__link" />
          <img :src="getImageUrl(item, 'musical')"
               :alt="`Musical ${index + 1}`"
               @error="handleImageError">
          <div class="card__info">
            <!-- 상태 라벨 -->
            <div class="card__status-tag">
              <span class="card__status">진행중</span>
            </div>
            <div class="card__info-header">
              <h3>{{ item.title }}</h3>
            </div>
            <div class="card__info-footer">
              <p class="card__location">{{ item.venue }}</p>
              <p class="card__date-main">
                <span>{{ formatDate(item.startDate) }}</span>
                <span>~</span>
                <span>{{ formatDate(item.endDate) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 영상 섹션 -->
    <!-- <div class="video">
    <div class="video__container">
      <button class="video__nav video__nav--left" @click="moveVideoSlider(-1)">&#8249;</button>
      <div class="video__slider" ref="videoSliderRef" :style="videoSliderStyle">
        <div v-for="(embedUrl, index) in embedYoutubeUrls" :key="index" class="video__item">
          <iframe
            :src="embedUrl"
            frameborder="0"
            allowfullscreen
            title="YouTube video player"
          ></iframe>
        </div>
      </div>
      <button class="video__nav video__nav--right" @click="moveVideoSlider(1)">&#8250;</button>
    </div>
  </div> -->

    <!-- 전시회 -->
    <div class="exhibition">
      <h2 class="card__title">Exhibition</h2>
      <div class="card__grid">
        <div v-for="(item, index) in exhibitionItems" :key="index" class="card__item">
          <RouterLink :to="`/exhibition/${item.id}`" class="card__link" />
          <img :src="getImageUrl(item, 'exhibition')"
                :alt="`Exhibition ${index + 1}`"
                @error="handleImageError">
          <div class="card__info">
            <div class="card__status-tag">
              <span class="card__status">진행중</span>
            </div>
            <div class="card__info-header">
              <h3>{{ item.title }}</h3>
            </div>
            <div class="card__info-footer">
              <p class="card__location">{{ item.venue }}</p>
              <p class="card__date-main">
                <span>{{ formatDate(item.startDate) }}</span>
                <span>~</span>
                <span>{{ formatDate(item.endDate) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFetch } from '#app';
import { normalizeImageField } from '~/utils/normalizeData';

// 🔍 이미지 성능 측정 추가
const { measureImageLoad, printPerformanceReport, downloadReport } = useImagePerformance();

const slides = ref([]);
const popupItems = ref([]);
const concertItems = ref([]);
const musicalItems = ref([]);
const exhibitionItems = ref([]);
// const videos = ref([]);

// 팝업 슬라이드 데이터 조회 및 정규화 
const { data: slidesData, error: slidesError } = await useFetch('/api/v1/popup/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
});

if (slidesError.value) {
  console.error('슬라이드 API 호출 에러:', slidesError.value)

} else if (slidesData.value) {
  const rawData = Array.isArray(slidesData.value) ? slidesData.value : [slidesData.value];
  slides.value = normalizeImageField(rawData.slice(0, 10), 'popup');
  // slides.value = normalizeImageField(rawData, 'popup');
}

// 팝업 데이터 조회 및 정규화
const { data: popupData, error: popupError } = await useFetch('/api/v1/popup/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
});

if (popupError.value) {
  console.error('팝업 API 호출 에러:', popupError.value)

} else if (popupData.value) {
  const rawData = Array.isArray(popupData.value) ? popupData.value : [popupData.value];
  popupItems.value = normalizeImageField(rawData.slice(0, 6), 'popup');
}

// 콘서트 데이터 조회 및 정규화
const { data: concertData, error: concertError } = await useFetch('/api/v1/concert/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
})

if (concertError.value) {
  console.error('콘서트 API 호출 에러:', concertError.value)

} else if (concertData.value) {
  const rawData = Array.isArray(concertData.value) ? concertData.value : [concertData.value];
  concertItems.value = normalizeImageField(rawData.slice(0, 6), 'concert');
}

// 뮤지컬 데이터 조회 및 정규화
const { data: musicalData, error: musicalError } = await useFetch('/api/v1/musical/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
})

if (musicalError.value) {
  console.error('뮤지컬 API 호출 에러:', musicalError.value)

} else if (musicalData.value) {
  const rawData = Array.isArray(musicalData.value) ? musicalData.value : [musicalData.value];
  musicalItems.value = normalizeImageField(rawData.slice(0, 6), 'musical');
}

// 전시회 데이터 조회 및 정규화
const { data: exhibitionData, error: exhibitionError } = await useFetch('/api/v1/exhibition/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
});

if (exhibitionError.value) {
  const rawData = Array.isArray(exhibitionData.value) ? exhibitionData.value : [exhibitionData.value];
  console.error('전시회 API 호출 에러:', exhibitionError.value)
  
  exhibitionItems.value = normalizeImageField(rawData.slice(0, 6), 'exhibition');

} else if (exhibitionData.value) {
  const rawData = Array.isArray(exhibitionData.value) ? exhibitionData.value : [exhibitionData.value];
  exhibitionItems.value = normalizeImageField(rawData.slice(0, 6), 'exhibition');
};

// 날짜 포맷팅 함수
const formatDate = (date) => {
  if (!date) return ''
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(date).toLocaleDateString(undefined, options)
}

// 이미지 URL 동적 생성 함수 + 성능 측정
const getImageUrl = (item, type) => {
  if(!item) return null;

  console.log('=== getImageUrl 디버깅 ===');
  console.log('아이템:', item.title);
  console.log('dataSource:', item.dataSource);
  
  // KOPIS API 데이터 판별 (PF_로 시작하는 파일명은 KOPIS 데이터)
  const imageName = item.fileSavedName || item.imgSavedName || item.saveImageName || item.imageFileName;
  
  // KOPIS 데이터인 경우 (파일명이 PF_로 시작하거나 dataSource가 KOPIS_API)
  if(imageName && (imageName.startsWith('PF_') || item.dataSource === 'KOPIS_API')) {
    console.log('KOPIS 데이터 감지');
    
    // KOPIS 원본 URL들 확인
    let imageUrl = null;
    if(item.kopisPoster && item.kopisPoster.startsWith('http')) {
      console.log('KOPIS 포스터 URL 사용:', item.kopisPoster);
      imageUrl = item.kopisPoster;
    } else if(item.imageUrl && item.imageUrl.startsWith('http')) {
      console.log('이미지 URL 사용:', item.imageUrl);
      imageUrl = item.imageUrl;
    } else if(item.poster && item.poster.startsWith('http')) {
      console.log('포스터 URL 사용:', item.poster);
      imageUrl = item.poster;
    }
    
    // 🔍 성능 측정 (KOPIS 외부 이미지)
    if (imageUrl) {
      measureImageLoad(imageUrl, `${type}-kopis`);
    }
    
    // KOPIS 데이터인데 외부 URL이 없으면 null 반환 (숨김 처리)
    if (!imageUrl) {
      console.warn('KOPIS 데이터지만 외부 URL을 찾을 수 없음');
    }
    return imageUrl;
  }
  
  // 수기 입력 데이터 (로컬 파일)
  if(imageName && !imageName.startsWith('http') && !imageName.startsWith('PF_')) {
    const finalUrl = `http://localhost:8081/api/v1/uploads/images/${type}/${imageName}`;
    console.log('로컬 이미지 URL:', finalUrl);
    
    // 🔍 성능 측정 (로컬 이미지)
    measureImageLoad(finalUrl, `${type}-local`);
    
    return finalUrl;
  }

  console.log('이미지 URL을 찾을 수 없음');
  return null;
};

// 이미지 로드 에러 처리
const handleImageError = (event) => {
  console.warn('이미지 로드 실패:', event.target.src);
  // 기본 이미지로 대체하거나 숨김 처리
  event.target.style.display = 'none';
};


// YouTube URL 관리
const youtubeUrls = ref([
  "https://www.youtube.com/watch?v=yWMbEEO7TcU",
  "https://www.youtube.com/watch?v=zo1cYfqT1oM",
  "https://www.youtube.com/watch?v=IImyBu6Hh98", 
  "https://www.youtube.com/watch?v=0bx21frXDJE",
  "https://www.youtube.com/watch?v=HJ9tK01fSuk",
  "https://www.youtube.com/watch?v=k8F4s2Ie5xU"
]);

const embedYoutubeUrls = reactive([]);

function convertToEmbedUrl(url) {
  const videoIdMatch = url.match(/(?:\?v=|\/embed\/|\/v\/|youtu\.be\/)([^&?/\n]+)/);
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
}

onMounted(() => {
  youtubeUrls.value.forEach(url => {
    const embedUrl = convertToEmbedUrl(url);
    if (embedUrl) {
      embedYoutubeUrls.push(embedUrl);
    }
  });
  // URL 변환 이후 슬라이더 크기 다시 계산
  nextTick(() => {
    updateDimensions();
  });
});

const sliderRef = ref(null)
const scrollbarThumbRef = ref(null)
const videoSliderRef = ref(null)
const sliderPosition = ref(0)
const videoCurrentIndex = ref(0)
const containerWidth = ref(0)
const sliderWidth = ref(0)
const maxScroll = ref(0)
const slideWidth = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startScrollLeft = ref(0)

const sliderStyle = computed(() => ({
  transform: `translateX(${-sliderPosition.value}px)`,
  width: `${sliderWidth.value}px`
}))

const scrollbarThumbStyle = computed(() => ({
  width: `${Math.max((containerWidth.value / sliderWidth.value) * 100, 40)}px`,
  left: `${(sliderPosition.value / maxScroll.value) * 100}%`
}))

const videoItemWidth = 300
const videoItemMargin = 16
const videoMoveDistance = videoItemWidth + videoItemMargin

const videoSliderStyle = computed(() => ({
  transform: `translateX(-${videoCurrentIndex.value * videoMoveDistance}px)`
}))

const updateDimensions = () => {
  if (!sliderRef.value) return
  const slides = sliderRef.value.querySelectorAll('.photo-slider__item')

  if(slides.length === 0) return;

  containerWidth.value = sliderRef.value.parentElement.offsetWidth
  slideWidth.value = slides[0].offsetWidth + parseFloat(getComputedStyle(slides[0]).marginRight)
  sliderWidth.value = slideWidth.value * slides.length - parseFloat(getComputedStyle(slides[slides.length - 1]).marginRight)
  maxScroll.value = Math.max(0, sliderWidth.value - containerWidth.value)
}

const updateSliderPosition = (percentage) => {
  sliderPosition.value = Math.min(maxScroll.value, percentage * maxScroll.value)
}

const moveSlider = (direction) => {
  sliderPosition.value = Math.max(0, Math.min(maxScroll.value, sliderPosition.value + direction * slideWidth.value))
}

const moveVideoSlider = (direction) => {
  if (direction > 0 && videoCurrentIndex.value < embedYoutubeUrls.length - 3) {
    videoCurrentIndex.value++;
  } else if (direction < 0 && videoCurrentIndex.value > 0) {
    videoCurrentIndex.value--;
  }
};

const onScrollbarClick = (e) => {
  const thumbRect = scrollbarThumbRef.value.getBoundingClientRect()
  const clickX = e.clientX - scrollbarRect.left;
  const percentage = clickX / scrollbarRect.width;

  // if (e.clientX < thumbRect.left || e.clientX > thumbRect.right) {
  //   const percentage = (e.clientX - sliderRef.value.getBoundingClientRect().left) / sliderRef.value.offsetWidth
  //   updateSliderPosition(percentage)
  // }
  sliderPositionPosition.value = Math.min(maxScroll.value, Math.max(0, percentage * maxScroll.value));
}

const startDragging = (e) => {
  isDragging.value = true
  startX.value = e.clientX - scrollbarThumbRef.value.offsetLeft
  startScrollLeft.value = scrollbarThumbRef.value.offsetLeft
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  const x = e.clientX - sliderRef.value.getBoundingClientRect().left
  const scrollWidth = sliderRef.value.offsetWidth - parseFloat(scrollbarThumbRef.value.style.width)
  const newScrollLeft = Math.max(0, Math.min(scrollWidth, x - startX.value))
  const percentage = newScrollLeft / scrollWidth
  updateSliderPosition(percentage)
}

const onMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
  
  // 🔍 5초 후 성능 리포트 출력 (모든 이미지 로드 대기)
  setTimeout(() => {
    console.log('\n📊 이미지 로딩 성능 측정 결과:');
    const report = printPerformanceReport();
    
    // 전역 변수로 저장 (콘솔에서 접근 가능)
    window.imagePerformanceReport = report;
    console.log('💡 다운로드: window.downloadImageReport()');
  }, 5000);
  
  // 전역 함수로 다운로드 기능 노출
  window.downloadImageReport = () => {
    downloadReport(`image-performance-${new Date().toISOString()}.json`);
  };
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})
</script>

<style scoped>
@import url('/public/css/popup/index.css');
</style>