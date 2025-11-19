<template>
  <div class="feed__wrap">
    <!-- 업로드 이미지 -->
    <div class="uploadImage-container">
      <div class="select-image" ref="selectImageDiv">
        <img v-if="selectedImage" :src="selectedImage" alt="Selected Image" />
      </div>
      <div class="thumbnail-container" ref="thumbnailContainer" v-show="thumbnails.length > 0">
        <div v-for="(thumbnail, index) in thumbnails" :key="index" class="thumbnail-img" draggable="true"
          @dragstart="dragStart(index)" @dragend="dragEnd" @dragover.prevent @dragenter.prevent="dragEnter($event)"
          @dragleave="dragLeave($event)" @drop.prevent="drop($event, index)">
          <img :src="thumbnail" :alt="`Uploaded Image ${index + 1}`" class="thumbnail" @click="selectImage(index)" />
          <button type="button" class="removeButton" @click="removeImage(index)">
            <i class="fa-regular fa-circle-xmark"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="feed__file">
      <label for="imageUpload" class="file-label" @click="handleFileClick">
        이미지 선택 (최대 4장)
      </label>
      <input 
        class="feed__file-input" 
        id="imageUpload" 
        type="file" 
        accept="image/*" 
        multiple
        @change="handleImageUpload"
        />
    </div>

    <!-- 내용 작성 영역 -->
    <div class="feed__text">
      <!-- <span class="feed__text-label">내용 작성</span> -->
      <div class="feed__textarea-wrap">
        <textarea v-model="content" placeholder="내용을 작성해주세요."></textarea>
      </div>
    </div>

    <!-- 카테고리 선택 영역 -->
    <div class="feed__category-select">
      <span>카테고리 선택</span>
      <div class="feed__radio-items">
        <div v-for="category in categories" :key="category.id" class="feed__radio-item">
          <input type="radio" :id="category.id" v-model="selectedCategory" :value="category.id" name="category">
          <label :for="category.id">{{ category.label }}</label>
        </div>
      </div>
    </div>

    <!-- 버튼 영역 -->
    <div class="feed__buttons">
      <button @click="cancel">취소</button>
      <button @click="submit">등록</button>
    </div>

    <!-- 모달 -->
    <div v-if="showReuploadModal" class="reupload-modal-overlay" @click="closeReuploadModal">
      <div class="reupload-modal" @click.stop>
        <div class="reupload-modal__content">
          <h3 class="reupload-modal__title">이미지 업로드</h3>
          <p class="reupload-modal__message">
            기존에 업로드된 이미지가 모두 삭제됩니다.<br />
            계속하시겠습니까?
          </p>
          <div class="reupload-modal__buttons">
            <button class="reupload-modal__btn reupload-modal__btn--cancel" @click="closeReuploadModal">
              취소
            </button>
            <button class="reupload-modal__btn reupload-modal__btn--confirm" @click="confirmReupload">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFeedStore } from '~/stores/feed';

const router = useRouter();
const feedStore = useFeedStore();

const thumbnailContainer = ref(null);
const selectImageDiv = ref(null);
const thumbnails = ref([]);
const selectedImage = ref(null);
const content = ref('');
const selectedCategory = ref('');
const files = ref([]);

const categories = [
  { id: 'popup', label: '팝업' },
  { id: 'concert', label: '콘서트' },
  { id: 'musical', label: '뮤지컬' },
  { id: 'exhibition', label: '전시회' },
];

const categoryMapping = {
  'popup': 1,
  'concert': 2,
  'musical': 3,
  'exhibition': 4
};

// 모달 상태 추가
const showReuploadModal = ref(false);
const pendingFiles = ref(null);
const fileInput = ref(null);

let draggedIndex = null;

// 파일 클릭 시 기존 이미지 업로드된 상태면 모달 표시
const handlefileClick = (e) => {
  if(thumbnails.value.length > 0) {
    e.preventDefault();
    showReuploadModal.value = true;
  }
};

// 실제 파일 업로드 처리
const handleImageUpload = (event) => {
  const uploadedFiles = event.target.files;
  if (uploadedFiles.length === 0) return;

  if (uploadedFiles.length > 4) {
    alert('이미지는 최대 4개까지만 업로드할 수 있습니다.');
    event.target.value = '';
    thumbnails.value = [];
    files.value = [];
    return;
  }

  // 실제 file 객체 저장
  files.value = Array.from(uploadedFiles);
  thumbnails.value = [];

  files.value.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnails.value.push(e.target.result);
      if (index === 0) {
        selectedImage.value = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  })
};

