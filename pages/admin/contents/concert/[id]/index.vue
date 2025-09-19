<template>
  <div class="main-wrap">
    <section class="product__container" v-if="concert">
      <div class="product__header">
        <div class="product__category">
          <RouterLink href="/admin/content/concert">
            <strong>콘서트</strong>
            <i class='bx bx-chevron-right'></i>
          </RouterLink>
        </div>
        <div class="product__title">
          <div class="product__title-text">{{ concert.title }}</div>
        </div>
        <div class="product__registration">
          <div class="product__registration-writer-info">
            <span class="name">{{ concert.writer }}</span>
            <div class="product__registration-date">
              <span>{{ formatDate(concert.writeDate) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- END PRODUCT HEADER -->
      <!-- PRODUCT CONTENT -->
      <div class="product__content">
        <div class="product__content-summary">
          <div class="product__content-poster">
            <img 
              :src="getImageUrl(concert)"
              :alt="concert.title"
              @error="handleImageError"
            />
          </div>
          <ul class="product__content-info">
            <li class="product__content-info-item">
              <div class="info__title">장소</div>
              <div class="info__desc">{{ concert.venue }}</div>
            </li>
            <li class="product__content-info-item">
              <div class="info__title">공연기간</div>
              <div class="info__desc">
                <span name="startDate">{{ formatDate(concert.startDate) }}</span>
                <span>~</span>
                <span name="endDate">{{ formatDate(concert.endDate) }}</span>
              </div>
            </li>
            <li class="product__content-info-item">
              <div class="info__title">공연시간</div>
              <div class="info__desc" name="runningTime">{{ concert.runningTime }}</div>
            </li>
            <li class="product__content-info-item">
              <div class="info__title">관람연령</div>
              <div class="info__desc" name="ageRestriction">{{ concert.ageRestriction }}</div>
            </li>
            <li class="product__content-info-item">
              <div class="info__title">가격</div>
              <div class="info__desc">
                <ul class="infoPriceList">
                  <li class="infoPriceItem" v-for="(price) in concert.ticketPrices" :key="price.id">
                    <span class="seat" name="seat">{{ price.seat }}</span>
                    <span class="price" name="price">{{ price.price }}</span>
                  </li>
                </ul>
              </div>
            </li>
            <li class="product__content-info-item">
              <div class="info__title">예매처</div>
              <div class="info__desc ticketGroup">
                <span class="ticketName" name="name" v-for="office in concert.ticketOffices" :key="office.id">
                  <a :href="office.link" target="_blank" name="link">{{ office.name }}</a>
                </span>
              </div>
            </li>
          </ul>
        </div>
        <!-- END PRODUCT SUMMARY -->

        <!-- PRODUCT CONTENT DETAIL -->
        <div class="product__content-detail">
          <h2>공연 정보</h2>
          <div v-html="concert.content"></div>
        </div>
        <div class="product__content-detail-info">
          <div v-if="concert.concertImages && concert.concertImages.length > 0" class="detail-images">
            <div class="image-gallery">
              <img 
                v-for="(imageUrl, index) in concert.concertImages" 
                :key="index"
                :src="imageUrl" 
                :alt="`상세 이미지 ${index + 1}`"
                class="detail-image"
                @error="handleImageError"
              />
            </div>
          </div>

          <!-- 하단 버튼 -->
          <div class="product__content-buttons">
            <button type="button" class="service">서비스 홈페이지로 이동</button>
            <RouterLink to="/admin/contents/concert">
              <button type="button" class="list">목록으로 이동</button>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
    <div v-else>콘서트 데이터 로딩중</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const concertId = route.params.id;

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 상태 관리 위한 ref 선언
const concert = ref(null);
const error = ref(null);

// 데이터 가져오기
watchEffect(async () => {
  const { data } = await useFetch(`/admin/concert/${concertId}`, {
    baseURL: apiBase,
    key: `concert-${concertId}`,
  });

  if(data.value) {
    console.log(useRuntimeConfig().public.apiBase);
    console.log('data::', data.value);
    console.log('concert::', concert.value);
    concert.value = data.value;
  } else {
    error.value = "콘서트 데이터를 불러올 수 없습니다.";
  }
});

// 이미지 URL 동적 생성 함수
const getImageUrl = (concert) => {
  if(!concert) return null;

  // KOPIS API 데이터인 경우
  if(concert.dataSource === 'KOPIS_API') {
    // imageUrl이 있으면 그것을 사용 (KOPIS API에서 제공하는 포스터 URL)
    if(concert.imageUrl) {
      return concert.imageUrl;
    }

    // imageUrl이 없으면 saveImageName이 HTTP URL인 경우
    if(concert.saveImageName && concert.saveImageName.startsWith('http')) {
      return concert.saveImageName;
    }
  }

  // 수기 데이터이거나 로컬 이미지인 경우
  if(concert.saveImageName && !musical.saveImageName.startsWith('http')) {
    return `http://localhost:8081/api/v1/uploads/images/concert/${concert.saveImageName}`;
  }

  return null;
};

// 이미지 로드 에러 처리
const handleImageError = (event) => {
  console.warn('이미지 로드 실패:', event.target.src);
  // 기본 이미지로 대체하거나 숨김 처리
  event.target.style.display = 'none';
};

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '.').replace(/\.$/, '');
};

onMounted(async () => {
  // await fetchConcertDetail();
});

</script>

<style lang="css" scoped>
@import url("/public/css/admin/contents/concert/detail.css");

/* :deep 선택자를 사용하여 v-html 내부 요소에 스타일 적용 */
:deep(.product__content-detail img) {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin-bottom: 30px;
}

.detail-images {
  margin-bottom: 20px;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-image {
  max-width: 800px;
  height: auto;
}

</style>