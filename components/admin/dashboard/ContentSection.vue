<template>
  <div class="content-data">
    <div class="head">
      <h3>
        <RouterLink :to="link">{{ title }}</RouterLink>
      </h3>
      <div class="menu">
        <i class="bx bx-dots-horizontal-rounded icon" @click="isMenuOpen = !isMenuOpen"></i>
        <ul class="menu-link" :class="{ show: isMenuOpen }">
          <li>
            <RouterLink :to="link">더보기</RouterLink>
          </li>
          <li v-if="showWriteButton">
            <RouterLink :to="`${link}/new`">글작성</RouterLink>
          </li>
        </ul>
      </div>
    </div>
    <div class="notice">
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="4" style="text-align: center; padding: 20px; color: var(--color-grey-6);">
              등록된 {{ title }}이 없습니다.
            </td>
          </tr>
          <tr v-for="item in items" :key="item.id">
            <td class="content-num">{{ item.id }}</td>
            <td class="content-title">
              <RouterLink :to="detailLink(item.id)">{{ item.title }}</RouterLink>
            </td>
            <td class="content-writer">{{ item.writer }}</td>
            <td class="content-date">{{ formatDateStr(item.date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { formatDate } from '~/utils/dateFormat';

const props = defineProps({
  title: { type: String, required: true },
  link: { type: String, required: true },
  items: { type: Array, default: () => [] },
  showWriteButton: { type: Boolean, default: false }
});

const isMenuOpen = ref(false);

const detailLink = (id) => `${props.link}/${id}`;
const formatDateStr = (dateString) => formatDate(dateString);

// 외부 클릭 시 메뉴 닫기
const closeMenu = (event) => {
  if (!event.target.closest('.menu')) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', closeMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenu);
});
</script>
