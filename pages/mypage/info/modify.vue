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
            <img class="memberInfoUpdate__img-my" src="/public/images/mypage/profile-baek.png" alt="profile pic">
          </div>
          <div class="memberInfoUpdate__edit">
            <div class="memberInfoUpdate__edit-icon-box">
              <label for="inputFile">
                <input id="inputFile" style="display:none" type="file">
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

const authStore = useAuthStore();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

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

    const response = await fetch(`${apiBase}/signup/checkNickname`, {
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
    const userId = authStore.user.id;
    const infoRequestDto = {
      id: userId,
      nickname: nicknameModel.value,
      email: emailModel.value
    };

    const response = await fetch(`${apiBase}/mypage/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(infoRequestDto),
    });

    const data = await response.json();
    authStore.login(data.token);
    alert("회원 정보가 수정되었습니다.");
    navigateTo('/mypage');
  
  } catch(error) {
    console.error("회원 정보 수정 오류: ", error);
    alert("회원 정보 수정 중 오류가 발생했습니다.");
  }
};

onMounted(()=>{
  if(!authStore.isLoggedIn) {
    navigateTo('/login');
    return;
  }
  storedUserInfo.value = authStore.user.username;
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