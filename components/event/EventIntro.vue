<template>
  <section class="event__intro">
    <h2 class="intro__title">공연상세 정보</h2>
    <div class="intro__content" v-html="formatContent(content)"></div>
    <div class="event__schedule" v-if="schedules && schedules.length">
      <p v-for="(schedule, index) in schedules" :key="index">{{ schedule }}</p>
    </div>
    <div class="event__images" v-if="images && images.length">
      <h3 class="images__title">상세 이미지</h3>
      <div class="images__gallery">
        <NuxtImg 
          v-for="(image, index) in images" 
          :key="index" 
          :src="normalizeImageUrl(image)" 
          :alt="`${title} 상세${index + 1}`" 
          loading="lazy"
          quality="80"
          class="detail__image"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
const config = useRuntimeConfig();

defineProps({
  title: String,
  content: String,
  youtubeUrl: String,
  images: Array
});

// 이미지 URL 정규화
const normalizeImageUrl = (image) => {
  if (!image) return null;
  
  // 이미 절대 URL이면 그대로 반환
  if (image.startsWith('http')) {
    return image;
  }
  
  // 상대 경로면 백엔드 URL 붙이기
  if (image.startsWith('/cache') || image.startsWith('/api')) {
    return `${config.public.apiBase}${image}`;
  }
  
  return image;
};

// 엔터 처리 함수 추가
const formatContent = (content) => {
  if (!content) return '';
  return content.replace(/\n/g, '<br>');
};

</script>

<style>
@import url('/public/css/components/event.css');
</style>

<style scoped>
.intro__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.intro__content {
  line-height: 1.6;
  margin-bottom: 30px;
}

.intro__content :deep(img) {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 0 auto 30px;
}

.images__title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.images__gallery {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail__image {
  max-width: 1000px;  /* 이미지 최대 크기 제한 */
  width: 100%;
  height: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0 0 15px 0;  /* 왼쪽 정렬로 변경 */
}

</style>