<template>
  <div class="main-wrap">
    <section class="board">
      <div class="board__header">
        <h1>피드 Feed</h1>
        <p>총 게시물수 {{ totalCount }}</p>
      </div>   
      <div class="board__container">
        <div class="board__list">
          <!-- 헤더 -->
          <div class="board__head">
            <div class="board__no">번호</div>
            <div class="board__category">카테고리</div>
            <div class="board__content">내용</div>
            <div class="board__feed-text">피드 본문</div>
            <div class="board__writer">작성자</div>
            <div class="board__writeDate">작성일</div>
            <div class="board__commentCount">댓글수</div>
            <div class="board__like">좋아요</div>
            <div class="board__status">상태</div>
            <div class="board__management">게시물관리</div>
          </div>

          <!-- 로딩 중 -->
          <div v-if="isLoading" class="board__body">
            <div class="board__loading">로딩 중...</div>
          </div>

          <!-- 데이터 없음 -->
          <div v-else-if="feeds.length === 0" class="board__body">
            <div class="board__empty">등록된 피드가 없습니다.</div>
          </div>
          
          <!-- 피드 목록 -->
          <div class="board__body">
            <div class="board__content" v-for="(feed, index) in feeds" :key="feed.id">
              <div class="board__content-summary">
                <div class="board__no">{{ feed.id }}</div>
                <div class="board__category">{{ feed.category }}</div>
                <!-- 내용 (클릭 시 아코디언 열림)-->
                <div class="board__content" @click="toggleDetails(index)">
                  {{ getPreview(feed.content) }}
                  <button class="board__title-detail">
                    <i :class="['bx', visibleDetails[index] ? 'bx-chevron-down' : 'bx-chevron-up', { 'rotate-icon': visibleDetails[index] }]"></i>
                  </button>
                </div>
                <!-- 피드 본문 아이콘 (새 탭 열기)-->
                <div class="board__feed-text">
                  <a :href="`/feed?feedId=${feed.id}`" target="_blank" @click.stop>
                    <i class='bx bx-file'></i>
                  </a>  
                </div>
                <div class="board__writer">{{ feed.writer }}</div>
                <div class="board__writeDate">{{ formatDate(feed.writeDate) }}</div>
                <div class="board__commentCount">{{ feed.commentCount }}</div>
                <div class="board__like">{{ feed.likedCount }}</div>
                <div class="board__status">{{ getStatusText(feed.status) }}</div>
                <div class="board__management">
                  <button class="invisibleBtn" @click.stop="toggleFeedStatus(feed.id, feed.status)">
                    {{ feed.status === 'ACTIVE' ? '비공개' : '공개' }}
                  </button>
                  <button class="deleteBtn" @click.stop="deleteFeed(feed.id)">삭제</button>
                </div>
              </div>
              
              <!-- 아코디언 상세 내용 -->
              <div class="board__details" :style="{ display: visibleDetails[index] ? 'flex' : 'none' }">
                <div class="board__details-contents">
                  <div class="board__details-user-profile">
                    <img 
                      v-if="feed.writerProfileImage"
                      :src="getImageUrl(feed.writerProfileImage)"
                      alt="profile"
                    />
                    <span name="nickname">
                      <strong>{{ feed.writer }}</strong>
                    </span>
                  </div>
                  <div class="board__details-image" v-if="feed.images && feed.images.length > 0">
                    <img v-for="(image, idx) in feed.images" :key="idx" :src="getImageUrl(image)" alt="feed_image">
                  </div>
                  <div class="board__details-text">
                    <p>{{ feed.content }}</p>
                  </div>
                  <!-- 태그 (추후 구현) -->
                  <div class="board__details-tags" v-if="feed.tags && feed.tags.length > 0">
                    <span v-for="tag in feed.tags" :key="tag" class="tag-item">{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이징 -->
      <div class="pagination" v-if="!isLoading && totalPages > 0">
        <button type="button" class="page-btn start-page" @click="goToPage(1)" :disabled="!hasPrev">
          <i class='bx bx-chevrons-left'></i>
        </button>
        <button type="button" class="page-btn prev-page" @click="goToPage(currentPage - 1)" :disabled="!hasPrev">
          <i class='bx bx-chevron-left'></i>
        </button>
        
        <button 
          v-for="pageNum in pages" 
          :key="pageNum" 
          type="button" 
          class="page-btn" 
          :class="{ active: pageNum === currentPage }"
          @click="goToPage(pageNum)"
        >
          {{ pageNum }}
        </button>
        
        <button type="button" class="page-btn next-page" @click="goToPage(currentPage + 1)" :disabled="!hasNext">
          <i class='bx bx-chevron-right'></i>
        </button>
        <button type="button" class="page-btn end-page" @click="goToPage(totalPages)" :disabled="!hasNext">
          <i class='bx bx-chevrons-right'></i>
        </button>
      </div>
    </section>
  </div>

  <!-- 검색바 -->
  <section class="search">
    <div class="search__bar">
      <div class="search__dropdown">
        <div id="drop-text" class="search__text" @click="toggleDropdown">
          <span id="span">{{ selectedCategory }}</span>
          <i id="icon" class='bx bx-chevron-down' :style="{ transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)' }"></i>
        </div>
        <ul id="drop-list" class="search__list" :class="{ show: isOpen }">
          <li class="search__item" v-for="item in categories" :key="item" @click="selectCategory(item)">
            {{ item }}
          </li>
        </ul>
      </div>
      <div class="search__box">
        <input type="text" id="search-input" :placeholder="inputPlaceholder" v-model="searchQuery" @keyup.enter="handleSearch" />
        <i class='bx bx-search'></i>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 상태 관리
const feeds = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

// 페이징
const currentPage = ref(1);
const totalCount = ref(0);
const totalPages = ref(0);
const hasNext = ref(false);
const hasPrev = ref(false);
const pages = ref([]);

// 아코디언
const visibleDetails = ref([]);

// 검색
const categories = ['통합검색', '내용', '작성자'];
const selectedCategory = ref('통합검색');
const inputPlaceholder = ref('검색어를 입력해주세요');
const searchQuery = ref('');
const isOpen = ref(false);

// API 호출
const fetchFeeds = async (page = 1, keyword = '', searchType = '') => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    let url = `${apiBase}/admin/feed?p=${page}`;
    if (keyword && searchType) {
      url += `&k=${encodeURIComponent(keyword)}&s=${searchType}`;
    }
    console.log('API 요청 URL: ', url);
    
    const response = await $fetch(url);
    console.log('API 응답:', response); // 디버깅용
    if(!response) {
      throw new Error("응답 데이터가 없습니다.");
    }

    // feedList가 배열인지 확인
    feeds.value = Array.isArray(response.feedList) ? response.feedList : [];
    totalCount.value = response.totalCount || 0;
    totalPages.value = response.totalPages || 0;
    hasNext.value = response.hasNext || false;
    hasPrev.value = response.hasPrev || false;
    pages.value = Array.isArray(response.pages) ? response.pages : [];
    currentPage.value = page;
    
    // 아코디언 상태 초기화
    visibleDetails.value = Array(response.feedList.length).fill(false);
    
  } catch (error) {
    console.error('피드 목록 조회 실패:', error);
    console.error('에러 상세:', error.message);

    errorMessage.value = '피드를 불러오는 중 오류가 발생했습니다.';
    
    // 에러 시 안전한 기본값 설정
    feeds.value = [];
    totalCount.value = 0;
    totalPages.value = 0;
    hasNext.value = false;
    hasPrev.value = false;
    pages.value = [];
    visibleDetails.value = [];

  } finally {
    isLoading.value = false;
  }
};

