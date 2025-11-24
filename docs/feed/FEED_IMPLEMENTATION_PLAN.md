# 📱 피드 기능 프론트엔드 구현 실행계획

> **목표**: 하드코딩된 피드 페이지를 실제 API와 연동하여 동작하는 기능으로 완성

---

## 📊 현재 상태 분석

### ❌ 문제점
- **pages/feed/index.vue**: 완전히 하드코딩된 더미 데이터
- **pages/feed/reg.vue**: API 호출 없이 console.log만 출력
- **pages/feed/my.vue**: 미구현
- **pages/feed/like.vue**: 미구현
- 모든 컴포넌트가 독립적인 상태 관리 없음
- API 연동 로직 전무

### ✅ 백엔드 준비 상태
- 피드 조회 API (전체, 카테고리별) ✅
- 피드 작성 API ✅
- 피드 수정/삭제 API ✅
- 좋아요 API ✅
- 댓글 CRUD API ✅

---

## 🎯 구현 순서 및 우선순위

### Phase 1: 기본 구조 및 Composable 생성 (1-2일)
- [ ] API 연동을 위한 Composable 작성
- [ ] 타입 정의 (TypeScript Interface)
- [ ] 공통 컴포넌트 분리

### Phase 2: 피드 목록 조회 기능 (2-3일)
- [ ] 전체 피드 목록 조회
- [ ] 무한 스크롤 구현
- [ ] 카테고리 필터링
- [ ] 로딩 상태 처리

### Phase 3: 피드 작성 기능 (1-2일)
- [ ] 이미지 업로드 API 연동
- [ ] 카테고리 매핑
- [ ] 유효성 검증
- [ ] 성공 후 목록 페이지로 이동

### Phase 4: 상호작용 기능 (2-3일)
- [ ] 좋아요/좋아요 취소
- [ ] 댓글 작성/조회
- [ ] 댓글 수정/삭제
- [ ] 대댓글 (답글)

### Phase 5: 마이페이지 기능 (1-2일)
- [ ] 내가 작성한 피드
- [ ] 내가 좋아요한 피드
- [ ] 피드 수정/삭제

### Phase 6: 검색 및 최적화 (1-2일)
- [ ] 검색 기능
- [ ] 이미지 최적화
- [ ] 에러 처리 개선

---

## 📁 파일 구조

```
EPIK_Frontend/
├── composables/
│   ├── useFeed.js              # 피드 관련 로직
│   ├── useFeedComment.js       # 댓글 관련 로직
│   └── useFeedLike.js          # 좋아요 관련 로직
├── components/
│   └── feed/
│       ├── FeedCard.vue        # 개별 피드 카드
│       ├── FeedList.vue        # 피드 목록
│       ├── CommentSection.vue  # 댓글 섹션
│       ├── CommentItem.vue     # 개별 댓글
│       └── FeedCreateForm.vue  # 피드 작성 폼 (옵션)
├── pages/
│   └── feed/
│       ├── index.vue           # 전체 피드 목록
│       ├── my.vue              # 내 피드
│       ├── like.vue            # 좋아요한 피드
│       └── reg.vue             # 피드 작성
└── types/
    └── feed.ts                 # 타입 정의 (선택사항)
```

---

## 🔧 Phase 1: 기본 구조 및 Composable 생성

### 1.1 타입 정의 (선택사항)

**파일**: `types/feed.ts`

```typescript
// 피드 타입
export interface Feed {
  feedId: number
  writer: string
  writeDate: string
  likeCount: number
  commentCount: number
  content: string
  comments: Comment[]
  imageSaveName: string[]
  isLiked: boolean
  categoryId: number
  categoryName: string
}

// 댓글 타입
export interface Comment {
  commentId: number
  writer: string
  writeDate: string
  content: string
}

// 피드 작성 DTO
export interface FeedCreateDto {
  content: string
  categoryId: number
}

// 카테고리 매핑
export const CATEGORY_MAP = {
  popup: 1,
  concert: 2,
  musical: 3,
  exhibition: 4
} as const
```

### 1.2 피드 Composable 작성

**파일**: `composables/useFeed.js`

