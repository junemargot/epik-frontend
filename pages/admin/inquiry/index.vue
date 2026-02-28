<template>
  <div class="main-wrap">
    <section class="board">
      <div class="board__header">
        <h1>문의 관리</h1>
        <p>전체 게시물수 {{ totalCount }}건</p>
      </div>
      <div class="board__container">
        <div class="board__list">
          <div class="board__head">
            <div class="board__no">번호</div>
            <div class="board__category">문의유형</div>
            <div class="board__title">제목</div>
            <div class="board__writer">작성자</div>
            <div class="board__regDate">문의접수일</div>
            <div class="board__replyDate">답변일</div>
            <div class="board__status">처리상태</div>
          </div>
          <div class="board__body">
            <div class="board__content" v-for="inquiry in inquiries" :key="inquiry.id">
              <div class="board__no">{{ inquiry.id }}</div>
              <div class="board__category">
                <span class="category-tag">{{ inquiry.categoryDescription }}</span>
              </div>
              <div class="board__title">
                <RouterLink :to="`/admin/inquiry/${inquiry.id}`">
                  {{ inquiry.title }}
                </RouterLink>
              </div>
              <div class="board__writer">{{ inquiry.writer }}</div>
              <div class="board__regDate">{{ inquiry.createdAt }}</div>
              <div class="board__replyDate">{{ inquiry.answeredAt || '-'}}</div>
              <div class="board__status">
                <span :class="inquiry.status === 'PENDING' ? 'status--pending' : 'status--answered'">
                  {{ inquiry.statusDescription }}
                </span>
              </div>
            </div>
          </div> <!-- END BOARD BODY -->
        </div> <!-- END BOARD LIST-->
      </div>
      <!-- END BOARD CONTAINER -->
    
      <!-- PAGINATION -->
      <div class="pagination-registration-container">
        <Pagination 
          :current-page="currentPage"
          :total-pages="totalPages"
          :has-prev-page="currentPage > 1"
          :has-next-page="currentPage < totalPages"
          :visible-pages="pages"
          @page-change="changePage"
        />
      </div>
    </section>
  </div> 
  <!-- END MAIN WRAP -->

  <!-- SEARCH BAR -->
  <SearchBar
    :initial-category="getInitialCategory()"
    :initial-query="searchQuery"
    @search="handleSearch"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePaginationStore } from '~/stores/pagination';
import Pagination from '~/components/admin/Pagination.vue';
import SearchBar from '~/components/admin/SearchBar.vue';
import { categoryMapping } from '~/utils/categoryMapping';
import { useAuthStore } from '~/stores/auth';

const paginationStore = usePaginationStore();
const totalPages = computed(() => paginationStore.totalPages);
const currentPage = computed(() => paginationStore.currentPage);
const pages = computed(() => paginationStore.visiblePages);

const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();

const inquiries = ref([]);
const totalCount = ref(0);
const searchQuery = ref('');

const getInitialCategory = () => {
  const searchType = route.query.s;
  if(!searchType) return '통합검색';
  const category = Object.entries(categoryMapping).find(([key, value]) => value === searchType)?.[0];
  return category || '통합검색';
};

// 문의 목록 조회
const fetchInquiries = async (page = 1) => {
  try {
    const params = {
      page: page - 1,
      size: 15,
      ...(searchQuery.value && { k: searchQuery.value }),
      ...(route.query.s && { s: route.query.s })
    };

    const queryString = new URLSearchParams(params).toString();
    const responseData = await $fetch(`${apiBase}/admin/inquiry?${queryString}`, {
      credentials: 'include',
      headers: {
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` })
      }
    });

    inquiries.value = responseData.content || [];
    totalCount.value = responseData.totalElements || 0;

    paginationStore.setPagination({
      currentPage: page,
      totalPages: responseData.totalPages || 1,
      hasPrevPage: page > 1,
      hasNextPage: page < (responseData.totalPages || 1)
    });


  } catch(error) {
    console.error("문의 목록 조회 실패: ", error);
    paginationStore.setPagination({
      currentPage: page,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false
    });
  }
};

// 페이지 변경
const changePage = async (page) => {
  if (page < 1 || page > paginationStore.totalPages) return;

  router.push({
    query: {
      p: page,
      ...(searchQuery.value && { k: searchQuery.value }),
      ...(route.query.s && { s: route.query.s })
    }
  });

  await fetchInquiries(page);
};

// 검색
const handleSearch = async (searchData) => {
  searchQuery.value = searchData.query;

  paginationStore.setPagination({
    currentPage: 1,
    totalPages: paginationStore.totalPages,
    hasPrevPage: false,
    hasNextPage: paginationStore.hasNextPage
  });

  router.push({
    query: {
      p: 1,
      ...(searchData.query ? { k: searchData.query } : {}),
      s: searchData.categoryCode || 'ALL'
    }
  });

  await fetchInquiries(1);
};

onMounted(async () => {
  searchQuery.value = route.query.k || '';
  const page = parseInt(route.query.p) || 1;
  await fetchInquiries(page);

  watch(() => route.query, async (newQuery) => {
    const newPage = parseInt(newQuery.p) || 1;
    searchQuery.value = newQuery.k || '';
    await fetchInquiries(newPage);
  }, { deep: true });
});

</script>

<style lang="css" scoped>
@import url("/public/css/admin/inquiry/index.css");
</style>