// 모달 닫기
const closeReuploadModal = () => {
  showReuploadModal.value = false;
  if(fileInput.value) {
    fileInput.value.value = ''; // input 초기화
  }
};

// 재업로드 확인
const confirmReupload = () => {
  showReuploadModal.value = false;
  if(fileInput.value) {
    fileInput.value.click(); // 파일 선택 창 열기
  }
};

// 파일 선택
const selectImage = (index) => {
  selectedImage.value = thumbnails.value[index];
};

// 파일 삭제: files 배열도 함께 제거
const removeImage = (index) => {
  thumbnails.value.splice(index, 1);
  files.value.splice(index, 1); // 실제 파일도 제거

  if (thumbnails.value.length === 0) {
    selectedImage.value = null;
  } else if (selectedImage.value === thumbnails.value[index]) {
    selectedImage.value = thumbnails.value[0];
  }
};

// 드래그 앤 드롭 관련 함수
const dragStart = (index) => {
  draggedIndex = index;
  setTimeout(() => {
    thumbnailContainer.value.children[index].style.opacity = '0.5';
  }, 0);
};

const dragEnd = () => {
  setTimeout(() => {
    thumbnailContainer.value.children[draggedIndex].style.opacity = '1';
    draggedIndex = null;
  }, 0);
};

const dragEnter = (event) => {
  event.target.closest('.thumbnail-img').classList.add('drag-over');
};

const dragLeave = (event) => {
  event.target.closest('.thumbnail-img').classList.remove('drag-over');
};

const drop = (event, index) => {
  event.target.closest('.thumbnail-img').classList.remove('drag-over');
  if (draggedIndex !== null && draggedIndex !== index) {
    const tempThumbnail = thumbnails.value[draggedIndex];
    thumbnails.value.splice(draggedIndex, 1);
    thumbnails.value.splice(index, 0, tempThumbnail);

    // 실제 파일 순서도 변경
    const tempFile = files.value[draggedIndex];
    files.value.splice(draggedIndex, 1);
    files.value.splice(index, 0, tempFile);
  }
};

const cancel = () => {
  content.value = '';
  selectedCategory.value = '';
  thumbnails.value = [];
  selectedImage.value = null;
  files.value = [];
  router.push('/feed');
};

const submit = async () => {
  // 유효성 검사
  if(!content.value.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  if(!selectedCategory.value) {
    alert("카테고리를 선택해주세요.");
    return;
  }

  if(files.value.length === 0) {
    alert("이미지를 최소 1장 이상 업로드해주세요.");
    return;
  }

  try {
    const formData = new FormData();
    const feedDto = {
      content: content.value,
      categoryId: categoryMapping[selectedCategory.value]
    };

    // JSON을 Blob로 변환하여 추가
    formData.append('request', new Blob([JSON.stringify(feedDto)], {
      type: 'application/json'
    }));

    // 이미지 파일 추가
    files.value.forEach((file) => {
      formData.append('files', file);
    });

    // API 호출
    const feedId = await feedStore.createFeed(formData);
    if(feedId) {
      feedStore.resetFeeds();
      localStorage.removeItem('feedStore');

      alert("피드가 등록되었습니다.");
      await router.push('/feed');
    }

  } catch(error) {
    console.error("피드 등록 실패: ", error);
    alert("피드 등록에 실패했습니다. 다시 시도해주세요.");
  }
};

onMounted(() => {

});
</script>

<style scoped>
.feed__wrap {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 492px;
  margin: 0 auto;
  /* margin-top: 43px; */
  padding: 40px 0;
  /* padding-bottom: 40px; */
}

/* ******** 업로드한 이미지 미리보기 영역 ******** */

/* ############# 메인 컨테이너 ############# */
.uploadImage-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
}

