<template>
  <div class="feed__info-inner">
    <!-- 사용자 정보 영역 -->
    <div class="feed__user">
      <div class="feed__user-profile">
        <img 
          v-if="feed.writerProfileImage" 
          :src="getProfileImageUrlForFeed()" 
          alt="feed.writer"
          @error="handleProfileImageError"
        />
        <span>{{ feed.writer }}</span>
      </div>
      
      <!-- 피드별 독립적인 드롭다운 -->
      <div class="dropdown" v-if="authStore.isAuthenticated">
        <button @click="toggleDropdown">
          <i class='bx bx-dots-horizontal-rounded'></i>
        </button>
        <!-- 본인 글: 수정/삭제 -->
        <ul v-if="isDropdownOpen && isMyFeed" class="dropdown-list">
          <li><button @click="handleEdit">수정</button></li>
          <li><button @click.prevent="feedRemove">삭제</button></li>
        </ul>
        <!-- 다른사람 글 or 비로그인: 신고/취소 -->
        <ul v-if="isDropdownOpen && !isMyFeed" class="dropdown-list">
          <li><button @click="handleReport">신고</button></li>
          <li><button @click="toggleDropdown">취소</button></li>
        </ul>
        
        <!-- 삭제 모달 -->
        <div v-if="isDeleteFeedModalVisible" class="feed-modal" @click.self="closeModalOnOutsideClick">
          <div class="feed-modal__contents">
            <h2 class="feed-modal__text">피드를 삭제하시겠습니까?</h2>
            <div class="feed-modal__buttons">
              <button @click.prevent="closeDeleteModal" class="feed-modal__cancel">취소</button>
              <button @click.prevent="deleteFeed" class="feed-modal__delete">삭제</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 영역 -->
    <div class="feed__image-container" v-if="feed.images && feed.images.length > 0">
      <div class="feed__image-slider">
        <img 
          :src="`${apiBase}${feed.images[currentImageIndex].imagePath}`"
          :alt="feed.content" 
          @error="handleImageError"
        />
      </div>
      <!-- 이전 버튼 -->
      <button 
        v-if="canGoPrev"
        class="feed__image-nav feed__image-nav--prev"
        @click="prevImage"
      >
        <i class='bx bx-chevron-left'></i>
      </button>

      <!-- 다음 버튼 -->
      <button 
        v-if="canGoNext"
        class="feed__image-nav feed__image-nav--next"
        @click="nextImage"
      >
        <i class='bx bx-chevron-right'></i>
      </button>

      <!-- 인디케이터 -->
      <div class="feed__image-indicators" v-if="hasMultipleImages">
        <span 
          v-for="(image, index) in feed.images" 
          :key="index"
          :class="['feed__image-indicator', { active: index === currentImageIndex }]"
        ></span>
      </div>
    </div>

    <!-- 아이콘 영역 -->
    <div class="feed__icons">
      <!-- 좋아요 - 피드별 독립적 -->
      <div class="feed__icons-column">
        <button class="feed__like-icon" @click="handleToggleLike">
          <i :class="['icon', localFeed.isLiked ? 'bx bxs-heart' : 'bx bx-heart', { likeCheck: localFeed.isLiked }]" />
        </button>
        <span>{{ localFeed.likeCount }}</span>
      </div>
      
      <!-- 댓글 - 피드별 독립적 -->
      <div class="feed__icons-column">
        <button class="feed__comment-icon" @click="toggleComment">
          <i class='bx bx-comment base-icon-style'></i>
        </button>
        <span>{{ localFeed.commentCount }}</span>
      </div>
    </div>

    <!-- 내용 영역 -->
    <div class="feed__content">
      <div class="feed__text">
        {{ feed.content }}
      </div>
      <!-- TODO: 해시태그 추출 로직 추가 필요 -->
      <div class="feed__tags" v-if="feed.tags && feed.tags.length > 0">
        <a v-for="tag in feed.tags" :key="tag">#{{ tag }}</a>
      </div>
    </div>

    <!-- 푸터 영역 -->
    <div class="feed__footer">
      <button class="feed__comment-icon" @click.stop="toggleComment">댓글 모두 보기</button>
      <a><span>{{ formatTimeAgo(feed.writeDate) }}</span></a>
    </div>

    <!-- 댓글 영역 - API 연동 -->
    <div v-if="isCommentVisible" class="comment">
      <div class="comment__divider"></div>

      <div class="comment__count-wrap">
        <span class="comment__label">댓글</span>
        <span class="comment__count">{{ comments.length }}</span>
      </div>

      <!-- 댓글 목록 - API에서 가져온 실제 데이터 -->
      <div class="comment__list">
        <div v-for="comment in comments" :key="comment.id" class="comment__item">
          <div class="comment__content-wrap">
            <div class="comment__profile">
              <!-- <img :src="comment.memberProfileImage" /> -->
            </div>
            <div class="comment__details">
              <div class="comment__info">
                <span class="comment__username">{{ comment.memberNickname }}</span>
                <span class="comment__time">{{ formatTimeAgo(comment.writeDate) }}</span>
              </div>
              <div class="comment__text">
                <span>{{ comment.content }}</span>
              </div>
            </div>
          </div>
          
          <!-- 댓글 드롭다운 -->
          <div class="dropdown">
            <button @click.stop="toggleCommentDropdown(comment.id)">
              <i class='bx bx-dots-horizontal-rounded'></i>
            </button>
            <ul v-if="activeCommentDropdown === comment.id" class="dropdown-list">
              <li>
                <button class="dropdown-reply" @click="openReplyForm(comment.id)">답글</button>
              </li>
              <li>
                <button class="dropdown__report" @click.stop="openReportModal(comment.id)">신고</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 댓글 작성 영역 - API 연동 -->
      <div class="comment__form-wrap">
        <form class="comment__form" @submit.prevent="handleSubmitComment">
          <input 
            type="text" 
            v-model="newCommentContent"
            placeholder="댓글 달기..." 
            class="comment__input" 
          />
          <button type="submit" class="comment__submit">게시</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRuntimeConfig } from '#app';
