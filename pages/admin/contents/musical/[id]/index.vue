<template>
  <div class="main-wrap">
    <section class="product__container" v-if="musical">
      <div class="product__header">
        <div class="product__category">
          <RouterLink :to="{ path: `/admin/content/musical` }">
            <strong>뮤지컬</strong>
            <i class='bx bx-chevron-right'></i>
          </RouterLink>
        </div>
        <div class="product__title">
          <div class="product__title-text">{{ musical.title }}</div>
        </div>
        <div class="product__registration">
          <div class="product__registration-writer-info">
            <span class="name">{{ musical.writer }}</span>
            <div class="product__registration-date">
              <span>{{ formatDate(musical.writeDate) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- END PRODUCT HEADER -->
      <!-- PRODUCT CONTENT -->
      <div class="product__content">
        <div class="product__content-summary">
          <div class="product__content-poster">
            <!-- <img v-if="musical.saveImageName"
              :src="`http://localhost:8081/api/v1/uploads/images/musical/${musical.saveImageName}`" alt="포스터이미지" 
            /> -->
            <img
              v-if="getImageUrl(musical)"
              :src="getImageUrl(musical)"
              :alt="musical.title"
              @error="handleImageError"
            />
            <div v-else>이미지가 없습니다.</div>
          </div>
          <ul class="product__content-info">
            <li class="product__content-info-item">
              <div class="infoLabel">장소</div>
              <div class="infoDesc">{{ musical.venue }}</div>
            </li>
            <li class="product__content-info-item">
              <div class="infoLabel">공연기간</div>
              <div class="infoDesc">
                <span name="startDate">{{ formatDate(musical.startDate) }}</span>
                <span>~</span>
                <span name="endDate">{{ formatDate(musical.endDate) }}</span>
              </div>
            </li>
            <li class="product__content-info-item">
              <div class="infoLabel">공연시간</div>
              <div class="infoDesc" name="runningTime">{{ musical.runningTime }}</div>
            </li>
            <li class="product__content-info-item">
              <div class="infoLabel">관람연령</div>
              <div class="infoDesc" name="ageRestriction">{{ musical.ageRestriction }}</div>
            </li>
            <li class="product__content-info-item">
              <div class="infoLabel">가격</div>
              <div class="infoDesc">
                <ul class="infoPriceList">
                  <li class="infoPriceItem" v-for="(price) in musical.ticketPrices" :key="price.id">
                    <span class="seat" name="seat">{{ price.seat }}</span>
                    <span class="price" name="price">{{ price.price }}</span>
                  </li>
                </ul>
              </div>
            </li>
            <li class="product__content-info-item">
              <div class="infoLabel">예매처</div>
              <div class="infoDesc ticketGroup">
                <span class="ticketName" name="name" v-for="office in musical.ticketOffices" :key="office.id">
                  <a :href="office.link" target="_blank" name="link">{{ office.name }}</a>
                </span>
              </div>
            </li>
          </ul>
        </div>
        <!-- END PRODUCT SUMMARY -->
        <!-- PRODUCT CONTENT DETAIL -->
        <div class="product__content-detail">
          <div>
            <h2>공연시간 정보</h2>
            <div v-html="musical.content"></div>
          </div>
        </div>
        <div class="product__content-detail-info">
          <h2>상세 정보</h2>
          <div class="product__content-detail-info-map">
            <span class="address">{{ musical.address }}</span>
          </div>
          <!-- 하단 버튼 -->
          <div class="product__content-buttons">
            <button type="button" class="service">서비스 홈페이지로 이동</button>
            <RouterLink :to="{ path: `/admin/contents/musical` }">
              <button type="button" class="list">목록으로 이동</button>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
    <div v-else>뮤지컬 데이터 로딩중</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const musicalId = route.params.id;

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 상태 관리 위한 ref 선언
const musical = ref(null);
const error = ref(null);

// 데이터 가져오기
watchEffect(async () => {
  try {
    const { data } = await useFetch(`/admin/musical/${musicalId}`, {
      baseURL: apiBase,
      key: `musical-${musicalId}`,
    });


    if (data.value) {
      console.log(useRuntimeConfig().public.apiBase);
      console.log('data::', data.value);
      console.log('musical::', musical.value);
      musical.value = data.value;
    } else {
      error.value = "데이터를 불러올 수 없습니다.";
    }
  } catch (err) {
    console.error(err);
    error.value = "서버와의 통신에 실패했습니다.";
  }
});

// 이미지 URL 동적 생성
const getImageUrl = (musical) => {
  if(!musical) return null;

  if(musical.dataSource === 'KOPIS_API') {
    if(musical.imageUrl) {
      return musical.imageUrl;
    }

    if(musical.saveImageName && musical.saveImageName.startsWith('http')) {
      return musical.saveImageName;
    }
  }

  if(musical.saveImageName && !musical.saveImageName.startsWith('http')) {
    return `http://localhost:8081/api/v1/uploads/images/musical/${musical.saveImageName}`;
  }

  return null;
}

const handleImageError = (event) => {
  console.warn('이미지 로드 실패:', event.target.src);
  event.target.style.display = 'none';
}

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

</script>

<style scoped>
@import url('/public/css/admin/contents/musical/detail.css');

/* :deep 선택자를 사용하여 v-html 내부 요소에 스타일 적용 */
:deep(.product__content-detail img) {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin-bottom: 30px;
}
</style>
<!-- 
<style>
/* 전역 스타일 - scoped 속성 제거 */
.product__content-detail img {
  max-width: 100%;
  height: auto;
  margin-bottom: 30px;
}
</style> -->