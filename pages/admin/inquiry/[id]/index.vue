<template>
  <div class="wrap">
    <div class="main-wrap">
      <section class="board__container" v-if="inquiry">
        <!-- 헤더 -->
        <div class="board__header">
          <div class="board__category">
            <RouterLink to="/admin/inquiry">
              <strong>1:1 문의관리</strong>
              <i class='bx bx-chevron-right'></i>
            </RouterLink>
          </div>
          <div class="board__title">
            <h3 class="board__title-detail">{{ inquiry.title }}</h3>
          </div>
          <div class="board__meta">
            <div class="board__meta-left">
              <span class="category-tag" :class="categoryTagClass(inquiry.parentCategory)">
                {{ inquiry.categoryDescription }}
              </span>
              <span class="board__meta-writer">{{ inquiry.writer }}</span>
            </div>
            <div class="board__meta-right">
              <span class="board__meta-date">{{ inquiry.createdAt }}</span>
              <span class="board__meta-status" :class="inquiry.status === 'PENDING' ? 'status--pending' : 'status--answered'">
                {{ inquiry.statusDescription }}
              </span>
            </div>
          </div>
        </div>

        <!-- 문의 내용 -->
        <div class="inquiry__content">
          <div class="inquiry__content-label">문의 내용</div>
          <div class="inquiry__content-text">{{ inquiry.content }}</div>

          <!-- 첨부 이미지 -->
          <div class="inquiry__content-images" v-if="inquiry.images && inquiry.images.length > 0">
            <div class="inquiry__content-images-label">첨부 이미지</div>
            <div class="inquiry__content-images-list">
              <img
                v-for="img in inquiry.images" :key="img.id"
                :src="`${apiBase}${img.imagePath}`"
                :alt="img.originalFilename"
                class="inquiry__content-image"
                @click="openImage(`${apiBase}${img.imagePath}`)"
              />
            </div>
          </div>
        </div>

        <!-- 답변 영역 -->
        <div class="inquiry__answer">
          <div class="inquiry__answer-label">답변</div>

          <!-- 이미 답변된 경우 -->
          <div class="inquiry__answer-completed" v-if="inquiry.status === 'ANSWERED'">
            <div class="inquiry__answer-text">{{ inquiry.answer }}</div>
            <div class="inquiry__answer-date">답변일: {{ inquiry.answeredAt }}</div>
          </div>

          <!-- 미답변인 경우 - 답변 작성 -->
          <div class="inquiry__answer-form" v-else>
            <textarea
              v-model="answerContent"
              class="inquiry__answer-textarea"
              placeholder="답변 내용을 입력해주세요."
              rows="8"
            ></textarea>
            <div class="inquiry__answer-actions">
              <button class="btn btn--submit" @click="submitAnswer">등록</button>
            </div>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="inquiry__footer-buttons">
          <RouterLink to="/admin/inquiry">
            <button class="btn btn--list">목록</button>
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();
const inquiryId = route.params.id;

// 문의 상세 조회
const inquiry = ref(null);

const fetchInquiryDetail = async () => {
  try {
    const data = await $fetch(`${apiBase}/admin/inquiry/${inquiryId}`, {
      credentials: 'include',
      headers: {
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` })
      }
    });
    inquiry.value = data;
  } catch (error) {
    console.error('문의 상세 조회 실패:', error);
  }
};

// 카테고리 태그 클래스
const categoryTagClass = (parentCategory) => {
  const classMap = {
    '회원/이벤트': 'category-tag--member',
    '서비스/오류/기타': 'category-tag--service',
    '비즈니스/광고': 'category-tag--business'
  };
  return classMap[parentCategory] || 'category-tag--default';
};

// 이미지 새 탭에서 열기
const openImage = (url) => {
  window.open(url, '_blank');
};

// 답변 등록
const answerContent = ref('');

const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    alert('답변 내용을 입력해주세요.');
    return;
  }

  if (!confirm('답변을 등록하시겠습니까?')) return;

  try {
    await $fetch(`${apiBase}/admin/inquiry/${inquiryId}/answer`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` })
      },
      body: JSON.stringify({ answer: answerContent.value })
    });

    alert('답변이 등록되었습니다.');
    await fetchInquiryDetail(); // 새로고침
  } catch (error) {
    console.error('답변 등록 실패:', error);
    alert('답변 등록에 실패했습니다.');
  }
};

// 초기 로드
onMounted(async () => {
  await fetchInquiryDetail();
});
</script>

<style lang="css" scoped>
@import url("/public/css/admin/inquiry/detail.css");
</style>