<!-- /pages/concert/index.vue -->
<template>
  <div class="main-container">
    <!-- 상단 슬라이더 -->
    <div class="photo-slider">
      <div class="slider-container" ref="sliderRef" :style="sliderStyle">
        <div class="slider-item" v-for="(slide, index) in slides" :key="index">
          <RouterLink :to="`/concert/${slide.id}`" class="slider-link">
            <img 
              :src="getImageUrl(slide, 'concert')" 
              :alt="`Concert ${index + 1}`"
              @error="handleImageError"
              class="slider-image"
            >
            <div class="slider-overlay">
              <div class="overlay-header">
                <h3 class="slider-title">{{ slide.title }}</h3>
              </div>
              <div class="overlay-footer">
                <p class="slider-date">
                  {{ formatDate(slide.startDate) }} ~ {{ formatDate(slide.endDate) }}
                </p>
                <p class="slider-venue">{{ slide.venue }}</p>
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
        <button v-for="category in categories"
          :key="category.id"
          class="category__filter-btn"
          :class="{ active: selectedCategory === category.label }"
          @click="filterByCategory(category)"
        >
        {{ category.label }}
        </button>
      </div>
      
      <div class="category__container">
        <div v-for="(item, index) in categoryItems" :key="index" class="category__item">
          <RouterLink :to="`/concert/${item.id}`" class="category__item-link">
            <img :src="getImageUrl(item, 'concert')"
              :alt="`Concert ${index + 1}`"
              @error="handleImageError"
              class="category__image"
            >
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
                <span class="category__item-venue">{{ item.venue }}</span>
                <span class="category__item-date">
                  {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
                </span>
              </div>
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
          @click="filterByRegion(region)">
          {{ region.label }}
        </button>
      </div>

      <div class="region__container">
        <div v-for="(item, index) in regionItems" :key="index" class="region__item">
          <RouterLink :to="`/concert/${item.id}`" class="region__item-link">
            <img :src="getImageUrl(item, 'concert')" 
                 :alt="`${item.title} 포스터`" 
                 class="region__image"
                 @error="handleImageError">
            <div class="region__info">
              <div class="region__info-header">
                <div class="card__status-tag">
                  <span class="card__status">{{ getStatusLabel(item) }}</span>
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
      
      <!-- 더보기 버튼 -->
      <!-- <button v-if="hasMore" @click="loadMore" class="region__more-btn">더보기</button> -->
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useFetch } from '#app';
import { normalizeImageField } from '~/utils/normalizeData';

// 데이터
const slides = ref([]);
const allItems = ref([]);
const categoryItems = ref([]);
const regionItems = ref([]);

// 필터
const selectedCategory = ref('전체');
const selectedRegion = ref('전체');

const categories = ref([
  { label: '전체', id: null },
  { label: '클래식', id: 1 },
  { label: '대중음악', id: 2 },
  { label: '대중무용', id: 3 },
  { label: '무용', id: 4 },
  { label: '복합', id: 5 },
]);

const regions = ref([
  { label: '전체', id: null },
  { label: '서울', id: 1 },
  { label: '경기/인천', id: 2 },
  { label: '충청/강원', id: 3 },
  { label: '대구/경북', id: 4 },
  { label: '부산/경남', id: 5 },
  { label: '광주/전라', id: 6 },
  { label: '제주', id: 7 }
]);

// API 호출 - 슬라이더
const { data: slidesData } = await useFetch('/api/v1/concert/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
});

if (slidesData.value) {
  const rawData = Array.isArray(slidesData.value) ? slidesData.value : [slidesData.value];
  slides.value = normalizeImageField(rawData.slice(0, 16), 'concert');
  console.log('=== 슬라이더 최종 데이터 개수:', slides.value.length);
};


// API 호출 - 전체 데이터 (초기 로딩)
const { data: allData } = await useFetch('/api/v1/concert', {
  baseURL: 'http://localhost:8081',
  credentials: 'include',
  params: { page: 1 }
})

if (allData.value) {
  const rawData = Array.isArray(allData.value) ? allData.value : [allData.value];
  allItems.value = normalizeImageField(rawData, 'concert');
  categoryItems.value = normalizeImageField(rawData.slice(0, 15), 'concert');
  regionItems.value = normalizeImageField(rawData.slice(0, 15), 'concert');
};