```javascript
export const useFeed = () => {
  const feeds = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const lastId = ref(null)
  const error = ref(null)

  // 카테고리 매핑
  const CATEGORY_MAP = {
    popup: 1,
    concert: 2,
    musical: 3,
    exhibition: 4
  }

  /**
   * 피드 목록 조회
   * @param {number|null} categoryId - 카테고리 ID (null이면 전체 조회)
   * @param {boolean} refresh - true면 목록 초기화
   */
  const fetchFeeds = async (categoryId = null, refresh = false) => {
    if (loading.value) return
    if (!hasMore.value && !refresh) return

    try {
      loading.value = true
      error.value = null

      // refresh면 초기화
      if (refresh) {
        feeds.value = []
        lastId.value = null
        hasMore.value = true
      }

      // API URL 결정
      const baseUrl = categoryId 
        ? `/feed/category/${categoryId}` 
        : '/feed'
      
      // 쿼리 파라미터
      const params = lastId.value ? `?lastId=${lastId.value}` : ''
      
      const { data } = await useAuthFetch(`${baseUrl}${params}`, {
        method: 'GET'
      })

      if (data.value && data.value.length > 0) {
        feeds.value.push(...data.value)
        // 마지막 피드 ID 저장
        lastId.value = data.value[data.value.length - 1].feedId
        // 15개 미만이면 더 이상 데이터 없음
        hasMore.value = data.value.length === 15
      } else {
        hasMore.value = false
      }
    } catch (e) {
      console.error('피드 조회 실패:', e)
      error.value = '피드를 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  /**
   * 피드 작성
   * @param {Object} feedData - { content, categoryId }
   * @param {File[]} files - 이미지 파일 배열
   */
  const createFeed = async (feedData, files) => {
    try {
      loading.value = true
      error.value = null

      // FormData 생성
      const formData = new FormData()
      
      // DTO를 JSON Blob으로 추가
      const dto = {
        content: feedData.content,
        categoryId: feedData.categoryId
      }
      formData.append('request', new Blob([JSON.stringify(dto)], { 
        type: 'application/json' 
      }))

      // 이미지 파일 추가
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('files', file)
        })
      }

      const { data } = await useAuthFetch('/feed', {
        method: 'POST',
        body: formData
      })

      return data.value // 생성된 피드 ID 반환
    } catch (e) {
      console.error('피드 작성 실패:', e)
      error.value = '피드 작성에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 피드 삭제
   * @param {number} feedId - 피드 ID
   */
  const deleteFeed = async (feedId) => {
    try {
      loading.value = true
      error.value = null

      await useAuthFetch(`/feed/${feedId}`, {
        method: 'DELETE'
      })

      // 로컬 상태에서도 제거
      feeds.value = feeds.value.filter(feed => feed.feedId !== feedId)
    } catch (e) {
      console.error('피드 삭제 실패:', e)
      error.value = '피드 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 피드 수정
   * @param {number} feedId - 피드 ID
   * @param {Object} updateData - { content, categoryId }
   */
  const updateFeed = async (feedId, updateData) => {
    try {
      loading.value = true
      error.value = null

      await useAuthFetch(`/feed/${feedId}`, {
        method: 'PATCH',
        body: updateData
      })

      // 로컬 상태 업데이트
      const index = feeds.value.findIndex(feed => feed.feedId === feedId)
      if (index !== -1) {
        feeds.value[index].content = updateData.content
        feeds.value[index].categoryId = updateData.categoryId
      }
    } catch (e) {
      console.error('피드 수정 실패:', e)
      error.value = '피드 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    feeds,
    loading,
    hasMore,
    error,
    CATEGORY_MAP,
    fetchFeeds,
    createFeed,
    deleteFeed,
    updateFeed
  }
}
```

### 1.3 좋아요 Composable 작성

**파일**: `composables/useFeedLike.js`

```javascript
export const useFeedLike = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * 좋아요 토글
   * @param {Object} feed - 피드 객체 (참조로 전달되어 직접 수정됨)
   */
  const toggleLike = async (feed) => {
    if (loading.value) return

    try {
      loading.value = true
      error.value = null

      const isCurrentlyLiked = feed.isLiked

      if (isCurrentlyLiked) {
        // 좋아요 취소
        await useAuthFetch(`/feed/${feed.feedId}/like`, {
          method: 'DELETE'
        })
        feed.isLiked = false
        feed.likeCount--
      } else {
        // 좋아요
        await useAuthFetch(`/feed/${feed.feedId}/like`, {
          method: 'POST'
        })
        feed.isLiked = true
        feed.likeCount++
      }
    } catch (e) {
      console.error('좋아요 처리 실패:', e)
      error.value = '좋아요 처리에 실패했습니다.'
      
      // 롤백 (낙관적 업데이트 실패 시)
      feed.isLiked = !feed.isLiked
      feed.likeCount += feed.isLiked ? 1 : -1
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    toggleLike
  }
}
```

