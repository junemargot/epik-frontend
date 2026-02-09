<template>
  <main class="mypage-wrap">
    <section class="inqury-write__wrap small-wrap">
      <div class="inqury-write__info">
        <h1 class="inqury-write__title intro-title">
          1:1 문의 상세
        </h1>
      </div>

      <form>
        <fieldset>
          <label>
            <div class="star_top gap-mt_3">내용</div>
            <div class="gap-mt_1">
              <input class="form" type="text" placeholder="제목">
            </div>
          </label>
        </fieldset>


        <fieldset>
          <label>
            <div class="gap-mt_1">
              <textarea id="inqury-write__content" class="big_form" v-model="content"
              placeholder="내용을 입력해주세요."
                maxlength="500"></textarea>
              <span class="inqury-write__content-count">{{ contentLength }}/500</span>
            </div>
          </label>
        </fieldset>
      </form>

      <div class="inqury-write__menuList gap-mt_2">

        <button class="small_btn_grey">목록</button>

        <div class="inqury-write__menu">
          <button class="small_btn_white">등록</button>

        </div>
      </div>

    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';

const content = ref(''); // textarea의 내용을 저장
const contentLength = computed(() => content.value.length); // 내용 길이 계산

console.log(contentLength);


</script>

<style>
@import url(/public/css/mypage/inquiry.css);

button:hover{
  background-color: var(--accent-1); 
  color: white;  
}
</style>