<template>
  <main class="mypage-wrap">
    <section class="memberInfoUpdate__wrap small-wrap">
      <div class="memberInfoUpdate__intro">
        <h1 class="memberInfoUpdate__title intro-title">
          회원정보수정
        </h1>
      </div>

      <div class="memberInfoUpdate__img-wrap">
        <div class="memberInfoUpdate__img">
          <div class="memberInfoUpdate__img-my-box">
            <img 
              class="memberInfoUpdate__img-my" 
              :src="authStore.profileImageUrl" 
              alt="프로필 이미지" 
              @error="handleImageError"
            >
          </div>
          <div class="memberInfoUpdate__edit">
            <div class="memberInfoUpdate__edit-icon-box">
              <label for="inputFile">
                <input type="file" id="inputFile" style="display:none" @change="handleFileChange">
                <i class='bx bx-pencil'></i>
              </label>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="memberInfoUpdate__form gap-mt_2">
        <fieldset class="memberInfoUpdate__idUpdate gap-mb_6 small_text">
          <label>
            <div class="star_top">아이디</div>
            <div class="gap-mt_1">
              <input disabled class="form non_change" type="text" :placeholder="storedUserInfo">
            </div>
          </label>
        </fieldset>

        <fieldset class="sign-in__nickname gap-mb_6 small_text">
          <label>
            <div>닉네임</div>
            <div class="gap-mt_1">
              <input class="nickname form short_form" v-model="nicknameModel" id="nickname" type="text"
                placeholder="20자리 이하를 입력해주세요">
              <button class="btn" type="button" @click="nicknameHandler">확인</button>
            </div>
          </label>
          <div class="message-container">
            <div class="small_text_green" v-if="nicknameCheck">사용 가능한 닉네임입니다.</div>
            <div class="small_text_red" v-if="nicknameCheck===false">사용 불가능한 닉네임입니다.</div>
          </div>
        </fieldset>

        <fieldset class="sign-in__email gap-mb_6 small_text">
          <label>
            <div class="star_top">이메일</div>
            <div class="gap-mt_1">
              <input class="email form short_form" v-model="emailModel" id="email" type="text"
                placeholder="예) epik@epik.com">
              <button class="btn" type="button" @click="emailHandler">인증</button>
            </div>
          </label>

          <label>
            <div class="gap-mt_1">
              <input class="email_check form short_form" v-model="emailCodeModel" type="text" placeholder="인증번호 6자리 입력">
              <button class="btn" type="button" @click="emailCodeHandler">확인</button>
            </div>
          </label>

          <div v-if="emailCodeCheck===true" class="small_text_green">인증번호가 일치합니다.</div>
          <div v-if="emailCodeCheck===false" class="small_text_red">인증번호를 다시 확인해주세요.</div>
        </fieldset>

        <div class="gap-bmt_1">
        <button class="long_btn" type="submit">
          확인
        </button>
      </div>

      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth.js';
import { storeToRefs } from 'pinia';

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();
const { user, isLoggedIn } = storeToRefs(authStore);

const storedUserInfo = ref('');
const nicknameModel = ref('');
const nicknameCheck = ref('');
const emailModel = ref('');
const emailCodeModel = ref('');
const emailCodeCheck = ref('');
const serverVerificationCode = ref('');

const nicknameHandler = async () => {
  try {
    const nicknameCheckDto = {
      nickname: nicknameModel.value
    };

    const response = await useAuthFetch(`${apiBase}/signup/checkNickname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nicknameCheckDto),
    });

    const result = await response.json();
    if(nicknameModel.value === result.nickname){
      nicknameCheck.value = false;
    } else {
      nicknameCheck.value = true;
    }
  } catch(error) {
    console.error("닉네임 확인 오류: ", error);
  }
};

const emailHandler = async () => {
  try {
    const emailCheckDto = {
      email: emailModel.value
    };

    const response = await fetch(`${apiBase}/signup/checkEmail`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailCheckDto)
    });

    const result = await response.json();

    if (result.message === "ok") {
      serverVerificationCode.value = result.verificationCode;
      alert("인증번호가 발송되었습니다.");
      console.log("1-" + result.verificationCode);
      console.log("4-" + serverVerificationCode.value);
    } else if (result.message === "error") {
      alert("이미 사용 중인 이메일입니다.");
    }
  } catch(error) {
    console.error("이메일 확인 오류: ", error);
  }
};

const emailCodeHandler = async () => {
  if (emailCodeModel.value === serverVerificationCode.value) {
    emailCodeCheck.value=true;
  } else {
    emailCodeCheck.value=false;
  }
};

const submitForm = async () => {
  try {
    const userId = user.value.id;
    const infoRequestDto = {
      id: userId,
      nickname: nicknameModel.value,
      email: emailModel.value
    };

    const { data, error: fetchError } = await useAuthFetch('/mypage/info', {
      method: 'POST',
      body: infoRequestDto
    });

    if(fetchError.value) {
      throw new Error("회원정보 수정 실패");
    }

    authStore.login(data.value.token);
    alert("회원 정보가 수정되었습니다.");
    navigateTo('/mypage');
  
  } catch(error) {
    console.error("회원 정보 수정 오류: ", error);
    alert("회원 정보 수정 중 오류가 발생했습니다.");
  }
};

const handleImageError = (e) => {
  e.target.src = `${apiBase}/uploads/images/user/basic.png`;
  console.error("프로필 이미지 로드 실패, 기본 이미지로 대체");
};

const handleFileChange = async(e) => {
  const file = e.target.files[0];
  if(!file) return;

  if(!file.type.startsWith('image/')) {
    alert("이미지 파일만 업로드 가능합니다.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하여야 합니다.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('profileImage', file);

    const { data, error: fetchError } = await useAuthFetch('/mypage/profile-image', {
      method: 'POST',
      body: formData
    });

    if(fetchError.value) {
      throw new Error('프로필 이미지 업로드 실패');
    }


    if (data.value?.token) {
      authStore.login(data.value.token);
    }
    alert('프로필 이미지가 변경되었습니다.');
  
  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error);
    alert('프로필 이미지 업로드 중 오류가 발생했습니다.');
  }
};

onMounted(()=>{
  if(!isLoggedIn.value) {
    navigateTo('/login');
    return;
  }
  storedUserInfo.value = user.value.username;
});


</script>

<style>
@import url('/public/css/mypage/memberInfoUpdate.css');

fieldset{
  border: none
}

.btn:hover 
{
  background-color: var(--accent-1); 
  color: white;  
  cursor: pointer;
}

.long_btn:hover
{
  background-color: var(--accent-1); 
  color: white;  
  cursor: pointer;
}
</style>