### 1.4 댓글 Composable 작성

**파일**: `composables/useFeedComment.js`

```javascript
export const useFeedComment = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * 댓글 목록 조회
   * @param {number} feedId - 피드 ID
   */
  const fetchComments = async (feedId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await useAuthFetch(`/feed/${feedId}/comment`, {
        method: 'GET'
      })

      return data.value || []
    } catch (e) {
      console.error('댓글 조회 실패:', e)
      error.value = '댓글을 불러오는데 실패했습니다.'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 댓글 작성
   * @param {number} feedId - 피드 ID
   * @param {string} content - 댓글 내용
   */
  const createComment = async (feedId, content) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await useAuthFetch(`/feed/${feedId}/comment`, {
        method: 'POST',
        body: { content }
      })

      return data.value // 생성된 댓글 ID
    } catch (e) {
      console.error('댓글 작성 실패:', e)
      error.value = '댓글 작성에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 댓글 수정
   * @param {number} feedId - 피드 ID
   * @param {number} commentId - 댓글 ID
   * @param {string} content - 수정할 내용
   */
  const updateComment = async (feedId, commentId, content) => {
    try {
      loading.value = true
      error.value = null

      await useAuthFetch(`/feed/${feedId}/comment/${commentId}`, {
        method: 'PATCH',
        body: { content }
      })
    } catch (e) {
      console.error('댓글 수정 실패:', e)
      error.value = '댓글 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 댓글 삭제
   * @param {number} feedId - 피드 ID
   * @param {number} commentId - 댓글 ID
   */
  const deleteComment = async (feedId, commentId) => {
    try {
      loading.value = true
      error.value = null

      await useAuthFetch(`/feed/${feedId}/comment/${commentId}`, {
        method: 'DELETE'
      })
    } catch (e) {
      console.error('댓글 삭제 실패:', e)
      error.value = '댓글 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment
  }
}
```

---

## 🎨 Phase 2: 피드 목록 조회 기능

### 2.1 FeedCard 컴포넌트 생성

**파일**: `components/feed/FeedCard.vue`

```vue
<template>
  <div class="feed__info-inner">
    <!-- 사용자 정보 -->
    <div class="feed__user">
      <div class="feed__user-profile">
        <span>{{ feed.writer }}</span>
      </div>
      
      <!-- 드롭다운 (본인 피드일 때만 표시) -->
      <div class="dropdown" v-if="isMyFeed">
        <button @click="toggleDropdown">
          <i class='bx bx-dots-horizontal-rounded'></i>
        </button>
        <ul v-if="isDropdownOpen" class="dropdown-list">
          <li><button @click="handleEdit">수정</button></li>
          <li><button @click="handleDelete">삭제</button></li>
        </ul>
      </div>
    </div>

    <!-- 이미지 -->
    <div class="feed__image" v-if="feed.imageSaveName && feed.imageSaveName.length > 0">
      <img :src="`/api/v1/images/feed/${feed.imageSaveName[0]}`" :alt="feed.writer" />
    </div>

    <!-- 좋아요/댓글 아이콘 -->
    <div class="feed__icons">
      <div class="feed__icons-column">
        <button class="feed__like-icon" @click="handleLikeClick">
          <i :class="['icon', feed.isLiked ? 'bx bxs-heart' : 'bx bx-heart', { likeCheck: feed.isLiked }]" />
        </button>
        <span>{{ feed.likeCount }}</span>
      </div>
      
      <div class="feed__icons-column">
        <button class="feed__comment-icon" @click="toggleComment">
          <i class='bx bx-comment base-icon-style'></i>
        </button>
        <span>{{ feed.commentCount }}</span>
      </div>
    </div>

    <!-- 내용 -->
    <div class="feed__content">
      <div class="feed__text">{{ feed.content }}</div>
      <div class="feed__tags">
        <a>#{{ feed.categoryName }}</a>
      </div>
    </div>

    <!-- 푸터 -->
    <div class="feed__footer">
      <button class="feed__comment-icon" @click="toggleComment">
        댓글 모두 보기
      </button>
      <span>{{ formatDate(feed.writeDate) }}</span>
    </div>

    <!-- 댓글 섹션 -->
    <CommentSection 
      v-if="isCommentVisible" 
      :feedId="feed.feedId"
      :comments="feed.comments"
      @comment-added="handleCommentAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeedLike } from '@/composables/useFeedLike'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  feed: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'edit', 'comment-added'])

const authStore = useAuthStore()
const { toggleLike } = useFeedLike()

// 로컬 상태
const isDropdownOpen = ref(false)
const isCommentVisible = ref(false)

// 본인 피드인지 확인 (닉네임으로 비교 - 추후 memberId로 변경)
const isMyFeed = computed(() => {
  return authStore.user?.nickname === props.feed.writer
})

// 드롭다운 토글
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 댓글 토글
const toggleComment = () => {
  isCommentVisible.value = !isCommentVisible.value
}

// 좋아요 클릭
const handleLikeClick = async () => {
  await toggleLike(props.feed)
}

// 수정
const handleEdit = () => {
  emit('edit', props.feed)
  isDropdownOpen.value = false
}

// 삭제
const handleDelete = () => {
  emit('delete', props.feed.feedId)
  isDropdownOpen.value = false
}

// 댓글 추가됨
const handleCommentAdded = () => {
  props.feed.commentCount++
  emit('comment-added')
}

// 날짜 포맷
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  
  return date.toLocaleDateString('ko-KR')
}
</script>
```