// 이미지 URL 생성 (추가!)
const getImageUrl = (imgValue) => {
  if (!imgValue) {
    return `${apiBase}/uploads/images/user/basic.png`;
  }

  // 소셜 로그인 프로필 (외부 URL)
  if (imgValue.startsWith('http://') || imgValue.startsWith('https://')) {
    return imgValue;
  }

  // uploads/로 시작하는 경우
  if (imgValue.startsWith('uploads/')) {
    return `${apiBase}/uploads/${imgValue.substring('uploads/'.length)}`;
  }

  // basic.png 또는 파일명만 있는 경우
  if (imgValue === 'basic.png' || !imgValue.includes('/')) {
    return `${apiBase}/uploads/images/user/${imgValue}`;
  }

  // 나머지 경우 (슬래시로 시작하는 경로)
  return `${apiBase}${imgValue}`;
};

// 아코디언 토글 함수
const toggleDetails = (index) => {
  visibleDetails.value[index] = !visibleDetails.value[index];
};

// 아코디언 토글
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// 페이지 이동
const goToPage = (page) => {
  if(page < 1 || page > totalPages.value) return;

  const searchType = getSearchType();
  fetchFeeds(page, searchQuery.value, searchType);

  router.push({
    query: {
      p: page,
      ...(searchQuery.value && { k: searchQuery.value, s: searchType })
    }
  });
};

