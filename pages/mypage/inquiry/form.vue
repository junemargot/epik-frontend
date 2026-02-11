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
            <label for="image-upload" class="image-uploader">
              <span class="camera-icon">
                <i class='bx bx-camera'></i>
              </span>
            </label>
            <input type="file" id="image-upload" @change="handleImageUpload" multiple hidden />
            <div class="image-upload-notes">
              <p>* 30MB 이하의 이미지만 업로드 가능합니다.</p>
              <p>* 컨텐츠와 무관한 내용이거나 음란 및 불법적인 내용은 통보없이 삭제될 수 있습니다.</p>
              <p>* 사진은 최대 8장까지 등록가능합니다.</p>
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
          <button type="submit" class="btn btn-primary">등록</button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Backend에서 가져온 카테고리 데이터 구조
const categories = {
  "회원/이벤트": [
    { enumName: 'MEMBER_INFO', description: '회원정보' },
    { enumName: 'EVENT_PARTICIPATION', description: '이벤트내용/참여' },
    { enumName: 'ACCOUNT_ISSUES', description: '회원가입/탈퇴' },
  ],
  "서비스/오류/기타": [
    { enumName: 'SYSTEM_ERROR', description: '시스템오류/장애' },
    { enumName: 'SERVICE_SUGGESTION', description: '서비스 제안/개선' },
    { enumName: 'INFO_CORRECTION', description: '정보수정요청' },
    { enumName: 'ETC', description: '기타(직접입력)' },
  ],
  "비즈니스/광고": [
    { enumName: 'BUSINESS_INQUIRY', description: '비즈니스 문의' },
    { enumName: 'ADVERTISING_INQUIRY', description: '광고 문의' },
  ],
};

const parentCategories = Object.keys(categories);

// Form state
const selectedParentCategory = ref('');
const selectedChildCategory = ref('');
const title = ref('');
const content = ref('');
const images = ref([]);
const receiveEmail = ref(false);

// 사용자 이메일 (실제로는 로그인 상태에서 가져와야 함)
const userEmail = ref('user@example.com');

// 1단계 선택에 따른 2단계 카테고리 필터링
const childCategories = computed(() => {
  return selectedParentCategory.value ? categories[selectedParentCategory.value] : [];
});

watch(selectedParentCategory, () => {
  selectedChildCategory.value = ''; // 1단계 바뀌면 2단계 초기화
});

const handleImageUpload = (event) => {
  // TODO: 이미지 업로드 처리 로직
  console.log(event.target.files);
};

const submitInquiry = () => {
  // TODO: 폼 제출 로직
  console.log({
    parent: selectedParentCategory.value,
    child: selectedChildCategory.value,
    title: title.value,
    content: content.value,
    receiveEmail: receiveEmail.value,
  });
  // await $api.post(...);
};

const goBack = () => {
  router.back();
};

</script>

<style scoped>
@import url('/public/css/mypage/form.css');
</style>