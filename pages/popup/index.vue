<!-- /pages/popup/index.vue -->
<template>
  <div class="main-container">
    <!-- 상단 슬라이더 -->
    <!-- <div class="photo-slider">
      <div class="photo-slider__container" ref="sliderRef" :style="sliderStyle">
        <div v-for="(slide, index) in slides" :key="index" class="photo-slider__item">
          <RouterLink :to="`/popup/${slide.id}`" class="card__link" />
          <img class="photo-slider__image"
            :src="getImageUrl(slide, 'popup')"
            :alt="`Popup ${index + 1}`"
            @error="handleImageError">
          <div class="photo-slider__overlay">
            <div class="overlay-header">
              <h2 class="photo-slider__title">{{ slide.title }}</h2>
            </div>
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
    </div> -->

    <!-- 카테고리 버튼 -->
    <!-- <div class="tag-buttons">
      <button 
        v-for="category in categories" 
        :key="category.id"
        class="tag-button"
        :class="{ active: selectedCategory === category.value }"
        @click="filterByCategory(category.value)">
        {{ category.icon }} {{ category.label }}
      </button>
    </div> -->

    <!-- EPIK'S PICK -->
    <section class="picks">
      <div class="picks__header">
        <h2 class="picks__title">EPIK'S PICK</h2>
      </div>
      <div class="picks__container">
        <div v-for="(item, index) in picksItems" :key="index" class="picks__item">
          <RouterLink :to="`/popup/${item.id}`" class="picks__item-link">
            <NuxtImg 
              :src="getImageUrl(item, 'popup')"
              :alt="`${item.title} ${index + 1}`"
              loading="lazy"
              quality="80"
              sizes="sm:100vw md:50vw lg:33vw"
              class="picks__image"
              @error="handleImageError"
            />
            <div class="picks__info">
              <span class="picks__item-title">{{ item.title }}</span>
              <span class="picks__item-venue">{{ item.address }}</span>
              <span class="picks__item-date">
                {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
              </span>
            </div>
          </RouterLink>
        </div>
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
        <div v-for="(item, index) in displayedItems" :key="index" class="region__item">
          <RouterLink :to="`/popup/${item.id}`" class="region__item-link">
            <NuxtImg
              :src="getImageUrl(item, 'popup')"
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
                  <span class="card__status">{{ getStatusLabel(item) }}</span>
                </div>
                <span class="region__item-title">{{ item.title }}</span>
              </div>
              <div class="region__info-footer">
                <span class="region__item-venue">{{ item.address }}</span>
                <span class="region__item-date">
                  {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 카테고리별 보기 -->
    <section class="category">
      <h2 class="category__title">카테고리별 보기</h2>
      <div class="category__filters">
        <button 
          v-for="category in categories"
          class="category__filter-btn"
          :key="category.id"
          :class="{ active: selectedCategory === category.label }"
          @click="filterByCategory(category)"
        >
          {{ category.label }}
        </button>
      </div>
      <!-- <RouterLink to="/popup/category" class="more-btn">
        더보기 <i class='bx bx-chevron-right'></i>
      </RouterLink> -->
      <!-- 카테고리별 팝업 아이템 표시 -->
      <div class="category__container">
        <div v-for="(item, index) in categoryItems" :key="index" class="category__item">
          <RouterLink :to="`/popup/${item.id}`" class="category__item-link">
            <NuxtImg 
              :src="getImageUrl(item, 'popup')"
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
                    {{ getStatusLabel(item) }}
                  </span>
                </div>
                <span class="category__item-title">{{ item.title }}</span>
              </div>
              <div class="category__info-footer">
                <span class="category__item-venue">{{ item.address }}</span>
                <span class="category__item-date">
                  {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      </section>

      <!-- 더보기 버튼 -->
      <!-- <button v-if="hasMore" @click="loadMore" class="region__more-btn">더보기</button> -->
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useFetch } from "#app";
import { normalizeImageField } from "~/utils/normalizeData";

const slides = ref([]);
const picksItems = ref([]);
// const allItems = ref([]);
const regionItems = ref([]);
const categoryItems = ref([]);
// const displayLimit = ref(9);

// 필터 상태
const selectedCategory = ref("전체");
const selectedRegion = ref("전체");

// 지역 목록
const regions = ref([
	{ label: "전체", id: null },
	{ label: "더현대서울", id: 1 },
	{ label: "성수", id: 2 },
	{ label: "마포﹒서대문﹒홍대", id: 3 },
	{ label: "강남﹒송파", id: 4 },
	{ label: "그 외지역", id: 5 },
]);

// 카테고리 목록
const categories = ref([
	{ label: "전체", id: null },
	{ label: "영화﹒애니메이션", id: 1 },
	{ label: "패션", id: 2 },
	{ label: "뷰티﹒코스메틱", id: 3 },
	{ label: "문구﹒굿즈", id: 4 },
	{ label: "푸드", id: 5 },
]);

// 슬라이드 데이터 조회
const { data: slidesData } = await useFetch("/api/v1/popup/random", {
	baseURL: "http://localhost:8081",
	credentials: "include",
});

if (slidesData.value) {
	const rawData = Array.isArray(slidesData.value) ? slidesData.value : [slidesData.value];
	slides.value = normalizeImageField(rawData.slice(0, 10), "popup");
}

// EPIK'S PICK 데이터 조회
const { data: picksData } = await useFetch("/api/v1/popup/random", {
	baseURL: "http://localhost:8081",
	credentials: "include",
});

if (picksData.value) {
	const rawData = Array.isArray(picksData.value) ? picksData.value : [picksData.value];
	picksItems.value = normalizeImageField(rawData.slice(0, 6), "popup");
}

// 초기 지역별/카테고리별 데이터 조회
const { data: initialData, error: initialDataError } = await useFetch("/api/v1/popup/region", {
	baseURL: "http://localhost:8081",
	credentials: "include",
	params: { page: 1 },
});

console.log("=== 초기 데이터 조회 ===");
console.log("API 응답: ", initialData.value);

if (initialData.value) {
	const rawData = Array.isArray(initialData.value) ? initialData.value : [initialData.value];
	console.log("rawData 길이:", rawData.length);

	regionItems.value = normalizeImageField(rawData.slice(0, 15), "popup");
	categoryItems.value = normalizeImageField(rawData.slice(0, 15), "popup");
	console.log("regionItems 길이: ", regionItems.value.length);
	console.log("categoryItems 길이: ", categoryItems.value.length);
}

const displayedItems = computed(() => {
	return regionItems.value;
});

// 더보기 버튼 표시 여부
const hasMore = computed(() => {
	return filteredItems.value.length > displayLimit.value;
});

// 카테고리 필터 함수
const filterByCategory = async (category) => {
	console.log("=== filterByCategory 호출 ===");
	console.log("선택한 카테고리: ", category);

	selectedCategory.value = category.label;
	if (category.id === null) {
		const { data, error } = await useFetch("/api/v1/popup/region", {
			baseURL: "http://localhost:8081",
			credentials: "include",
			params: { page: 1 },
		});

		if (data.value) {
			const rawData = Array.isArray(data.value) ? data.value : [data.value];
			categoryItems.value = normalizeImageField(rawData.slice(0, 6), "popup");
			console.log("categoryItems 업데이트: ", categoryItems.value.length);
		}
	} else {
		const { data, error } = await useFetch("/api/v1/popup/category", {
			baseURL: "http://localhost:8081",
			credentials: "include",
			params: { categoryId: category.id },
		});

		if (data.value) {
			const rawData = Array.isArray(data.value) ? data.value : [data.value];
			categoryItems.value = normalizeImageField(rawData.slice(0, 6), "popup");
			console.log("categoryItems 업데이트: ", categoryItems.value.length);
		}
	}
};

// 지역 필터 함수
const filterByRegion = async (region) => {
	console.log("=== filterByRegion 호출 ===");
	console.log("선택한 지역: ", region);

	selectedRegion.value = region.label;

	// 전체가 아니면 regionId로 조회
	const params = region.id ? { regionId: region.id, page: 1 } : { page: 1 };
	console.log("API 파라미터: ", params);

	const { data, error } = await useFetch("/api/v1/popup/region", {
		baseURL: "http://localhost:8081",
		credentials: "include",
		params: params,
	});

	console.log("API 응답: ", data.value);
	console.log("에러: ", error);

	if (data.value) {
		const rawData = Array.isArray(data.value) ? data.value : [data.value];
		console.log("필터된 데이터 개수: ", rawData.length);

		regionItems.value = normalizeImageField(rawData, "popup");
		console.log("regionItems 업데이트: ", regionItems.value.length);
	}
};

// 더보기 함수
const loadMore = () => {
	displayLimit.value += 15;
};

// 상태 라벨 가져오기
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

// 날짜 포맷팅
const formatDate = (date) => {
	if (!date) return "";
	const options = {
		year: "numeric",
		month: "short",
		day: "numeric",
	};

	return new Date(date).toLocaleDateString("ko-KR", options);
};

// 이미지 URL 생성
const getImageUrl = (item, type) => {
	if (!item) return null;
	const imageName =
		item.fileSavedName || item.imgSavedName || item.saveImageName || item.imageFileName;

	if (imageName && (imageName.startsWith("PF_") || item.dataSource === "KOPIS_API")) {
		return item.kopisPoster || item.imageUrl || item.poster || null;
	}

	if (imageName && !imageName.startsWith("http") && !imageName.startsWith("PF_")) {
		return `http://localhost:8081/api/v1/uploads/images/${type}/${imageName}`;
	}

	return null;
};

// 이미지 에러 처리
const handleImageError = (event) => {
	console.warn("이미지 로드 실패:", event.target.src);
	event.target.style.display = "none";
};

// 슬라이더 관련 코드
const sliderRef = ref(null);
const scrollbarThumbRef = ref(null);
const sliderPosition = ref(0);
const containerWidth = ref(0);
const sliderWidth = ref(0);
const maxScroll = ref(0);
const slideWidth = ref(0);

const sliderStyle = computed(() => ({
	transform: `translateX(${-sliderPosition.value}px)`,
	width: `${sliderWidth.value}px`,
}));

const scrollbarThumbStyle = computed(() => ({
	width: `${Math.max((containerWidth.value / sliderWidth.value) * 100, 40)}px`,
	left: `${(sliderPosition.value / maxScroll.value) * 100}%`,
}));

const updateDimensions = () => {
	if (!sliderRef.value) return;
	const slideElements = sliderRef.value.querySelectorAll(".photo-slider__item");

	if (slideElements.length === 0) return;
	containerWidth.value = sliderRef.value.parentElement.offsetWidth;
	slideWidth.value =
		slideElements[0].offsetWidth + parseFloat(getComputedStyle(slideElements[0]).marginRight);
	sliderWidth.value =
		slideWidth.value * slideElements.length -
		parseFloat(getComputedStyle(slideElements[slideElements.length - 1]).marginRight);
	maxScroll.value = Math.max(0, sliderWidth.value - containerWidth.value);
};

const moveSlider = (direction) => {
	sliderPosition.value = Math.max(
		0,
		Math.min(maxScroll.value, sliderPosition.value + direction * slideWidth.value),
	);
};

const onScrollbarClick = (e) => {
	const scrollbarRect = e.currentTarget.getBoundingClientRect();
	const clickX = e.clientX - scrollbarRect.left;
	const percentage = clickX / scrollbarRect.width;
	sliderPosition.value = Math.min(maxScroll.value, Math.max(0, percentage * maxScroll.value));
};

onMounted(() => {
	updateDimensions();
	window.addEventListener("resize", updateDimensions);
});

onUnmounted(() => {
	window.removeEventListener("resize", updateDimensions);
});
</script>

<style scoped>
@import url('/public/css/popup/index.css');

.tag-button.active {
  background-color: #333;
  color: white;
}

.region__filter-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.region__filter-btn.active {
  color: #000;
  font-weight: bold;
}

.region__filter-btn:hover {
  color: #000;
}
</style>