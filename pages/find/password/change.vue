<template>
  <main class="login-in-wrap">
    <section class="search-pw__wrap small-wrap">
      <div class="search-pw__intro">
        <h1 class="search-pw__title intro-title">
          비밀번호 재설정
        </h1>
      </div>

      <form class="search-pw__form">
        <h2 hidden>비밀번호 재설정 폼</h2>

        <fieldset class="gap-mb_6 gap-mt_5 small_text">
          <label>
            <div class="star_top">비밀번호 재설정</div>
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
            <div class="star_top">비밀번호 확인</div>
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

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const pwModel = ref('');
const pwReModel = ref('');
const pwCheck = ref('');
const pwReCheck = ref('');
const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;

const passwordUpHandler = async() => {
  try {
    // 비밀번호 찾기 플로우에서 임시 저장한 username
    const usernameValue = localStorage.getItem('username');

    if(!usernameValue) {
      alert("잘못된 접근입니다.");
      navigateTo('/login');
      return;
    }

    const usernameCheckDto = {
      username: usernameValue,
      password: pwReModel.value,
    };

    const response = await fetch(`${apiBase}/find/password/resetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usernameCheckDto),
    });
    const data = await response.text();
    localStorage.removeItem('username'); // 비밀번호 변경 성공 후 임시 저장한 username 제거
    alert("비밀번호가 변경되었습니다. 로그인해주세요.");
    navigateTo("/login");

  } catch(error) {
    console.error("비밀번호 변경 오류: ", error);
    alert('비밀번호 변경 중 오류가 발생했습니다.');
  }
};


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
  } else {
    pwReCheck.value = '';
  }
});

</script>

<style>
@import url('/public/css/login/login.css');
</style>