// 검색 타입 반환
const getSearchType = () => {
  const typeMap = {
    '통합검색': 'all',
    '내용': 'content',
    '작성자': 'wrtier'
  };
  return typeMap[selectedCategory.value] || 'all';
};

// 검색 실행
const handleSearch = () => {
  const searchType = getSearchType();
  fetchFeeds(1, searchQuery.value, searchType);
};

// 내용 미리보기
const getPreview = (content) => {
  if(!content) return '';
  return content.length > 30 ? content.substring(0, 30) + '...' : content;
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// 상태 텍스트
const getStatusText = (status) => {
  const statusMap = {
    'ACTIVE': '정상',
    'HIDDEN': '비공개',
    'DELETED': '삭제'
  };
  return statusMap[status] || status;
};

// 상태 변경
const toggleFeedStatus = async (feedId, currentStatus) => {
  if (!confirm('피드 상태를 변경하시겠습니까?')) return;
  
  try {
    // TODO: API 구현 필요
    alert('상태 변경 기능은 구현 예정입니다.');
  } catch (error) {
    console.error('상태 변경 실패:', error);
    alert('상태 변경에 실패했습니다.');
  }
};

// 삭제
const deleteFeed = async (feedId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    // TODO: API 구현 필요
    alert('삭제 기능은 구현 예정입니다.');
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('삭제에 실패했습니다.');
  }
};


const selectCategory = (category) => {
  selectedCategory.value = category;
  updatePlaceholder(category);
  isOpen.value = false; // 선택 후 드롭다운 클로즈
};

const updatePlaceholder = (category) => {
  if(category === '통합검색') {
    inputPlaceholder.value = '검색어를 입력해주세요';
  } else if(category === '아이디') {
    inputPlaceholder.value = `검색할 ${category}를 입력해주세요`;
  } else if(category === '닉네임'){
    inputPlaceholder.value = `검색할 ${category}을 입력해주세요`;
  } else {
    inputPlaceholder.value = `검색할 ${category}을 입력해주세요`;
  }
};

// 클릭 외부 영역 처리
const handleClickOutside = (e) => {
  if(!e.target.closest('.search')) {
    isOpen.value = false;
  }
};

// 초기화
onMounted(() => {
  const page = parseInt(route.query.p) || 1;
  const keyword = route.query.k || '';
  const searchType = route.query.s || '';
  
  if (keyword && searchType) {
    searchQuery.value = keyword;
    const categoryMap = {
      'all': '통합검색',
      'content': '내용',
      'writer': '작성자'
    };
    selectedCategory.value = categoryMap[searchType] || '통합검색';
  }
  
  fetchFeeds(page, keyword, searchType);
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});


</script>

<style lang="css" scoped>
@import url('/public/css/admin/feed/index.css');
</style>