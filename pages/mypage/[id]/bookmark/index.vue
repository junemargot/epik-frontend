<template>
  <div class="bookmark" @click="handleOutsideClick">
    <div class="bookmark__header">
      <div class="bookmark__title-container">
        <h1 class="bookmark__heading">BOOKMARK</h1>
      </div>
      <hr class="bookmark__divider">
      <ul class="bookmark__nav">
        <li 
          class="bookmark__nav-item" 
          v-for="section in sections" 
          :key="section.key"
          :class="{ 'active': currentSection === section.key }"
        >
          <a 
            href="#" 
            @click.prevent="currentSection = section.key"
            :class="{ 'active': currentSection === section.key }"
          >
            {{ section.label }}
          </a>
        </li>
      </ul>
      <hr class="bookmark__divider">
    </div>

    <div class="bookmark__content">
      <div class="bookmark__edit-container">
        <div class="bookmark__edit" v-if="!editMode" @click.stop="toggleEditMode">편집</div>
        <div class="bookmark__edit-options" v-else>
          <span class="bookmark__select-all" @click="toggleSelectAll">
            {{  isAllSelected ? '전체 해제' : '전체 선택' }}
          </span> |
          <span class="bookmark__remove" @click="showDeleteConfirmation">삭제</span>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="bookmark__loading">
        <p>로딩 중...</p>
      </div>
      
      <!-- 데이터가 없을 때 -->
      <div v-else-if="!hasAnyBookmarks" class="bookmark__empty">
        <p>북마크한 항목이 없습니다.</p>
      </div>

      <!-- 북마크 콘텐츠 -->
      <div v-else>
        <div 
          class="bookmark__popup"
          v-for="section in displaySections"
          :key="section.key"
        >
          <div class="bookmark__section" v-if="section.items.length > 0">
            <div class="bookmark__header-container" v-if="currentSection === 'All'">
              <h2>{{ section.label }}</h2>
            </div>
            <div class="bookmark__grid">
              <div 
                class="bookmark__item" 
                v-for="item in section.items"
                :key="item.id"
                @click="handleItemClick(item, section.key)"
              >
                <div class="bookmark__image-container">
                  <img 
                    :src="getImageUrl(item, section.key)" 
                    :alt="item.title"
                    @error="handleImageError"
                  >
                </div>
                <div class="bookmark__info">
                  <h3>{{ item.title }}</h3>
                  <div class="bookmark__location-date">
                    <div class="bookmark__text-container">
                      <p class="bookmark__location">{{ item.venue }}</p>
                      <p class="bookmark__date">
                        {{ formatDate(item.startDate) }} ~ {{ formatDate(item.endDate) }}
                      </p>
                    </div>
                    <div class="bookmark__checkbox-container" v-if="editMode">
                      <input 
                        type="checkbox" 
                        class="bookmark__checkbox" 
                        v-model="item.selected" 
                        @click.stop
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 삭제 확인 모달 -->
      <Modal v-model="showDeleteModal">
        <div class="delete-confirmation">
          <h2>삭제 확인</h2>
          <p>선택한 항목을 삭제하시겠습니까?</p>
          <div class="modal-buttons">
            <button @click="confirmDelete">확인</button>
            <button @click="cancelDelete">취소</button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 편집 모드 상태
const editMode = ref(false);
const loading = ref(true);
const lastClickTime = ref(0);
const showDeleteModal = ref(false);

const currentSection = ref('All');
const memberId = computed(() => route.params.id);

// 섹션 목록
const sections = [
  { key: 'All', label: 'All' },
  { key: 'popup', label: 'Pop-up' },
  { key: 'concert', label: 'Concert' },
  { key: 'musical', label: 'Musical' },
  { key: 'exhibition', label: 'Exhibition' },
];

// 각 타입별 북마크 데이터
const bookmarkData = ref({
  popup: [],
  concert: [],
  musical: [],
  exhibition: []
});

// 특정 타입의 북마크 데이터 가져오기
const fetchBookmarkByType = async (type) => {
  try {
    const response = await $fetch(`${apiBase}/member/${type}/${memberId.value}/bookmark`, {
      method: 'GET',
      credentials: 'include',
    });

    console.log(`${type} 북마크 데이터: `, response);

    // selected 필드만 추가
    return response.map(item => ({
      ...item,
      selected: false
    }));
  } catch (error) {
    console.error(`${type} 북마크 조회 실패:` , error);
    return [];
  }
};

