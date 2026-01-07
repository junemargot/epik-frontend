<!-- MAIN PAGE -->
<template>
  <div class="main-container">
    <div class="photo-slider">
      <div class="photo-slider__container" ref="sliderRef" :style="sliderStyle">
        <div v-for="(slide, index) in slides" :key="index" class="photo-slider__item">
          <RouterLink :to="`/popup/${slide.id}`" class="card__link" />
          <NuxtImg 
						class="photo-slider__image"
            :src="getImageUrl(slide, 'popup')"
            :alt="`${slide.title} 포스터 이미지`"
						loading="eager"
						quality="80"
            @error="handleImageError" 
					/>
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
      <button 
        class="photo-slider__arrow photo-slider__arrow--left" 
        @click="moveSlider(-1)"
        :disabled="isPrevDisabled"
      >
        <i class='bx bx-chevron-left'></i>
      </button>
      <button 
        class="photo-slider__arrow photo-slider__arrow--right" 
        @click="moveSlider(1)"
        :disabled="isNextDisabled"
      >
        <i class='bx bx-chevron-right'></i>
      </button>
    </div>

    <div class="tag-buttons">
      <button class="tag-button">
        <div class="tag-button__icon">🎫</div>
        <span>티켓 오픈 임박</span>
      </button>
      <button class="tag-button">
        <div class="tag-button__icon">🔥</div>
        <span>인기급상승 콘서트</span>
      </button>
      <button class="tag-button">
        <div class="tag-button__icon">🎻</div> 
        <span>클래식 & 무용</span>
      </button>
      <button class="tag-button">
        <div class="tag-button__icon">🖼️</div>
        <span>연인과 가기 좋은 전시</span>
      </button>
      <button class="tag-button">
        <div class="tag-button__icon">🛩️</div>
        <span>해외 내한 공연</span>
      </button>
      <button class="tag-button">
        <div class="tag-button__icon">🍭</div>
        <span>애니메이션 팝업</span>
      </button>
      <button class="tag-button">
        <div class="tag-button__icon">🌈</div>
        <span>체험형 인터랙티브</span>
      </button>
      <button class="tag-button">
        <div class="tag-button__icon">🖋️</div>
        <span>기록덕후 추천 팝업</span>
      </button>
    </div>

    <!-- 팝업 -->
    <div class="popup-area">
      <div class="section-header">
        <h2 class="card__title">Pop-up</h2>
        <RouterLink to="/popup" class="more-btn">
          더보기 <i class="bx bx-chevron-right"></i>
        </RouterLink>
      </div>
      <div class="card__grid">
        <div v-for="(item, index) in popupItems" :key="index" class="card__item">
          <RouterLink :to="`/popup/${item.id}`" class="card__link" />
          <NuxtImg 
						:src="getImageUrl(item, 'popup')"
            :alt="`${item.title} 포스터 이미지`"
						loading="lazy"
						quality="80"
						sizes="sm:100vw md:50vw lg:33vw"
            @error="handleImageError"
					/>
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
      <div class="section-header">
        <h2 class="card__title">Concert</h2>
        <RouterLink to="/concert" class="more-btn">
          더보기 <i class="bx bx-chevron-right"></i>
        </RouterLink>
      </div>
      <div class="card__grid">
        <div v-for="(item, index) in concertItems" :key="index" class="card__item">
          <RouterLink :to="`/concert/${item.id}`" class="card__link" />
          <NuxtImg 
            :src="getImageUrl(item, 'concert')"
            :alt="`${item.title} 포스터 이미지`"
						loading="lazy"
						quality="80"
						sizes="sm:100vw md:50vw lg:33vw"
            @error="handleImageError"
          />
          <div class="card__info">
            <!-- 상태 라벨 -->
            <div class="card__status-tag" style="display: flex; gap: 5px;">
              <span class="card__status status-region">
                {{ getRegionLabel(item) }}
              </span>
              <span class="card__status" :class="getStatusClass(item.performanceStatus)">
                {{ item.performanceStatus }}
              </span>
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
      <div class="section-header">
        <h2 class="card__title">Musical</h2>
        <RouterLink to="/musical" class="more-btn">
          더보기 <i class="bx bx-chevron-right"></i>
        </RouterLink>
      </div>
      <div class="card__grid">
        <div v-for="(item, index) in musicalItems" :key="index" class="card__item">
          <RouterLink :to="`/musical/${item.id}`" class="card__link" />
          <NuxtImg 
            :src="getImageUrl(item, 'musical')"
            :alt="`${item.title} 포스터 이미지`"
						loading="lazy"
						quality="80"
						sizes="sm:100vw md:50vw lg:33vw"
            @error="handleImageError"
          />
          <div class="card__info">
            <!-- 상태 라벨 -->
            <div class="card__status-tag" style="display: flex; gap: 5px;">
              <span class="card__status status-region">
                {{ getRegionLabel(item) }}
              </span>
              <span class="card__status" :class="getStatusClass(item.performanceStatus)">
                {{ item.performanceStatus }}
              </span>
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

    <!-- 전시회 -->
    <div class="exhibition">
      <div class="section-header">
      <h2 class="card__title">Exhibition</h2>
      <RouterLink to="/exhibition" class="more-btn">
          더보기 <i class="bx bx-chevron-right"></i>
        </RouterLink>
      </div>
      <div class="card__grid">
        <div v-for="(item, index) in exhibitionItems" :key="index" class="card__item">
          <RouterLink :to="`/exhibition/${item.id}`" class="card__link" />
          <NuxtImg 
						:src="getImageUrl(item, 'exhibition')"
            :alt="`${item.title} 포스터 이미지`"
						loading="lazy"
						quality="80"
						sizes="sm:100vw md:50vw lg:33vw"
						@error="handleImageError"
					/>
          <div class="card__info">
            <div class="card__status-tag">
              <span class="card__status" :class="getStatusClass(item.performanceStatus)">
                {{ item.performanceStatus }}
              </span>
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
import { ref } from "vue";
import { useFetch } from "#app";
import { normalizeImageField } from "~/utils/normalizeData";

