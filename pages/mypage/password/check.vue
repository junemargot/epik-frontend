<template>
  <main class="mypage-wrap">
    <section class="passwordCheck__wrap small-wrap">
      <div class="passwordCheck__intro">
        <h1 class="passwordCheck__title intro-title">
          비밀번호 확인
        </h1>
      </div>

      <form>
        <fieldset class="passwordCheck__inUpdate gap-mb_6 gap-mt_3 small_text">
          <label>
            <div class="star_top">아이디</div>
            <div class="gap-mt_1">
              <input disabled class="form non_change" type="text" :placeholder="storedUserInfo">
            </div>
          </label>
        </fieldset>


        <fieldset class="passwordUpdate gap-mb_6 small_text">
          <label>
            <div class="star_top">현재 비밀번호</div>
            <div class="gap-mt_1">
              <input class="form" type="password" v-model="passwordModel" placeholder="현재 비밀번호를 입력해주세요">
            </div>
          </label>
          <div class="message-container">
            <div class="small_text_red"  v-if="passwordCheck===false">비밀번호를 확인해주세요.</div>
            <div class="small_text_green" v-if="passwordCheck===true">비밀번호가 일치합니다.</div>
          </div>
        </fieldset>
      </form>

      <div class="gap-bmt_1">
        <button class="long_btn" type="button" @click="passwotdCheckHandler">
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

const passwordModel = ref('');
const passwordCheck = ref(null);
const storedUserInfo = ref('');

const passwotdCheckHandler = async () => {
  try {
    const userId = authStore.user.id;
    const passwordCheckDto = {
      id: userId,
      password: passwordModel.value,
    };

    const response = await fetch(`${apiBase}/mypage/passwordCheck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(passwordCheckDto),
    });
    
    const result = await response.json();
    if(result === true) {
      passwordCheck.value = true;
      navigateTo('/mypage/password/update');
    } else {
      passwordCheck.value = false;
    }
    
  } catch(error) {
    console.error("비밀번호 확인 오류: ", error);
    alert("비밀번호 확인 중 오류가 발생했습니다.");
  }
};

onMounted(()=>{
  if (!authStore.isLoggedIn) {
    navigateTo('/login');
    return;
  }
  storedUserInfo.value = authStore.user.username;
});

</script>

<style>
@import url('/public/css/mypage/passwordUpdate.css');

.long_btn:hover{
  background-color: var(--accent-1); 
  color: white;  
  cursor: pointer;
}
</style>