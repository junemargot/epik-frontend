<template>
  <main class="mypage-wrap">
    <section class="inquiry-wrap">
      <div class="inquiry__header">
        <h1 class="inquiry__title">1:1 문의</h1>
        <NuxtLink to="/mypage/inquiry/form" class="inquiry__write-btn">
          문의하기
        </NuxtLink>
      </div>

      <div class="inquiry__tabs">
        <span class="inquiry__tab">제목</span>
        <span class="inquiry__tab">작성일</span>
        <span class="inquiry__tab">답변상태</span>
      </div>

      <div class="inquiry__list-wrap">
        <div class="inquiry__empty" v-if="inquiries.length === 0">
          문의글이 없습니다.
        </div>

        <ul class="inquiry__list" v-else>
          <li v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry__item">
            <!-- 아코디언 -->
            <button class="inquiry__item-link" @click="toggleInquiry(inquiry.id)">
              <span class="inquiry__item-title">{{ inquiry.title }}</span>
              <span class="inquiry__item-date">{{ inquiry.createdAt }}</span>
              <span
                class="inquiry__item-status"
                :class="inquiry.status === 'PENDING' ? 'pending' : 'completed'"
              >
                {{ inquiry.statusDescription }}
              </span>
            </button>
            <div class="inquiry__detail" v-if="openId === inquiry.id">
              <div class="inquiry__detail-loading" v-if="detailLoading">
                불러오는 중...
              </div>
              <div v-else-if="detail">
                <div class="inquiry__detail-meta">
                  {{ detail.parentCategory }} &gt; {{ detail.categoryDescription }}
                </div>

                <div class="inquiry__detail-content">
                  <span class="inquiry__detail-q">Q</span>
                  <p>{{ detail.content }}</p>  
                </div>

                <!-- 첨부 이미지 -->
                <div class="inquiry__detail-images" v-if="detail.images && detail.images.length > 0">
                  <img
                    v-for="img in detail.images" :key="img.id"
                    :src="`${apiBase}${img.imagePath}`"
                    :alt="img.originalFilename"
                    class="inquiry__detail-image"
                  />
                </div>

                <!-- 답변 -->
                <div class="inquiry__detail-answer" v-if="detail.answer">
                  <span class="inquiry__detail-a">A</span>
                  <div class="inquiry__detail-answer-content">{{ detail.answer }}</div>
                </div>

                <!-- 수정/삭제 -->
                <div class="inquiry__detail-actions" v-if="inquiry.status === 'PENDING'">
                  <button class="inquiry__detail-action-btn" @click.stop="handleEdit(inquiry.id)">수정</button>
                  <span class="inquiry__detail-action-divider">|</span>
                  <button class="inquiry__detail-action-btn" @click.stop="handleDelete(inquiry.id)">삭제</button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="inquiry__footer">
        <div class="inquiry__pagination" v-if="totalPages > 1">
          <button class="pagination__btn" :disabled="currentPage === 0" @click="goToPage(currentPage - 1)">&lt;</button>
          <button
            v-for="page in totalPages" :key="page"
            class="pagination__btn"
            :class="{ active: currentPage === page - 1 }"
            @click="goToPage(page - 1)"
          >
            {{ page }}
          </button>
          <button class="pagination__btn" :disabled="currentPage === totalPages - 1" @click="goToPage(currentPage + 1)">&gt;</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const openId = ref(null);
const detail = ref(null);
const detailLoading = ref(false);

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();

const toggleInquiry = async (id) => {
  if(openId.value === id) {
    openId.value = null;
    detail.value = null;
    return;
  }

  openId.value = id;
  detail.value = null;
  detailLoading.value = true;

  const { data, error } = await useAuthFetch(`/member/inquiry/${id}`);
  if(data.value) {
    detail.value = data.value;
  }

  if(error.value) {
    console.error("상세 조회 실패: ", error.value);
  }

  detailLoading.value = false;
};

const handleEdit = (id) => {
  navigateTo(`/mypage/inquiry/${id}/edit`);
};

const handleDelete = async (id) => {
  if(!confirm("문의를 삭제하시겠습니까?")) return;

  try {
    await $fetch(`${apiBase}/member/inquiry/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` })
      }
    });
    alert("문의가 삭제되었습니다.");
    openId.value = null;
    detail.value = null;
    refresh();
  } catch(error) {
    console.error("삭제 실패: ", error);
  }
}

const currentPage = ref(0);
const pageSize = 10;

const { data: pageData, error, refresh } = await useAuthFetch(
  `/member/inquiry?page=${currentPage.value}&size=${pageSize}`
);

if (error.value) {
  console.error('문의 목록 조회 실패:', error.value);
}

const inquiries = computed(() => {
  return pageData.value?.content || [];
});

const totalPages = computed(() => {
  return pageData.value?.totalPages || 0;
});

const goToPage = async (page) => {
  currentPage.value = page;
  const { data } = await useAuthFetch(
    `/member/inquiry?page=${page}&size=${pageSize}`
  );

  if(data.value) {
    pageData.value = data.value;
  }
};
</script>

<style scoped>
@import url('/public/css/mypage/inquiry.css');
</style>