### 2.2 피드 목록 페이지 수정

**파일**: `pages/feed/index.vue`

```vue
<template>
  <section class="feed">
    <!-- 헤더 -->
    <div class="feed__header">
      <h1 class="feed__title">feed</h1>
      <form class="feed__form" @submit.prevent="handleSearch">
        <input 
          class="feed__input" 
          type="text" 
          v-model="searchKeyword"
          placeholder="검색어를 입력해주세요"
        >
        <label for="feed-search">
          <i class='bx bx-search'></i>
        </label>
      </form>
    </div>

    <!-- 메뉴 -->
    <div class="feed__menu">
      <div class="feed__menu-column">
        <RouterLink 
          to="/feed" 
          exact 
          :class="{ 'is-inactive': currentRoute !== '/feed' }"
        >
          <span :class="{ 'is-active': currentRoute === '/feed' }">all</span>
        </RouterLink>

        <RouterLink 
          to="/feed/my" 
          exact 
          :class="{ 'is-inactive': currentRoute !== '/feed/my' }"
        >
          <span :class="{ 'is-active': currentRoute === '/feed/my' }">my</span>
        </RouterLink>
      </div>

      <div class="feed__menu-column">
        <span 
          :class="{ 'is-active': selectedCategory === null }"
          @click="filterByCategory(null)"
        >
          all
        </span>
        <span 
          :class="{ 'is-active': selectedCategory === CATEGORY_MAP.popup }"
          @click="filterByCategory(CATEGORY_MAP.popup)"
        >
          pop-up
        </span>
        <span 
          :class="{ 'is-active': selectedCategory === CATEGORY_MAP.concert }"
          @click="filterByCategory(CATEGORY_MAP.concert)"
        >
          concert
        </span>
        <span 
          :class="{ 'is-active': selectedCategory === CATEGORY_MAP.musical }"
          @click="filterByCategory(CATEGORY_MAP.musical)"
        >
          musical
        </span>
        <span 
          :class="{ 'is-active': selectedCategory === CATEGORY_MAP.exhibition }"
          @click="filterByCategory(CATEGORY_MAP.exhibition)"
        >
          exhibition
        </span>
      </div>
    </div>

    <!-- 피드 목록 -->
    <div class="feed__container">
      <div class="feed__info-wrap">
        <!-- 로딩 -->
        <div v-if="loading && feeds.length === 0" class="feed__loading">
          로딩 중...
        </div>

        <!-- 피드 카드 -->
        <FeedCard 
          v-for="feed in feeds" 
          :key="feed.feedId"
          :feed="feed"
          @delete="handleDeleteFeed"
          @edit="handleEditFeed"
        />

        <!-- 더보기 -->
        <div v-if="hasMore && !loading" class="feed__load-more">
          <button @click="loadMore">더보기</button>
        </div>

        <!-- 데이터 없음 -->
        <div v-if="!loading && feeds.length === 0" class="feed__empty">
          피드가 없습니다.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeed } from '@/composables/useFeed'
import FeedCard from '@/components/feed/FeedCard.vue'

const route = useRoute()
const router = useRouter()
const currentRoute = computed(() => route.path)

const { 
  feeds, 
  loading, 
  hasMore, 
  error,
  CATEGORY_MAP,
  fetchFeeds,
  deleteFeed 
} = useFeed()

const selectedCategory = ref(null)
const searchKeyword = ref('')

// 초기 로드
onMounted(async () => {
  await fetchFeeds()
  // 무한 스크롤 이벤트 등록
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 카테고리 필터링
const filterByCategory = async (categoryId) => {
  selectedCategory.value = categoryId
  await fetchFeeds(categoryId, true) // refresh = true
}

// 더보기
const loadMore = async () => {
  await fetchFeeds(selectedCategory.value, false)
}

// 무한 스크롤
const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  
  // 스크롤이 바닥에서 100px 이내면 더 로드
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    if (!loading.value && hasMore.value) {
      loadMore()
    }
  }
}

// 검색 (추후 구현)
const handleSearch = () => {
  console.log('검색:', searchKeyword.value)
  // TODO: 검색 API 구현 후 연동
}

// 피드 삭제
const handleDeleteFeed = async (feedId) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await deleteFeed(feedId)
      alert('삭제되었습니다.')
    } catch (e) {
      alert('삭제에 실패했습니다.')
    }
  }
}

// 피드 수정 (추후 구현)
const handleEditFeed = (feed) => {
  console.log('수정:', feed)
  // TODO: 수정 페이지로 이동 또는 모달 열기
}
</script>

<style scoped>
@import url('public/css/feed/index.css');

.feed__loading,
.feed__empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.feed__load-more {
  text-align: center;
  padding: 20px;
}

.feed__load-more button {
  padding: 10px 30px;
  background-color: #EA3921;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.feed__menu-column span {
  cursor: pointer;
  padding: 10px;
}

.feed__menu-column span.is-active {
  color: #EA3921;
  font-weight: bold;
}
</style>
```

