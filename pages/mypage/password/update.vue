<template>
  <main class="mypage-wrap">
    <section class="passwordUpdate__wrap small-wrap">
      <div class="passwordUpdate__intro">
        <h1 class="passwordUpdate__title intro-title">
          비밀번호 변경
        </h1>
      </div>

      <form>
        <fieldset class="gap-mb_6 gap-mt_3 small_text">
          <label>
            <div class="star_top">새로운 비밀번호</div>
            <div class="gap-mt_1">
              <input class="password form long_form gap-mt_1" v-model="pwModel" id="password" type="text"
                placeholder="영어+숫자, 대/소문자 구분 없이 6자리 이상을 입력해주세요">
            </div>
          </label>
          <div class="message-container">
              <div class="small_text_green" v-if="pwCheck===true">사용 가능한 비밀번호입니다.</div>
              <div class=" small_text_red" v-if="pwCheck===false">비밀번호는 대/소문자 구분 없이 6글자
                이상 입력해주세요.</div>
            </div>
        </fieldset>


        <fieldset class="gap-mb_6 small_text">
          <label>
            <div class="star_top">새로운 비밀번호 확인</div>
            <div class="gap-mt_1">
              <input class="password-retype form long_form gap-mt_1" v-model="pwReModel" id="password-retype"
              type="text" placeholder="비밀번호를 한번 더 입력해주세요">
            </div>
          </label>
          <div class="message-container">
              <div class="hide small_text_green" v-if="pwReCheck===true">비밀번호가 일치합니다.</div>
              <div class="hide small_text_red" v-if="pwReCheck===false">비밀번호가 불일치합니다.</div>
            </div>
        </fieldset>
      </form>

      <div class="gap-bmt_1">
        <button class="long_btn" @click="passwordUpHandler" type="button">
          확인
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRuntimeConfig } from '#app';
import { useAuthStore } from '~/stores/auth.js';

const authStore = useAuthStore();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const pwModel = ref('');
const pwReModel = ref('');
const pwCheck = ref('');
const pwReCheck = ref('');
const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;

const passwordUpHandler = async() => {
  try {
    const userId = authStore.user.id;
    const passwordCheckDto = {
      id: userId,
      password: pwReModel.value,
    };

    const response = await fetch(`${apiBase}/mypage/updatepassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(passwordCheckDto),
    });

    const data = await response.json();
    
    // 새 토큰으로 authStore 업데이트 (localStorage 자동 저장)
    authStore.login(data.token);

    // 비밀번호 확인 요청
    const passwordCheckResponse = await fetch(`${apiBase}/mypage/passwordCheck`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordCheckDto),
    });

    const passwordCheckData = await passwordCheckResponse.json();
    console.log("비밀번호 확인 결과: ", passwordCheckData);
    alert("비밀번호 변경이 완료되었습니다.");
    navigateTo('/login');
  
  } catch(error) {
    console.error("비밀번호 변경 오류: ", error);
    alert("비밀번호 변경 중 오류가 발생했습니다.");
  }
}

onMounted(() => {
  if(!authStore.isLoggedIn) { 
    navigateTo('/login');
  }
});

watch([pwModel], () => {
  if (regex.test(pwModel.value))
    pwCheck.value = true
  else
    pwCheck.value = false
})

watch([pwModel, pwReModel], () => {
  if ((pwModel.value === pwReModel.value) && pwCheck.value === true) {
    pwReCheck.value = true
  } else if ((!(pwModel.value === pwReModel.value)) && pwCheck.value === true) {
    pwReCheck.value = false
  }
  else {
    pwReCheck.value = ''; // 초기 상태일 때는 메시지 안 보이도록 설정
  }
});

</script>

<style>
@import url(/public/css/mypage/passwordUpdate.css);

.long_btn:hover{
  background-color: var(--accent-1); 
  color: white;  
  cursor: pointer;
}
</style>