const slides = ref([]);
const popupItems = ref([]);
const concertItems = ref([]);
const musicalItems = ref([]);
const exhibitionItems = ref([]);

const currentIndex = ref(0);
const slidesToShow = 5;
const isAutoSlideActive = ref(true);
let autoSlideInterval = null;
// const videos = ref([]);

// 팝업 슬라이드 데이터 조회 및 정규화
const { data: slidesData, error: slidesError } = await useFetch("/api/v1/popup/random", {
	baseURL: "http://localhost:8081",
	credentials: "include",
});

if (slidesError.value) {
	console.error("슬라이드 API 호출 에러:", slidesError.value);
} else if (slidesData.value) {
	const rawData = Array.isArray(slidesData.value) ? slidesData.value : [slidesData.value];
	slides.value = normalizeImageField(rawData.slice(0, 10), "popup");
	// slides.value = normalizeImageField(rawData, 'popup');
}

// 팝업 데이터 조회 및 정규화
const { data: popupData, error: popupError } = await useFetch("/api/v1/popup/random", {
	baseURL: "http://localhost:8081",
	credentials: "include",
});

if (popupError.value) {
	console.error("팝업 API 호출 에러:", popupError.value);
} else if (popupData.value) {
	const rawData = Array.isArray(popupData.value) ? popupData.value : [popupData.value];
	popupItems.value = normalizeImageField(rawData.slice(0, 6), "popup");
}

// 콘서트 데이터 조회 및 정규화
const { data: concertData, error: concertError } = await useFetch("/api/v1/concert/random", {
	baseURL: "http://localhost:8081",
	credentials: "include",
});

if (concertError.value) {
	console.error("콘서트 API 호출 에러:", concertError.value);
} else if (concertData.value) {
	const rawData = Array.isArray(concertData.value) ? concertData.value : [concertData.value];
	concertItems.value = normalizeImageField(rawData.slice(0, 6), "concert");
}

// 뮤지컬 데이터 조회 및 정규화
const { data: musicalData, error: musicalError } = await useFetch("/api/v1/musical/random", {
	baseURL: "http://localhost:8081",
	credentials: "include",
});

if (musicalError.value) {
	console.error("뮤지컬 API 호출 에러:", musicalError.value);
} else if (musicalData.value) {
	const rawData = Array.isArray(musicalData.value) ? musicalData.value : [musicalData.value];
	musicalItems.value = normalizeImageField(rawData.slice(0, 6), "musical");
}

// 전시회 데이터 조회 및 정규화
const { data: exhibitionData, error: exhibitionError } = await useFetch(
	"/api/v1/exhibition/random",
	{
		baseURL: "http://localhost:8081",
		credentials: "include",
	},
);