// 카테고리 필터 함수
const filterByCategory = async (category) => {
  console.log('=== filterByCategory 호출 ===');
  console.log('선택 카테고리: ', category);

  selectedCategory.value = category.label;

  if(category.id === null) {
    const { data, error } = await useFetch('/api/v1/concert', {
      baseURL: 'http://localhost:8081',
      credentials: 'include',
      params: { page: 1 }
    });

    if(data.value) {
      const rawData = Array.isArray(data.value) ? data.value : [data.value];
      categoryItems.value = normalizeImageField(rawData.slice(0, 15), 'concert');
      console.log('전체 카테고리 데이터:', categoryItems.value.length);
    }
  } else {
    const genreMapping = {
      1: '클래식',
      2: '대중음악',
      3: '대중무용',
      4: '무용',
      5: '복합'
    };

    const genreName = genreMapping[category.id];

    // 장르별 API 호출
    const { data, error } = await useFetch('/api/v1/concert/genre', {
      baseURL: 'http://localhost:8081',
      credentials: 'include',
      params: { genreName: genreName }
    });

    if(data.value) {
      const rawData = Array.isArray(data.value) ? data.value : [data.value];
      categoryItems.value = normalizeImageField(rawData.slice(0, 15), 'concert');
      console.log('장르별 데이터:', categoryItems.value.length);
    };
  }
};

// 지역 필터 함수
const filterByRegion = async (region) => {
  console.log('=== filterByRegion 호출 ===');
  console.log('선택 지역: ', region);

  selectedRegion.value = region.label;

  const params = region.id ? { region: region.id, page: 1} : { page: 1};
  console.log('지역 API 파라미터: ', params);

  const { data, error } = await useFetch('/api/v1/concert', {
    baseURL: 'http://localhost:8081',
    credentials: 'include',
    params: params
  });

  console.log('지역 API 응답: ', data.value);
  console.log('에러: ', error.value);

  if(data.value) {
    const rawData = Array.isArray(data.value) ? data.value : [data.value];
    console.log('필터된 데이터 개수: ', rawData.length);

    regionItems.value = normalizeImageField(rawData.slice(0, 15), 'concert');
    console.log('regionItems 업데이트: ', regionItems.value.length);
  }
};

// 상태 라벨 
const getStatusLabel = (item) => {
  const now = new Date();
  const startDate = new Date(item.startDate);
  const endDate = new Date(item.endDate);

  if (now < startDate) {
    return '오픈예정';
  } else if (now > endDate) {
    return '종료';
  } else {
    return '진행중';
  }
};

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// 이미지 URL
const getImageUrl = (item, type) => {
  if (!item) return null;
  const imageName = item.fileSavedName || item.imgSavedName || item.saveImageName || item.imageFileName;

  if (imageName && (imageName.startsWith('PF_') || item.dataSource === 'KOPIS_API')) {
    return item.kopisPoster || item.imageUrl || item.poster || null;
  }

  if (imageName && !imageName.startsWith('http') && !imageName.startsWith('PF_')) {
    return `http://localhost:8081/api/v1/uploads/images/${type}/${imageName}`;
  }

  return null;
};

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 슬라이더
const sliderRef = ref(null);
const currentIndex = ref(0);
const slidesToShow = 4;
const slideWidth = ref(0);
const isAutoSlideActive = ref(true);

const sliderStyle = computed(() => ({
  transform: `translateX(${-currentIndex.value * slideWidth.value}px)`,
  transition: 'transform 0.3s ease'
}));

// 이전/다음 버튼 비활성화
const isPrevDisabled = computed(() => currentIndex.value === 0);
const isNextDisabled = computed(() => currentIndex.value >= slides.value.length - slidesToShow);

const updateDimensions = () => {
  if (!sliderRef.value) return;
  const slideElement = sliderRef.value.querySelector('.slider-item');
  if (!slideElement) return;
  
  // 실제 렌더링된 아이템의 너비와 마진을 가져옴
  const itemWidth = slideElement.offsetWidth;
  const marginRight = parseFloat(getComputedStyle(slideElement).marginRight) || 0;
  
  slideWidth.value = itemWidth + marginRight;
  
  console.log('슬라이더 업데이트:', {
    itemWidth,
    marginRight,
    slideWidth: slideWidth.value,
    totalSlides: slides.value.length,
    maxIndex: slides.value.length - slidesToShow
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
    if(currentIndex.value >= slides.value.length - slidesToShow) {
      currentIndex.value = 0;
    } else {
      currentIndex.value++;
    }
  }, 3000);
};

const stopAutoSlide = () => {
  if(autoSlideInterval) {
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
  
  console.log('슬라이더 이동:', {
    direction,
    currentIndex: currentIndex.value,
    showing: `${currentIndex.value + 1} ~ ${Math.min(currentIndex.value + slidesToShow, slides.value.length)}`
  });
};

onMounted(() => {
  console.log('슬라이더 마운트 - 총 데이터:', slides.value.length);
  
  // DOM이 완전히 렌더링된 후 실행
  nextTick(() => {
    updateDimensions();
    
    // 리사이즈 이벤트 등록
    window.addEventListener('resize', updateDimensions);
    
    // 자동 슬라이드 시작 (1초 후)
    setTimeout(() => {
      startAutoSlide();
    }, 1000);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
  stopAutoSlide();
});

</script>

<style scoped>
@import url('/public/css/concert/index.css');
</style>