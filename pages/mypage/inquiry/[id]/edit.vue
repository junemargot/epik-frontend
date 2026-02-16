<template>
  <main class="mypage-wrap">
    <section class="inquiry-wrap">
      <h1 class="inquiry__title">1:1 문의 수정</h1>

      <form @submit.prevent="submitUpdate" class="inquiry-form" v-if="loaded">
        <!-- 카테고리 -->
        <div class="form-row">
          <label class="form-label">유형<span class="required">*</span></label>
          <div class="form-controls category-selects">
            <div class="custom-select-wrapper">
              <select v-model="selectedParentCategory" class="form-select">
                <option disabled value="">문의유형을 선택해주세요</option>
                <option v-for="parent in parentCategories" :key="parent" :value="parent">
                  {{ parent }}
                </option>
              </select>
            </div>
            <div class="custom-select-wrapper">
              <select v-model="selectedChildCategory" :disabled="!selectedParentCategory" class="form-select">
                <option disabled value="">상세유형을 선택해주세요</option>
                <option v-for="child in childCategories" :key="child.enumName" :value="child.enumName">
                  {{ child.description }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 제목 -->
        <div class="form-row">
          <label class="form-label" for="inquiry-title">제목<span class="required">*</span></label>
          <div class="form-controls">
            <input type="text" id="inquiry-title" v-model="title" class="form-input" placeholder="제목을 입력해주세요." />
          </div>
        </div>

        <!-- 내용 -->
        <div class="form-row">
          <label class="form-label" for="inquiry-content">내용<span class="required">*</span></label>
          <div class="form-controls">
            <textarea id="inquiry-content" v-model="content" class="form-textarea" placeholder="문의내용을 입력해주세요."></textarea>
          </div>
        </div>

        <!-- 이미지 -->
        <div class="form-row">
          <label class="form-label">이미지 업로드</label>
          <div class="form-controls">
            <div class="image-preview-list">
              <!-- 기존 이미지 -->
              <div v-for="(img, index) in existingImages" :key="'existing-' + img.id" class="image-preview-item">
                <img :src="`${apiBase}${img.imagePath}`" class="image-preview-img" />
                <button type="button" class="image-preview-remove" @click="removeExistingImage(index)">&times;</button>
              </div>
              <!-- 새 이미지 미리보기 -->
              <div v-for="(preview, index) in newImagePreviews" :key="'new-' + index" class="image-preview-item">
                <img :src="preview" class="image-preview-img" />
                <button type="button" class="image-preview-remove" @click="removeNewImage(index)">&times;</button>
              </div>
              <!-- 업로드 버튼 -->
              <label v-if="existingImages.length + newImages.length < 6" for="image-upload" class="image-uploader">
                <span class="camera-icon">
                  <i class='bx bx-camera'></i>
                </span>
              </label>
            </div>
            <input type="file" id="image-upload" @change="handleImageUpload" multiple hidden accept="image/*" />
            <div class="image-upload-notes">
              <p>* 30MB 이하의 이미지만 업로드 가능합니다.</p>
              <p>* 사진은 최대 6장까지 등록가능합니다.</p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">취소</button>
          <button type="submit" class="btn btn-primary">수정</button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();
const inquiryId = route.params.id;

// 카테고리 조회
const { data: categories, error: categoryError } = await useAuthFetch('/member/inquiry/categories');
if (categoryError.value) {
  console.error('카테고리 조회 실패:', categoryError.value);
}

// 기존 데이터 불러오기
const { data: detail, error } = await useAuthFetch(`/member/inquiry/${inquiryId}`);
if (error.value) {
  console.error('문의 조회 실패:', error.value);
}

const loaded = computed(() => !!detail.value);

// 폼 상태 초기화
const title = ref(detail.value?.title || '');
const content = ref(detail.value?.content || '');
const selectedParentCategory = ref(detail.value?.parentCategory || '');
const selectedChildCategory = ref(detail.value?.category || '');
const existingImages = ref(detail.value?.images ? [...detail.value.images] : []);
const newImages = ref([]);
const newImagePreviews = ref([]);

// 카테고리 computed
const parentCategories = computed(() => {
  if (!categories.value) return [];
  return Object.keys(categories.value);
});

const childCategories = computed(() => {
  if (!selectedParentCategory.value || !categories.value) return [];
  return categories.value[selectedParentCategory.value] || [];
});

// 대분류 변경 시 소분류 초기화 (단, 최초 로드 시에는 유지)
// let isInitialLoad = true;
const initialParent = detail.value?.parentCategory || '';
watch(selectedParentCategory, (newVal, oldVal) => {
  if(oldVal === '' && newVal === initialParent) return;
  selectedChildCategory.value = '';
});

// 기존 이미지 삭제
const removeExistingImage = (index) => {
  console.log('삭제 전:', existingImages.value.length);
  existingImages.value.splice(index, 1);
  console.log('삭제 후:', existingImages.value.length);
};

// 새 이미지 업로드
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const totalCount = existingImages.value.length + newImages.value.length + files.length;

  if (totalCount > 6) {
    alert('이미지는 최대 6장까지 업로드 가능합니다.');
    return;
  }

  const validFiles = files.filter(file => {
    if (file.size > 30 * 1024 * 1024) {
      alert(`${file.name}은 30MB를 초과합니다.`);
      return false;
    }
    return true;
  });

  validFiles.forEach(file => {
    newImages.value.push(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      newImagePreviews.value.push(event.target.result);
    };
    reader.readAsDataURL(file);
  });

  e.target.value = '';
};

// 새 이미지 삭제
const removeNewImage = (index) => {
  newImages.value.splice(index, 1);
  newImagePreviews.value.splice(index, 1);
};

// 수정 제출
const submitUpdate = async () => {
  if (!selectedChildCategory.value || !title.value || !content.value) {
    alert('필수 항목을 모두 입력해주세요.');
    return;
  }

  try {
    const formData = new FormData();

    const requestDto = {
      title: title.value,
      content: content.value,
      category: selectedChildCategory.value,
      keepImageIds: existingImages.value.map(img => img.id)
    };
    
    formData.append('request', new Blob([JSON.stringify(requestDto)], {
      type: 'application/json'
    }));

    newImages.value.forEach(file => {
      formData.append('images', file);
    });

    await $fetch(`${apiBase}/member/inquiry/${inquiryId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        ...(authStore.token && { Authorization: `Bearer ${authStore.token}` })
      },
      body: formData
    });

    alert('문의가 수정되었습니다.');
    router.push('/mypage/inquiry');
  } catch (e) {
    console.error('수정 실패:', e);
    alert('수정에 실패했습니다.');
  }
};

const goBack = () => {
  if (confirm('수정 중인 내용이 삭제됩니다. 취소하시겠습니까?')) {
    router.back();
  }
};
</script>

<style scoped>
@import url('/public/css/mypage/form.css');
</style>