import { useFeedStore } from '~/stores/feed';
import { useAuthStore } from '~/stores/auth';
import { useProfileImage } from '~/composables/useProfileImage';
import { useDateUtils } from '~/composables/useDateUtils';

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const props = defineProps({
  feed: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['delete', 'update', 'report']);
const { getProfileImageUrl } = useProfileImage();
const { formatTimeAgo } = useDateUtils();

// pinia store 사용
const feedStore = useFeedStore();
const authStore = useAuthStore();

const isMyFeed = computed(() => {
  return authStore.user.nickname === props.feed.writer;
});

const getProfileImageUrlForFeed = () => {
  if(isMyFeed.value) {
    return authStore.profileImageUrl;
  } else {
    return getProfileImageUrl(props.feed.writerProfileImage);
  }
};

// 로컬 피드 상태 (좋아요 수 등 실시간 업데이트용)
const localFeed = reactive({ 
  ...props.feed,
  likeCount: Math.max(props.feed.likeCount || 0, 0),
  commentCount: Math.max(props.feed.commentCount || 0, 0)
});

const handleProfileImageError = (e) => {
  console.error("프로필 이미지 로드 실패: ", {
    src: e.target.src,
    writerProfileImage: props.feed.writerPforileImage,
    writer: props.feed.writer
  });

  e.target.src = `${apiBase}/uploads/images/user/basic.png`;
};

// 각 피드별 독립적인 상태
const isDropdownOpen = ref(false);
const isDeleteFeedModalVisible = ref(false);
const isCommentVisible = ref(false);
const activeCommentDropdown = ref(null);
const isReplyFormOpen = ref(false);

// 이미지 슬라이드 상태
const currentImageIndex = ref(0);
const imageCount = computed(() => props.feed.images?.length || 0);
const hasMultipleImages = computed(() => imageCount.value > 1);
const canGoPrev = computed(() => currentImageIndex.value > 0);
const canGoNext = computed(() => currentImageIndex.value < imageCount.value - 1);

// 댓글 관련 상태
const comments = ref([]);
const newCommentContent = ref('');
const loadingComments = ref(false);

// ===== 드롭다운 관련 =====
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const feedRemove = () => {
  isDropdownOpen.value = false;
  isDeleteFeedModalVisible.value = true;
};

const deleteFeed = async () => {
  emit('Delete feed: ', props.feed.feedId);
  isDeleteFeedModalVisible.value = false;
};

const closeDeleteModal = () => {
  isDeleteFeedModalVisible.value = false;
};

const closeModalOnOutsideClick = (e) => {
  if (e.target === e.currentTarget) {
    isDeleteFeedModalVisible.value = false;
  };
};

const handleEdit = () => {
  // TODO: 피드 수정 페이지로 이동
  console.log('Edit feed:', props.feed.feedId);
};

// 신고
const handleReport = () => {
  isDropdownOpen.value = false;
  emit('report', props.feed.feedId);
}

// ===== 좋아요 관련 =====
const handleToggleLike = async () => {
  const currentIsLiked = localFeed.isLiked;
  const success = await feedStore.toggleLike(props.feed.feedId, currentIsLiked);

  if (success) {
    localFeed.isLiked = !currentIsLiked;
    localFeed.likeCount = Math.max((localFeed.likeCount || 0) + (currentIsLiked ? -1 : 1), 0);  // ✅ 음수 방지

    console.log('좋아요 클릭 후:', {
      'localFeed.isLiked': localFeed.isLiked,
      'localFeed.likeCount': localFeed.likeCount
    });
  }
};

// ===== 댓글 관련 =====
const toggleComment = async () => {
  isCommentVisible.value = !isCommentVisible.value;
  
  // 댓글창 열 때 API로 댓글 조회
  if (isCommentVisible.value && comments.value.length === 0) {
    await loadComments();
  }
};

// 댓글 목록 로드
const loadComments = async () => {
  loadingComments.value = true;
  try {
    comments.value = await feedStore.fetchComments(props.feed.feedId);
  } catch (error) {
    console.error('댓글 로드 실패:', error);
  } finally {
    loadingComments.value = false;
  }
};

// 댓글 작성
const handleSubmitComment = async () => {
  if (!newCommentContent.value.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  try {
    const newComment = await feedStore.createComment(props.feed.feedId, newCommentContent.value)
    if (newComment) {
      comments.value.push(newComment);
      localFeed.commentCount += 1;
      newCommentContent.value = '';
    }
  } catch (error) {
    alert('댓글 작성에 실패했습니다.');
  }
};

// 댓글 드롭다운
const toggleCommentDropdown = (commentId) => {
  activeCommentDropdown.value = activeCommentDropdown.value === commentId ? null : commentId;
};

const openReplyForm = (commentId) => {
  // TODO: 대댓글 기능 구현
  console.log('Reply to comment:', commentId);
};

// ===== 외부 클릭 감지 =====
const handleOutsideClick = (e) => {
  if (!e.target.closest('.dropdown')) {
    isDropdownOpen.value = false;
    activeCommentDropdown.value = null;
  }
};

const prevImage = () => {
  if (canGoPrev.value) {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (canGoNext.value) {
    currentImageIndex.value++;
  }
};

const handleImageError = (e) => {
  console.error('이미지 로드 실패: ', e.target.src);
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
})
</script>

<style scoped>
@import url('public/css/feed/index.css');
@import url('public/css/feed/report-modal.css');
</style>