/* ############# 대표사진 컨테이너 ############# */
.select-image {
  overflow: hidden;
  width: 380px;
  height: 380px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* ############# 대표사진 스타일 ############# */
.select-image img {
  width: 100%;
  /* 너비를 100%로 설정하여 슬라이더에 맞춤 */
  height: 100%;
  /* 높이도 100%로 설정하여 슬라이더에 맞춤 */
  object-fit: cover;
  /* 이미지 비율 유지 및 크기 맞춤, 잘림 방지 */
}

/* 업로드 사진 미리보기 영역 */
.thumbnail-container {
  width: 380px;
  height: 100px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  border: 1px solid #bbbbbb;
  padding: 5px;
  box-sizing: border-box;
  overflow: hidden;
  /* margin-bottom: 20px; */
}

/* ############# 미리 보기 영역안의 각각의 사진 ############# */
.thumbnail {
  width: 100%;
  height: 88px;
  object-fit: cover;
  /* 비율을 유지하며 크기 맞춤 */
}

.drag-over {
  border: 2px dashed #000;
}





/* ******** infut file 버튼 스타일 변경 ********  */

.feed__file {
  margin-top: 10px;
}

.feed__file-input {
  display: none;
}

.file-label {
  display: block;
  width: 380px;
  padding: 10px;
  font-size: 14px;
  text-align: center;
  background-color: #efefef;
  color: #686868;
  border: 1px solid #bbbbbb;
  font-family: 'pretendard-regular';
  cursor: pointer;
  border-radius: 8px;
  transition: opacity linear 0.1s;
}

.feed__text {
  margin-top: 15px;
}

.feed__text-label {
  font-family: 'pretendard-regular';
  text-indent: 100px;
  font-size: 14px;
}

.feed__textarea-wrap textarea {
  width: 380px;
  height: 260px;
  resize: none;
  margin-top: 5px;
  border-radius: 8px;
  border: 1px solid #bbbbbb;
  padding: 15px;
}

.feed__textarea-wrap textarea::placeholder {
  font-family: 'pretendard-medium';
  font-size: 14px;
}

.feed__category-select {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  margin-left: 58px;
  margin-top: 17px;
  font-family: 'pretendard-medium';
  font-size: 14px;
}

.feed__radio-items {
  display: flex;
}

.feed__radio-item {
  padding: 10px 0px;
  padding-right: 10px;
}

.feed__radio-item input[type=radio] {
  display: none;
}

.feed__radio-item input[type=radio]+label {
  display: block;
  cursor: pointer;
  height: 30px;
  width: 70px;
  border: 1px solid #222222;
  border-radius: 8px;
  line-height: 30px;
  text-align: center;
  background-color: transparent;
  color: #333;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.feed__radio-item input[type=radio]:checked+label {
  background-color: #EA3921;
  color: #fff;
}

/* ********버튼 스타일******** */
.feed__buttons {
  width: 380px;
  border-top: 1px solid #d9d9d9;
  margin-top: 20px;
  padding: 20px 0;
  display: flex;
  justify-content: center;;
  gap: 10px;
}

.feed__buttons button {
  width: 180px;
  height: 40px;
  font-size: 14px;
  background-color: #d9d9d9;
  border: 1px solid #bbbbbb;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.feed__buttons button:hover {
  background-color: #EA3921;
}

/* 이미지 삭제 버튼 */
.thumbnail-img {
  position: relative;
}

.thumbnail-img:nth-child(1) button {
  position: absolute;
  right: 1px;
  top: 5px;
  border: none;
  background-color: transparent;
}

.thumbnail-img:nth-child(2) button {
  position: absolute;
  right: 1px;
  top: 5px;
  border: none;
  background-color: transparent;
}

.thumbnail-img:nth-child(3) button {
  position: absolute;
  right: 1px;
  top: 5px;
  border: none;
  background-color: transparent;
}

.thumbnail-img:nth-child(4) button {
  position: absolute;
  right: 1px;
  top: 5px;
  border: none;
  background-color: transparent;
}

.thumbnail-img button i {
  color: white;
  /* 아이콘 색상 설정 */
  width: 15px;
  height: 15px;
}

/* 모달 오버레이 */
.reupload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 모달 */
.reupload-modal {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.reupload-modal__content {
  text-align: center;
}

.reupload-modal__title {
  font-family: 'pretendard-semibold';
  font-size: 20px;
  margin-bottom: 15px;
  color: #222;
}

.reupload-modal__message {
  font-family: 'pretendard-regular';
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 25px;
}

.reupload-modal__buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.reupload-modal__btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'pretendard-semibold';
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.reupload-modal__btn--cancel {
  background-color: #f0f0f0;
  color: #666;
}

.reupload-modal__btn--cancel:hover {
  background-color: #e0e0e0;
}

.reupload-modal__btn--confirm {
  background-color: #EA3921;
  color: white;
}

.reupload-modal__btn--confirm:hover {
  background-color: #d63419;
}

</style>