<!-- /pages/concert/index.vue -->
<template>
  <div class="main-container">
    <!-- 상단 슬라이더 -->
    <div class="photo-slider">
      <div class="slider-container" ref="sliderRef" :style="sliderStyle">
        <div class="slider-item" v-for="(item, index) in slides" :key="index">
          <RouterLink :to="`/concert/${item.id}`" class="slider-link">
            <NuxtImg 
              :src="getImageUrl(item, 'concert')" 
              :alt="`${item.title} ${index + 1}`"
              loading="lazy"
              quality="80"
              sizes="sm:100vw md:50vw lg:33vw"
              class="slider-image"
              @error="handleImageError"
            />
            <div class="slider-overlay">
              <div class="overlay-header">
                <h3 class="slider-title">{{ item.title }}</h3>
              </div>
              <div class="overlay-footer">
                <p class="slider-date">
                  {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
                </p>
                <p class="slider-venue">{{ item.venue }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
      <button class="arrow-left" @click="moveSlider(-1)" :disabled="isPrevDisabled">
        <i class='bx bx-chevron-left'></i>
      </button>
      <button class="arrow-right" @click="moveSlider(1)" :disabled="isNextDisabled">
        <i class='bx bx-chevron-right'></i>
      </button>
    </div>

    <!-- 장르별 보기 (카테고리) -->
    <section class="category">
      <h2 class="category__title">장르별 보기</h2>
      <div class="category__filters">
        <button 
          v-for="category in categories"
          :key="category.id"
          class="category__filter-btn"
          :class="{ active: selectedCategory === category.label }"
          @click="filterByCategory(category)"
        >
          {{ category.label }}
        </button>
      </div>
      
      <div class="category__container">
        <div v-for="(item, index) in categoryItems" :key="item.id" class="category__item">
          <RouterLink :to="`/concert/${item.id}`" class="category__item-link">
            <NuxtImg
              :src="getImageUrl(item, 'concert')"
              :alt="`${item.title} ${index + 1}`"
              loading="lazy"
              quality="80"
              sizes="sm:100vw md:50vw lg:33vw"
              class="category__image"
              @error="handleImageError"
            />
            <div class="category__info">
              <div class="category__info-header">
                <div class="card__status-tag">
                  <span class="card__status">
                    {{ getRegionLabel(item) }}
                  </span>
                </div>
                <span class="category__item-title">{{ item.title }}</span>
              </div>
              <div class="category__info-footer">
                <span class="category__item-venue">{{ item.venue }}</span>
                <span class="category__item-date">
                  {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- 더보기 버튼 - 장르별 -->
      <div v-if="hasMoreCategory" class="more-btn-container">
        <button @click="loadMoreCategory" class="more-btn">
          더보기
        </button>
      </div>
    </section>

    <!-- 지역별 보기 -->
    <section class="region">
      <h2 class="region__title">지역별 보기</h2>
      <div class="region__filters">
        <button 
          v-for="region in regions" 
          :key="region.id"
          class="region__filter-btn"
          :class="{ active: selectedRegion === region.label }"
          @click="filterByRegion(region)"
        >
          {{ region.label }}
        </button>
      </div>

      <div class="region__container">
        <div v-for="(item, index) in regionItems" :key="item.id" class="region__item">
          <RouterLink :to="`/concert/${item.id}`" class="region__item-link">
            <NuxtImg 
              :src="getImageUrl(item, 'concert')" 
              :alt="`${item.title} ${index + 1}`" 
              loading="lazy"
              quality="80"
              sizes="sm:100vw md:50vw lg:33vw"
              class="region__image"
              @error="handleImageError"
            />
            <div class="region__info">
              <div class="region__info-header">
                <div class="card__status-tag">
                  <span class="card__status">{{ getGenreLabel(item) }}</span>
                </div>
                <span class="region__item-title">{{ item.title }}</span>
              </div>
              <div class="region__info-footer">
                <span class="region__item-venue">{{ item.venue }}</span>
                <span class="region__item-date">
                  {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
      <!-- 더보기 버튼 - 지역별 -->
      <div v-if="hasMoreRegion" class="more-btn-container">
        <button @click="loadMoreRegion" class="more-btn">
          더보기
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useFetch } from "#app";
import { normalizeImageField } from "~/utils/normalizeData";

// 데이터
const slides = ref([]);
const allItems = ref([]);
const categoryItems = ref([]);
const regionItems = ref([]);

// 전체 데이터 저장 (더보기용)
const allCategoryData = ref([]);
const allRegionData = ref([]);

// 페이지네이션
const categoryPage = ref(0);
const regionPage = ref(0);
const itemsPerPage = 12;

// 더보기 버튼 표시 여부
const hasMoreCategory = computed(() => {
	return categoryItems.value.length < allCategoryData.value.length;
});

const hasMoreRegion = computed(() => {
	return regionItems.value.length < allRegionData.value.length;
});

// 필터
const selectedCategory = ref("전체");
const selectedRegion = ref("서울");

const categories = ref([
	{ label: "전체", id: null },
	{ label: "클래식", id: 1 },
	{ label: "대중음악", id: 2 },
	{ label: "대중무용", id: 3 },
	{ label: "무용", id: 4 },
	{ label: "복합", id: 5 },
]);

const regions = ref([
	{ label: "서울", id: 1 },
	{ label: "경기/인천", id: 2 },
	{ label: "충청/강원", id: 3 },
	{ label: "대구/경북", id: 4 },
	{ label: "부산/경남", id: 5 },
	{ label: "광주/전라", id: 6 },
	{ label: "제주", id: 7 },
]);

// API 호출 - 슬라이더
const { data: slidesData } = await useFetch("/api/v1/concert/random", {
	baseURL: "http://localhost:8081",
	credentials: "include",
});

if (slidesData.value) {
	const rawData = Array.isArray(slidesData.value) ? slidesData.value : [slidesData.value];
	slides.value = normalizeImageField(rawData, "concert");
	console.log("슬라이더 데이터:", slides.value.length);
}

// API 호출 - 전체 데이터 (초기 로딩)
const { data: allData } = await useFetch("/api/v1/concert", {
	baseURL: "http://localhost:8081",
	credentials: "include",
	// params: { page: 1 }
});

if (allData.value) {
	const rawData = Array.isArray(allData.value) ? allData.value : [allData.value];
	allItems.value = normalizeImageField(rawData, "concert");

	// 장르별 초기 데이터 (전체 - 랜덤)
	const { data: randomData } = await useFetch("/api/v1/concert/random", {
		baseURL: "http://localhost:8081",
		credentials: "include",
	});

	if (randomData.value) {
		const rawRandom = Array.isArray(randomData.value) ? randomData.value : [randomData.value];
		allCategoryData.value = normalizeImageField(rawRandom, "concert");
		categoryItems.value = allCategoryData.value.slice(0, itemsPerPage);
		categoryPage.value = 1;
		console.log(
			"초기 장르별 데이터:",
			allCategoryData.value.length,
			"/ 표시:",
			categoryItems.value.length,
		);
	}

	// 지역별 초기 데이터 (서울)
	const { data: seoulData } = await useFetch("/api/v1/concert", {
		baseURL: "http://localhost:8081",
		credentials: "include",
		params: { region: 1 },
	});

	if (seoulData.value) {
		const rawSeoul = Array.isArray(seoulData.value) ? seoulData.value : [seoulData.value];
		allRegionData.value = normalizeImageField(rawSeoul, "concert");
		regionItems.value = allRegionData.value.slice(0, itemsPerPage);
		regionPage.value = 1;
		console.log(
			"초기 지역별 데이터:",
			allRegionData.value.length,
			"/ 표시:",
			regionItems.value.length,
		);
	}
}

// 카테고리 필터 함수
const filterByCategory = async (category) => {
	console.log("=== filterByCategory 호출 ===");
	console.log("선택 카테고리: ", category);

	selectedCategory.value = category.label;

	if (category.id === null) {
		// 전체선택 시
		const { data, error } = await useFetch("/api/v1/concert/random", {
			baseURL: "http://localhost:8081",
			credentials: "include",
			// params: {
			//   page: 0,
			//   size: 50
			// }
		});

		if (data.value) {
			const rawData = Array.isArray(data.value) ? data.value : [data.value];
			allCategoryData.value = normalizeImageField(rawData, "concert");
			categoryItems.value = allCategoryData.value.slice(0, itemsPerPage);
			categoryPage.value = 1;
			console.log("전체 카테고리 데이터:", allCategoryData.value.length);
		}
	} else {
		const genreMapping = {
			1: "클래식",
			2: "대중음악",
			3: "대중무용",
			4: "무용",
			5: "복합",
		};

		const genreName = genreMapping[category.id];

		// 장르별 API 호출
		const { data, error } = await useFetch("/api/v1/concert/genre", {
			baseURL: "http://localhost:8081",
			credentials: "include",
			params: { genreName: genreName },
		});

		if (data.value) {
			const rawData = Array.isArray(data.value) ? data.value : [data.value];
			allCategoryData.value = normalizeImageField(rawData, "concert");
			categoryItems.value = allCategoryData.value.slice(0, itemsPerPage);
			categoryPage.value = 1;
			console.log(
				"장르별 데이터:",
				allCategoryData.value.length,
				"/ 표시:",
				categoryItems.value.length,
			);
		}
	}
};

// 지역 필터 함수
const filterByRegion = async (region) => {
	console.log("=== filterByRegion 호출 ===");
	console.log("선택 지역: ", region);

	selectedRegion.value = region.label;

	const params = { region: region.id };
	console.log("지역 API 파라미터: ", params);

	const { data, error } = await useFetch("/api/v1/concert", {
		baseURL: "http://localhost:8081",
		credentials: "include",
		params: params,
	});

	console.log("지역 API 응답: ", data.value);
	console.log("에러: ", error.value);

	if (data.value) {
		const rawData = Array.isArray(data.value) ? data.value : [data.value];
		console.log("필터된 데이터 개수: ", rawData.length);

		allRegionData.value = normalizeImageField(rawData, "concert");
		regionItems.value = allRegionData.value.slice(0, itemsPerPage);
		regionPage.value = 1;
		console.log("지역별 데이터:", allRegionData.value.length, "/ 표시:", regionItems.value.length);
	}
};

// 상태 라벨
const getStatusLabel = (item) => {
	const now = new Date();
	const startDate = new Date(item.startDate);
	const endDate = new Date(item.endDate);

	if (now < startDate) {
		return "오픈예정";
	} else if (now > endDate) {
		return "종료";
	} else {
		return "진행중";
	}
};

// 지역 라벨
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

// 장르 라벨
const getGenreLabel = (item) => {
	if (!item.genreName) return "기타";
	const genre = item.genreName;

	if (genre.includes("무용")) {
		return "무용";
	} else if (genre.includes("클래식") || genre.includes("서양음악")) {
		return "클래식";
	} else if (genre.includes("대중음악")) {
		return "대중음악";
	} else if (genre.includes("대중무용")) {
		return "대중무용";
	} else if (genre.includes("복합")) {
		return "복합공연";
	}

	return genre;
};

// 날짜 포맷
const formatDate = (date) => {
	if (!date) return "";
	return new Date(date).toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

// 이미지 URL 동적 생성 및 로드 에러 처리
const { getImageUrl, handleImageError } = useImageUtils();

// 슬라이더
const sliderRef = ref(null);
const currentIndex = ref(0);
const slidesToShow = 4;
const slideWidth = ref(0);
const isAutoSlideActive = ref(true);

const sliderStyle = computed(() => ({
	transform: `translateX(${-currentIndex.value * slideWidth.value}px)`,
	transition: "transform 0.3s ease",
}));

// 이전/다음 버튼 비활성화
const isPrevDisabled = computed(() => currentIndex.value === 0);
const isNextDisabled = computed(() => currentIndex.value >= slides.value.length - slidesToShow);

const updateDimensions = () => {
	if (!sliderRef.value) return;
	const slideElement = sliderRef.value.querySelector(".slider-item");
	if (!slideElement) return;

	// 실제 렌더링된 아이템의 너비와 마진을 가져옴
	const itemWidth = slideElement.offsetWidth;
	const marginRight = parseFloat(getComputedStyle(slideElement).marginRight) || 0;

	slideWidth.value = itemWidth + marginRight;

	console.log("슬라이더 업데이트:", {
		itemWidth,
		marginRight,
		slideWidth: slideWidth.value,
		totalSlides: slides.value.length,
		maxIndex: slides.value.length - slidesToShow,
	});
};

// 자동 슬라이드 기능
let autoSlideInterval = null;

const startAutoSlide = () => {
	if (!isAutoSlideActive.value) return;

	stopAutoSlide();

	autoSlideInterval = setInterval(() => {
		if (!isAutoSlideActive.value) return;

		// 마지막에 도달하면 처음으로
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
	// 수동 조작 시 자동 슬라이드 중지
	isAutoSlideActive.value = false;
	stopAutoSlide();

	// 1개씩 이동
	const newIndex = currentIndex.value + direction;
	currentIndex.value = Math.max(0, Math.min(slides.value.length - slidesToShow, newIndex));

	console.log("슬라이더 이동:", {
		direction,
		currentIndex: currentIndex.value,
		showing: `${currentIndex.value + 1} ~ ${Math.min(currentIndex.value + slidesToShow, slides.value.length)}`,
	});
};

// 장르별 더보기
const loadMoreCategory = async () => {
	const start = categoryPage.value * itemsPerPage;
	const end = start + itemsPerPage;
	const moreItems = allCategoryData.value.slice(start, end);

	if (moreItems.length > 0) {
		categoryItems.value = [...categoryItems.value, ...moreItems];
		categoryPage.value++;
		console.log("장르별 더보기:", categoryItems.value.length, "/", allCategoryData.value.length);
	}
};

// 지역별 더보기
const loadMoreRegion = async () => {
	const start = regionPage.value * itemsPerPage;
	const end = start + itemsPerPage;
	const moreItems = allRegionData.value.slice(start, end);

	if (moreItems.length > 0) {
		regionItems.value = [...regionItems.value, ...moreItems];
		regionPage.value++;
		console.log("지역별 더보기:", regionItems.value.length, "/", allRegionData.value.length);
	} else {
		// 캐시 소진, 추가 페이지 요청
		const currentRegionId = regions.value.find((r) => r.label === selectedRegion.value)?.id;
		const nextPage = Math.floor(allRegionData.value.length / 15) + 1;
		console.log("추가 API 요청: ", { regionId: currentRegionId, page: nextPage });

		const { data, error } = await useFetch("/api/v1/concert", {
			baseURL: "http://localhost:8081",
			credentials: "include",
			params: {
				region: currentRegionId,
				page: nextPage,
			},
		});

		if (data.value && Array.isArray(data.value) && data.value.length > 0) {
			const rawData = normalizeImageField(data.value, "concert");
			allRegionData.value = [...allRegionData.value, ...rawData];

			const newItems = rawData.slice(0, itemsPerPage);
			regionItems.value = [...regionItems.value, ...newItems];
			regionPage.value++;

			console.log(
				"지역별 더보기 (API):",
				regionItems.value.length,
				"/ 전체:",
				allRegionData.value.length,
			);
		} else {
			console.log("지역별 더보기: 더 이상 데이터 없음");
		}
	}
};

onMounted(() => {
	console.log("슬라이더 마운트 - 총 데이터:", slides.value.length);

	// DOM이 완전히 렌더링된 후 실행
	nextTick(() => {
		updateDimensions();

		// 리사이즈 이벤트 등록
		window.addEventListener("resize", updateDimensions);

		// 자동 슬라이드 시작 (1초 후)
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
@import url('/public/css/concert/index.css');
</style>