---

## 📝 Phase 3: 피드 작성 기능

### 3.1 피드 작성 페이지 수정

**파일**: `pages/feed/reg.vue`

기존 코드에서 `submit` 함수만 수정:

```javascript
const submit = async () => {
  // 유효성 검증
  if (!content.value.trim()) {
    alert('내용을 입력해주세요.')
    return
  }
  
  if (!selectedCategory.value) {
    alert('카테고리를 선택해주세요.')
    return
  }
  
  if (thumbnails.value.length === 0) {
    alert('이미지를 최소 1장 선택해주세요.')
    return
  }

  try {
    // Composable 사용
    const { createFeed, CATEGORY_MAP } = useFeed()
    
    // 실제 파일 객체 배열 가져오기
    const fileInput = document.getElementById('imageUpload')
    const files = Array.from(fileInput.files)
    
    // API 호출
    const feedId = await createFeed({
      content: content.value,
      categoryId: CATEGORY_MAP[selectedCategory.value]
    }, files)
    
    alert('피드가 등록되었습니다!')
    
    // 피드 목록으로 이동
    await navigateTo('/feed')
    
  } catch (error) {
    console.error('등록 실패:', error)
    alert('피드 등록에 실패했습니다.')
  }
}
```

---

## ⚡ Phase 4: 상호작용 기능

### 4.1 CommentSection 컴포넌트

**파일**: `components/feed/CommentSection.vue`