if (exhibitionError.value) {
	const rawData = Array.isArray(exhibitionData.value)
		? exhibitionData.value
		: [exhibitionData.value];
	console.error("전시회 API 호출 에러:", exhibitionError.value);

	exhibitionItems.value = normalizeImageField(rawData.slice(0, 6), "exhibition");
} else if (exhibitionData.value) {
	const rawData = Array.isArray(exhibitionData.value)
		? exhibitionData.value
		: [exhibitionData.value];
	exhibitionItems.value = normalizeImageField(rawData.slice(0, 6), "exhibition");
}

// 날짜 포맷팅 함수
const formatDate = (date) => {
	if (!date) return "";
	const options = { year: "numeric", month: "short", day: "numeric" };
	return new Date(date).toLocaleDateString(undefined, options);
};

// 이미지 URL 동적 생성 함수 + 성능 측정
const { getImageUrl } = useImageUrl();

// 이미지 로드 에러 처리
const handleImageError = (event) => {
	console.warn("이미지 로드 실패:", event.target.src);
	// 기본 이미지로 대체하거나 숨김 처리
	event.target.style.display = "none";
};

// 상태별 CSS 클래스 반환 함수
const getStatusClass = (status) => {
	switch (status) {
		case "진행중":
			return "status-ongoing";
		case "공연예정":
			return "status-upcoming";
		case "종료":
			return "status-ended";
		default:
			return "";
	}
};

const getRegionLabel = (item) => {
	if (!item.regionName) return "";
	const region = item.regionName;

	return region
		.replace("특별시", "")
		.replace("광역시", "")
		.replace("북도", "")
		.replace("남도", "")
		.replace("도", "")
		.trim();
};

onMounted(() => {
	// URL 변환 이후 슬라이더 크기 다시 계산
	nextTick(() => {
		updateDimensions();
	});
});

const sliderRef = ref(null);
const sliderPosition = ref(0);
const containerWidth = ref(0);
const sliderWidth = ref(0);
const maxScroll = ref(0);
const slideWidth = ref(0);

const sliderStyle = computed(() => ({
	transform: `translateX(${-currentIndex.value * slideWidth.value}px)`,
	transition: "transform 0.3s ease",
	width: `${sliderWidth.value}px`,
}));

const isPrevDisabled = computed(() => currentIndex.value === 0);
const isNextDisabled = computed(() => currentIndex.value >= slides.value.length - slidesToShow);

const updateDimensions = () => {
	if (!sliderRef.value) return;
	const slideElements = sliderRef.value.querySelectorAll(".photo-slider__item");

	if (slides.length === 0) return;

	const slideElement = slideElements[0];
	const itemWidth = slideElement.offsetWidth;
	const marginRight = parseFloat(getComputedStyle(slideElement).marginRight) || 0;

	containerWidth.value = sliderRef.value.parentElement.offsetWidth;
	slideWidth.value = itemWidth + marginRight;
	sliderWidth.value = slideWidth.value * slideElements.length;
	maxScroll.value = Math.max(0, sliderWidth.value - containerWidth.value);
};

const startAutoSlide = () => {
	if (!isAutoSlideActive.value) return;

	stopAutoSlide();

	autoSlideInterval = setInterval(() => {
		if (!isAutoSlideActive.value) return;

		if (currentIndex.value >= slides.value.length - slidesToShow) {
			currentIndex.value = 0;
		} else {
			currentIndex.value++;
		}
	}, 3000);
};

const stopAutoSlide = () => {
	if (autoSlideInterval) {
		clearInterval(autoSlideInterval);
		autoSlideInterval = null;
	}
};

const moveSlider = (direction) => {
	isAutoSlideActive.value = false;
	stopAutoSlide();

	const newIndex = currentIndex.value + direction;
	currentIndex.value = Math.max(0, Math.min(slides.value.length - slidesToShow, newIndex));
};

onMounted(() => {
	nextTick(() => {
		updateDimensions();

		window.addEventListener("resize", updateDimensions);

		setTimeout(() => {
			startAutoSlide();
		}, 1000);
	});
});

onUnmounted(() => {
	window.removeEventListener("resize", updateDimensions);
	stopAutoSlide();
});
</script>

<style scoped>
@import url("/public/css/popup/index.css");
</style>
