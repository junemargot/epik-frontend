<!-- /Users/margotinjune/Documents/EPIK_Frontend/pages/concert/index.vue -->
<template>
  <div class="main-container">
    <!-- 상단 슬라이더 -->
    <div class="photo-slider">
      <div class="slider-container" ref="sliderRef" :style="sliderStyle">
        <div class="slider-item" v-for="(slide, index) in slides" :key="index">
          <RouterLink :to="`/concert/${slide.id}`" class="slider-link">
            <img :src="getImageUrl(slide, 'concert')" 
                 :alt="`Concert ${index + 1}`"
                 @error="handleImageError">
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

    <!-- 카테고리 필터 -->
    <div class="category-filters">
      <button 
        v-for="category in categories" 
        :key="category"
        class="category-btn"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category">
        {{ category }}
      </button>
    </div>

    <!-- EPIK'S PICK -->
    <section class="picks">
      <div class="picks__header">
        <h2 class="picks__title">EPIK'S PICK</h2>
      </div>
      <div class="picks__container">
        <div v-for="(pick, index) in picksItems" :key="index" class="picks__item">
          <RouterLink :to="`/concert/${pick.id}`" class="picks__item-link">
            <img :src="getImageUrl(pick, 'concert')" 
                 :alt="`${pick.title} 포스터`" 
                 class="picks__image"
                 @error="handleImageError">
            <span class="picks__item-title">{{ pick.title }}</span>
            <span class="picks__item-venue">{{ pick.venue }}</span>
            <span class="picks__item-date">
              {{ formatDate(pick.startDate) }} ~ {{ formatDate(pick.endDate) }}
            </span>
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
          :key="region"
          class="region__filter-btn"
          :class="{ active: selectedRegion === region }"
          @click="selectedRegion = region">
          {{ region }}
        </button>
      </div>

      <div class="region__container">
        <div v-for="(item, index) in displayedItems" :key="index" class="region__item">
          <RouterLink :to="`/concert/${item.id}`" class="region__item-link">
            <img :src="getImageUrl(item, 'concert')" 
                 :alt="`${item.title} 포스터`" 
                 class="region__image"
                 @error="handleImageError">
            <span class="region__item-title">{{ item.title }}</span>
            <span class="region__item-venue">{{ item.venue }}</span>
            <span class="region__item-date">
              {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- 더보기 버튼 -->
      <button v-if="hasMore" @click="loadMore" class="region__more-btn">더보기</button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '#app'
import { normalizeImageField } from '~/utils/normalizeData'

// 데이터
const slides = ref([])
const picksItems = ref([])
const allItems = ref([])
const displayLimit = ref(15)

// 필터
const selectedCategory = ref('전체')
const selectedRegion = ref('전체')

const categories = ref(['전체', '🔥 요즘 HOT', '발라드', '락/메탈', '팝/랩', '재즈/소울', '인디'])
const regions = ref(['전체', '서울', '경기/인천', '충청/강원', '대구/경북', '부산/경남', '광주/전라', '제주'])

// API 호출 - 슬라이더
const { data: slidesData } = await useFetch('/api/v1/concert/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
})

if (slidesData.value) {
  const rawData = Array.isArray(slidesData.value) ? slidesData.value : [slidesData.value]
  slides.value = normalizeImageField(rawData.slice(0, 8), 'concert')
}

// API 호출 - PICK
const { data: picksData } = await useFetch('/api/v1/concert/random', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
})

if (picksData.value) {
  const rawData = Array.isArray(picksData.value) ? picksData.value : [picksData.value]
  picksItems.value = normalizeImageField(rawData.slice(0, 6), 'concert')
}

// API 호출 - 전체
const { data: allData } = await useFetch('/api/v1/concert', {
  baseURL: 'http://localhost:8081',
  credentials: 'include'
})

if (allData.value) {
  const rawData = Array.isArray(allData.value) ? allData.value : [allData.value]
  allItems.value = normalizeImageField(rawData, 'concert')
}

// 필터링
const filteredItems = computed(() => {
  let items = allItems.value

  if (selectedCategory.value !== '전체') {
    items = items.filter(item => item.genre === selectedCategory.value)
  }

  if (selectedRegion.value !== '전체') {
    items = items.filter(item => item.venue && item.venue.includes(selectedRegion.value))
  }

  return items
})

const displayedItems = computed(() => {
  return filteredItems.value.slice(0, displayLimit.value)
})

const hasMore = computed(() => {
  return filteredItems.value.length > displayLimit.value
})

const loadMore = () => {
  displayLimit.value += 15
}

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// 이미지 URL
const getImageUrl = (item, type) => {
  if (!item) return null
  const imageName = item.fileSavedName || item.imgSavedName || item.saveImageName || item.imageFileName

  if (imageName && (imageName.startsWith('PF_') || item.dataSource === 'KOPIS_API')) {
    return item.kopisPoster || item.imageUrl || item.poster || null
  }

  if (imageName && !imageName.startsWith('http') && !imageName.startsWith('PF_')) {
    return `http://localhost:8081/api/v1/uploads/images/${type}/${imageName}`
  }

  return null
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 슬라이더
const sliderRef = ref(null)
const currentIndex = ref(0)
const slidesToShow = 4
const slideWidth = ref(0)

const sliderStyle = computed(() => ({
  transform: `translateX(${-currentIndex.value * slideWidth.value}px)`,
  transition: 'transform 0.3s ease'
}))

const isPrevDisabled = computed(() => currentIndex.value === 0)
const isNextDisabled = computed(() => currentIndex.value >= slides.value.length - slidesToShow)

const updateDimensions = () => {
  if (!sliderRef.value) return
  const slideElement = sliderRef.value.querySelector('.slider-item')
  if (slideElement) {
    slideWidth.value = slideElement.offsetWidth + parseFloat(getComputedStyle(slideElement).marginRight)
  }
}

const moveSlider = (direction) => {
  currentIndex.value = Math.max(0, Math.min(slides.value.length - slidesToShow, currentIndex.value + direction))
}

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
})
</script>

<style scoped>
@import url('/public/css/concert/index.css');
</style>