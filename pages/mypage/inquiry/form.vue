<template>
  <main class="mypage-wrap">
    <section class="inquiry-wrap">
      <h1 class="inquiry__title">1:1 문의 작성</h1>

      <form @submit.prevent="submitInquiry" class="inquiry-form">
        <!-- Inquiry Category -->
        <div class="form-row">
          <label class="form-label" for="parent-category">유형<span class="required">*</span></label>
          <div class="form-controls category-selects">
            <div class="custom-select-wrapper">
              <select id="parent-category" v-model="selectedParentCategory" class="form-select">
                <option disabled value="">문의유형을 선택해주세요</option>
                <option v-for="parent in parentCategories" :key="parent" :value="parent">
                  {{ parent }}
                </option>
              </select>
            </div>
            <div class="custom-select-wrapper">
              <select id="child-category" v-model="selectedChildCategory" :disabled="!selectedParentCategory" class="form-select">
                <option disabled value="">상세유형을 선택해주세요</option>
                <option v-for="child in childCategories" :key="child.enumName" :value="child.enumName">
                  {{ child.description }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Title -->
        <div class="form-row">
          <label class="form-label" for="inquiry-title">제목<span class="required">*</span></label>
          <div class="form-controls">
            <input type="text" id="inquiry-title" v-model="title" class="form-input" placeholder="제목을 입력해주세요." />
          </div>
        </div>

        <!-- Content -->
        <div class="form-row">
          <label class="form-label" for="inquiry-content">내용<span class="required">*</span></label>
          <div class="form-controls">
            <textarea id="inquiry-content" v-model="content" class="form-textarea" placeholder="문의내용을 입력해주세요."></textarea>
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-row">
          <label class="form-label">이미지 업로드</label>
          <div class="form-controls">
            <div class="image-preview-list">
              <div v-for="(preview, index) in imagePreview" :key="index" class="image-preview-item">
                <img :src="preview" class="image-preview-img" />
                <button type="button" class="image-preview-remove" @click="removeImage(index)">&times;</button>
              </div>
              <label v-if="images.length < 6" for="image-upload" class="image-uploader">
                <span class="camera-icon">
                  <i class='bx bx-camera'></i>
                </span>
              </label>
            </div>
            <input type="file" id="image-upload" @change="handleImageUpload" multiple hidden />
            <div class="image-upload-notes">
              <p>* 30MB 이하의 이미지만 업로드 가능합니다.</p>
              <p>* 컨텐츠와 무관한 내용이거나 음란 및 불법적인 내용은 통보없이 삭제될 수 있습니다.</p>
              <p>* 사진은 최대 6장까지 등록가능합니다.</p>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Email Reception -->
        <div class="form-row">
          <label class="form-label">답변 수신</label>
          <div class="form-controls email-reception">
            <input type="email" :value="userEmail" class="form-input" disabled />
            <label class="checkbox-label">
              <input type="checkbox" v-model="receiveEmail" class="form-checkbox" />
              이메일로 받기
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">취소</button>
          <button type="submit" class="btn btn-primary" @click="handleSubmit">등록</button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();

// 카테고리 조회
const { data: categories, error: categoryError } = await useAuthFetch('/member/inquiry/categories');
if(categoryError.value) {
  console.error("카테고리 조회 실패: ", categoryError.value);
}

// Form state
const selectedParentCategory = ref('');
const selectedChildCategory = ref('');
const title = ref('');
const content = ref('');
const images = ref([]);
const receiveEmail = ref(false);
const userEmail = computed(() => authStore.user.email || '');

const parentCategories = computed(() => {
  if(!categories.value) return [];
  const keys = Object.keys(categories.value);
  console.log('parentCategories computed: ', keys);
  return keys;
});

// 2단계 카테고리 필터링
const childCategories = computed(() => {
  if(!selectedParentCategory.value || !categories.value) return [];
  const children = categories.value[selectedParentCategory.value] || [];
  console.log(`childCategories for ${selectedParentCategory.value}:`, children);
  return children;
});

watch(selectedParentCategory, (newVal) => {
  console.log('selectedParentCategory changed to:', newVal);
  selectedChildCategory.value = '';
});

const imagePreview = ref([]);

// 이미지 업로드 핸들러
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const totalCount = images.value.length + files.length;

  if(totalCount > 6) {
    alert("이미지는 최대 6장까지 업로드 가능합니다.");
    return;
  }

  const validFiles = files.filter(file => {
    const maxSize = 30 * 1024 * 1024; // 30MB
    if(file.size > maxSize) {
      alert(`${file.name}은 30MB를 초과합니다.`);
      return false;
    }
    return true;
  });

  validFiles.forEach(file => {
    images.value.push(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.value.push(event.target.result);
    };
    reader.readAsDataURL(file);
  });

  e.target.value = '';
};

const removeImage = (index) => {
  images.value.splice(index, 1);
  imagePreview.value.splice(index, 1);
}

// 폼 제출
const loading = ref(false);

const handleSubmit = async () => {
  if(!selectedChildCategory.value || !title.value || !content.value) {
    alert("필수 항목을 모두 입력해주세요.");
    return;
  }

  loading.value = true;
  try {
    const formData = new FormData();

    // request를 JSON Blob로 추가
    const requestDto = {
      title: title.value,
      content: content.value,
      category: selectedChildCategory.value,
      receiveEmailAnswer: receiveEmail.value
    };
    formData.append('request', new Blob([JSON.stringify(requestDto)], {
      type: 'application/json'
    }));

    images.value.forEach(file => {
      formData.append('images', file);
    });

    await useAuthFetch(`/member/inquiry`, {
      method: 'POST',
      body: formData,
    });

    alert("문의가 등록되었습니다.");
    router.push('/mypage/inquiry');
  } finally {
    loading.value = false;
  }
};

// 취소
const goBack = () => {
  if(confirm('작성 중인 내용이 삭제됩니다. 취소하시겠습니까?')) {
    router.back();
  }
};

</script>

<style scoped>
@import url('/public/css/mypage/form.css');
</style>