<template>
  <main class="mypage-wrap">
    <section class="inquiry-wrap">
      <h1 class="inquiry__title">1:1 문의</h1>
      
      <div class="inquiry__header">
        <NuxtLink to="/mypage/inquiry/write" class="inquiry__write-btn">
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
          게시글이 없습니다.
        </div>

        <ul class="inquiry__list" v-else>
          <li v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry__item">
            <NuxtLink :to="`/mypage/inquiry/${inquiry.id}`" class="inquiry__item-link">
              <span class="inquiry__item-title">{{ inquiry.title }}</span>
              <span class="inquiry__item-date">{{ inquiry.createdAt }}</span>
              <span class="inquiry__item-status" :class="inquiry.status">{{ inquiry.statusText }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup>
const inquiries = ref([
  { id: 1, title: '닉네임 관련 문의 있습니다', createdAt: '2024.10.03', status: 'pending', statusText: '답변대기' }
]);
</script>

<style scoped>
@import url('/public/css/mypage/inquiry.css');
</style>