```vue
<template>
  <div class="comment">
    <div class="comment__divider"></div>

    <div class="comment__count-wrap">
      <span class="comment__label">댓글</span>
      <span class="comment__count">{{ comments.length }}</span>
    </div>

    <!-- 댓글 목록 -->
    <div class="comment__list">
      <CommentItem 
        v-for="comment in comments" 
        :key="comment.commentId"
        :comment="comment"
        :feedId="feedId"
        @delete="handleDeleteComment"
        @update="handleUpdateComment"
      />
    </div>

    <!-- 댓글 작성 -->
    <div class="comment__form-wrap">
      <form class="comment__form" @submit.prevent="handleSubmit">
        <input 
          type="text" 
          v-model="newComment"
          placeholder="댓글 달기..." 
          class="comment__input" 
        />
        <button type="submit" class="comment__submit">게시</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFeedComment } from '@/composables/useFeedComment'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  feedId: {
    type: Number,
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['comment-added'])

const { createComment, deleteComment, updateComment } = useFeedComment()
const newComment = ref('')

// 댓글 작성
const handleSubmit = async () => {
  if (!newComment.value.trim()) {
    alert('댓글을 입력해주세요.')
    return
  }

  try {
    await createComment(props.feedId, newComment.value)
    newComment.value = ''
    emit('comment-added')
    // 새로고침 또는 댓글 목록 다시 조회
    location.reload() // 임시 - 추후 상태 관리로 개선
  } catch (error) {
    alert('댓글 작성에 실패했습니다.')
  }
}

// 댓글 삭제
const handleDeleteComment = async (commentId) => {
  if (confirm('댓글을 삭제하시겠습니까?')) {
    try {
      await deleteComment(props.feedId, commentId)
      location.reload() // 임시
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.')
    }
  }
}

// 댓글 수정
const handleUpdateComment = async (commentId, content) => {
  try {
    await updateComment(props.feedId, commentId, content)
    location.reload() // 임시
  } catch (error) {
    alert('댓글 수정에 실패했습니다.')
  }
}
</script>
```

---

## 📋 작업 체크리스트

### Phase 1: 기본 구조 ✅
- [ ] `types/feed.ts` 생성
- [ ] `composables/useFeed.js` 생성
- [ ] `composables/useFeedLike.js` 생성
- [ ] `composables/useFeedComment.js` 생성

### Phase 2: 피드 목록 ✅
- [ ] `components/feed/FeedCard.vue` 생성
- [ ] `pages/feed/index.vue` API 연동
- [ ] 무한 스크롤 구현
- [ ] 카테고리 필터링 구현

### Phase 3: 피드 작성 ✅
- [ ] `pages/feed/reg.vue` API 연동
- [ ] FormData 전송 테스트
- [ ] 이미지 업로드 테스트

### Phase 4: 상호작용 ✅
- [ ] `components/feed/CommentSection.vue` 생성
- [ ] `components/feed/CommentItem.vue` 생성
- [ ] 좋아요 기능 테스트
- [ ] 댓글 CRUD 테스트

### Phase 5: 마이페이지
- [ ] `pages/feed/my.vue` 구현
- [ ] `pages/feed/like.vue` 구현

---

## 🚨 주의사항

### 1. 이미지 경로
```javascript
// ❌ 잘못된 경로
<img :src="feed.imageSaveName[0]" />

// ✅ 올바른 경로
<img :src="`/api/v1/images/feed/${feed.imageSaveName[0]}`" />
```

### 2. FormData 전송
```javascript
// DTO를 JSON Blob으로 전송해야 함
formData.append('request', new Blob([JSON.stringify(dto)], { 
  type: 'application/json' 
}))
```

### 3. 카테고리 ID 매핑
```javascript
const CATEGORY_MAP = {
  popup: 1,     // 백엔드 DB의 category_id
  concert: 2,
  musical: 3,
  exhibition: 4
}
```

### 4. 인증 필요 API
로그인하지 않으면 `useAuthFetch`가 401 에러 발생
- 피드 작성
- 피드 수정/삭제
- 좋아요
- 댓글 작성/수정/삭제

---

## 🎯 다음 단계

1. **Phase 1 완료 후**: Composable이 제대로 동작하는지 테스트
2. **Phase 2 완료 후**: 피드 목록이 실제 데이터로 표시되는지 확인
3. **Phase 3 완료 후**: 피드 작성 후 목록에 나타나는지 확인
4. **Phase 4 완료 후**: 좋아요/댓글 기능 테스트

각 Phase 완료 시 Git 커밋하여 진행 상황 저장!

---

## 📞 문제 발생 시

- CORS 에러: 백엔드 CORS 설정 확인
- 401 에러: JWT 토큰 확인
- 404 에러: API 경로 확인
- 이미지 안 보임: 이미지 경로 및 백엔드 정적 리소스 설정 확인