// 모든 북마크 데이터 가져오기
const fetchAllBookmarks = async () => {
  loading.value = true;

  try {
    const [popup, concert, musical, exhibition] = await Promise.all([
      fetchBookmarkByType('popup'),
      fetchBookmarkByType('concert'),
      fetchBookmarkByType('musical'),
      fetchBookmarkByType('exhibition'),
    ]);
  
    bookmarkData.value = { popup, concert, musical, exhibition };
  } catch (error) {
    console.error('북마크 데이터 로드 실패: ', error);
  } finally {
    loading.value = false;
  }
};

// 표시할 섹션 계산
const displaySections = computed(() => {
  if(currentSection.value === 'All') {
    return sections.slice(1).map(section => ({
      ...section,
      items: bookmarkData.value[section.key] || []
    }));
  } else {
    return [{
      key: currentSection.value,
      label: sections.find(s => s.key === currentSection.value)?.label || currentSection.value,
      items: bookmarkData.value[currentSection.value] || []
    }];
  }
});

// 북마크가 있는지 여부 확인
const hasAnyBookmarks = computed(() => {
  return Object.values(bookmarkData.value).some(items => items.length > 0);
});

// 전체 선택 여부 확인
const isAllSelected = computed(() => {
  if(currentSection.value === 'All') {
    const allItems = Object.values(bookmarkData.value).flat();
    return allItems.length > 0 && allItems.every(item => item.selected);
  } else {
    const items = bookmarkData.value[currentSection.value];
    return items.length > 0 && items.every(item => item.selected);
  }
});

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// 이미지 URL
const getImageUrl = (item, type) => {
  console.log(`getImageUrl 호출 - type: ${type}`, item);

  if (!item) {
    console.log('item이 null입니다.');
    return null;
  }

  const imageName = item.fileSavedName || item.imgSavedName || item.saveImageName || item.imageFileName;
  console.log(`imageName: ${imageName}, dataSource: ${item.dataSource}`);

  // KOPIS API 데이터인 경우
  if (imageName && (imageName.startsWith('PF_') || item.dataSource === 'KOPIS_API')) {
    const url = item.poster || item.kopisPoster || item.imageUrl || null;
    console.log('KOPIS 이미지 URL:', url);
    return url;
  }

  // 일반 업로드 이미지
  if (imageName && !imageName.startsWith('http') && !imageName.startsWith('PF_')) {
    const url = `${apiBase}/uploads/images/${type}/${imageName}`;
    console.log('업로드 이미지 URL:', url);
    return url;
  }

  console.log('이미지 URL을 생성할 수 없습니다');
  return null;
};

// 이미지 에러 처리
const handleImageError = (event) => {
  console.log('이미지 로드 실패:', event.target.src);
  event.target.style.display = 'none';
};

const handleItemClick = (item, type) => {
  if (editMode.value) {
    item.selected = !item.selected;
  } else {
    // 상세 페이지로 이동
    router.push(`/${type}/${item.id}`);
  }
};

// 편집 모드 토글
const toggleEditMode = (event) => {
  if (event) event.stopPropagation();
  editMode.value = !editMode.value;

  if (!editMode.value) {
    Object.values(bookmarkData.value).forEach(items => {
      items.forEach(item => item.selected = false);
    });
  }
};

// 전체 선택/해제 토글
const toggleSelectAll = () => {
  const shouldSelect = !isAllSelected.value;
  
  if (currentSection.value === 'All') {
    Object.values(bookmarkData.value).forEach(items => {
      items.forEach(item => item.selected = shouldSelect);
    });
  } else {
    const items = bookmarkData.value[currentSection.value];
    items.forEach(item => item.selected = shouldSelect);
  }
};

// 삭제 확인 모달 표시
const showDeleteConfirmation = () => {
  const hasSelected = Object.values(bookmarkData.value)
    .some(items => items.some(item => item.selected));
  
  if (!hasSelected) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }
  
  showDeleteModal.value = true;
};

// 삭제 확인
const confirmDelete = async () => {
  try {
    const deletePrimises = [];

    Object.entries(bookmarkData.value).forEach(([type, items]) => {
      const selectedItems = items.filter(item => item.selected);
      
      selectedItems.forEach(item => {
        const { toggleBookmark } = useBookmark(type);
        deletePromises.push(toggleBookmark(item.id));
      });
    });

    await Promise.all(deletePromises);
    await fetchAllBookmarks();

    showDeleteModal.value = false;
    editMode.value = false;

    alert('선택한 항목이 삭제되었습니다.');
  } catch (error) {
    console.error('북마크 삭제 실패: ', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
};

// 삭제 취소
const cancelDelete = () => {
  showDeleteModal.value = false;
};

// 컴포넌트 마운트
onMounted(async () => {
  await fetchAllBookmarks();
});

</script>

<style scoped>
@import url('/public/css/mypage/bookmark.css');
</style>