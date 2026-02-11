<template>
  <main class="mypage-wrap">
    <section class="inqury-answer__wrap small-wrap">
      <div class="inqury-answer__info">
        <h1 class="inqury-answer__title intro-title">
          1:1 문의 상세
        </h1>
      </div>

      <form>
        <fieldset>
          <label>
            <div class="gap-mt_3">내용</div>
            <div class="gap-mt_1">
              <div class="form asnswerform">닉네임 관련련 문의 있습니다</div>
            </div>
          </label>
        </fieldset>


        <fieldset>
          <label>
            <div class="gap-mt_1">
              <div id="inqury-answer__content" class="mid_big_form asnswerform">닉네임은 어디에서 변경할 수 있나요?</div>
              <!-- <span class="inqury-answer__content-count">0/500</span> -->
            </div>
          </label>
        </fieldset>

        <fieldset>
          <label>
            <div class="gap-mt_2">답변</div>
            <div class="gap-mt_1">
              <div id="inqury-answer__answer" class="middle_form asnswerform">안녕하세요. 에픽입니다!<br/>닉네임 변경은 회원정보 수정에서 가능합니다 ! <br/>문의주셔서 감사합니다 !</div>
            </div>
          </label>
        </fieldset>
      </form>

      <div class="inqury-answer__menu gap-mt_2">
        <button class="small_btn_grey answerBtn"><a href="http://localhost:3001/mypage/inquiry">목록</a></button>
      </div>

    </section>
  </main>
</template>

<script>
</script>

<style>
@import url('/public/css/mypage/inquiry.css');

.asnswerform,
#inqury-answer__content,
#inqury-answer__answer {
  font-size: 12px;
}
.asnswerform {
  padding-top: 15px; /* 위쪽 여백을 추가하여 텍스트 위치를 아래로 조정 */
  padding-left: 10px;
padding-top: 15px;
}

.answerBtn:hover{
  
  color: white;  
}


</style>