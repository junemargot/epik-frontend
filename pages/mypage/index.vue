<template>
  <main class="mypage-wrap">
    <section class="mypage__wrap small-wrap">
      <div class="mypage__intro">
        <h1 class="mypage__title">마이페이지</h1>
      </div>
      <div class="mypage__wrap-profile">
        <div class="mypage__profile">
          <div class="mypage__img">
            <div class="mypage__img-my-box">
              <img class="mypage__img-my" :src="profileUrl" alt="프로필이미지" />
            </div>
            <div class="mypage__edit">
              <div class="mypage__edit-icon-box">
                <label for="inputFile">
                  <input id="inputFile" style="display:none" type="file" @change="handleFileChange">
                  <i class='bx bx-pencil'></i>
                </label>
              </div>
            </div>
          </div>
          <div class="mypage__name">
            <div class="mypage__nickname ">
              {{ user.nickname }}
            </div>
            <div class="mypage__username">
              {{ user.email }}
            </div>
          </div>
        </div>
        <div class="mypage__wrap-fuction">
          <nav>
            <ul class="mypage__fuction-icons">
              <li class="bell">
                <NuxtLink to="/mypage/notification">
                  <i class='mypage__bell-icon bx bx-bell'></i>알림
                </NuxtLink>
              </li>
              <li class="bookmark">
                <NuxtLink :to="`/mypage/${user.id}/bookmark`">
                  <i class='mypage__bookmark-icon bx bx-bookmark'></i>북마크
                </NuxtLink>
              </li>
              <li class="myfeed">
                <NuxtLink to="/feed/my">
                  <i class='mypage__myfeed-icon bx bx-message-alt-minus'></i>마이피드
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div class="mypage__wrap-menulist">
        <nav>
          <ul class="mypage__menulist">
            <li>
              <NuxtLink to="/mypage/info/modify" class="mypage__memberInfoUpdate">
                <div class="mypage__icon-wrap">
                  <i class='mypage__user-icon bx bx-user-circle'></i>회원정보수정
                </div>
                <div>
                  <i class='mypage__angleright-icon bx bx-chevron-right'></i>
                </div>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/mypage/password/check" class="mypage__passwordChange">
                <div class="mypage__icon-wrap">
                  <i class='mypage__lock-icon bx bx-lock-alt'></i>비밀번호 변경
                </div>
                <div>
                  <i class='mypage__angleright-icon bx bx-chevron-right'></i>
                </div>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/mypage/inquiry" class="mypage__inquiry">
                <div class="mypage__icon-wrap">
                  <i class='mypage__headset-icon bx bx-support'></i>문의내역
                </div>
                <div>
                  <i class='mypage__angleright-icon bx bx-chevron-right'></i>
                </div>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/mypage/block" class="mypage__blockMember">
                <div class="mypage__icon-wrap">
                  <i class='mypage__userlock-icon bx bxs-user-x'></i>차단 계정 관리
                </div>
                <div>
                  <i class='mypage__angleright-icon bx bx-chevron-right'></i>
                </div>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRuntimeConfig } from '#app';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';

// SSR 비활성화
definePageMeta({
  ssr: false,
  middleware: 'auth'
});

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const profileUrl = ref(`${apiBase}/uploads/images/user/basic.png`);
const getProfileUrl = (imgValue) => {
  if(!imgValue) {
    return `${apiBase}/uploads/images/user/basic.png`;
  }

  if (imgValue.startsWith('http://') || imgValue.startsWith('https://')) {
    return imgValue;
  }

  if (imgValue.startsWith('uploads/')) {
    return `${apiBase}/${imgValue}`;
  }

  if (imgValue === 'basic.png' || !imgValue.includes('/')) {
    return `${apiBase}/uploads/images/user/${imgValue}`;
  }

  return `${apiBase}${imgValue}`;
};

// 스토어의 profileImageUrl getter를 사용
// const profileUrl = computed(() => authStore.profileImageUrl);
// const profileUrl = computed(() => {
//   const imgValue = user.value.profileImg; // storeToRefs의 user 사용

//   if(!imgValue) {
//     return `${apiBase}/uploads/images/user/basic.png`;
//   }

//   if(imgValue.startsWith('http://') || imgValue.startsWith('https://')) {
//     return imgValue;
//   }

//   if(imgValue.startsWith('uploads/')) {
//     return `${apiBase}/${imgValue}`;
//   }

//   if(imgValue === 'basic.png' || !imgValue.includes('/')) {
//     return `${apiBase}/uploads/images/user/${imgValue};`
//   }

//   return `${apiBase}${imgValue}`;
// });

// 프로필사진 변경하기
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert("이미지 파일만 업로드 가능합니다.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("파일 크기는 5MB 이하여야 합니다.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('profileImage', file);

    // $fetch 대신 useAuthFetch와 같은 인증된 fetch 래퍼를 사용하는 것을 고려해보세요.
    const response = await $fetch(`${apiBase}/mypage/profile-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    // 응답 구조에 따라 token과 profileImg를 정확히 파싱해야 합니다.
    // 예시: response.data.token, response.data.profileImg
    if (response && response.token && response.profileImg) {
      authStore.updateProfileImage(response.token, response.profileImg);

      localStorage.setItem("access_token", response.token);
      localStorage.setItem("profile_img", response.profileImg);

      alert("프로필 이미지가 변경되었습니다.");
    } else {
      // 서버 응답 구조를 확인하고, 필요시 아래 코드를 수정하세요.
      // 임시로 프로필 이미지만 업데이트하는 경우
      if (response.profileImg) {
        authStore.updateProfileImage(null, response.profileImg);
        localStorage.setItem("profile_img", response.profileImg);
        alert("프로필 이미지가 변경되었습니다.");
      } else {
        throw new Error("서버 응답에서 프로필 정보를 찾을 수 없습니다.");
      }
    }
  } catch (error) {
    console.error("프로필 이미지 업로드 오류:", error);

    if (error.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      authStore.logout();
      navigateTo('/login');
    } else {
      const errorMessage = error.data?.message || '프로필 이미지 업로드 중 오류가 발생했습니다.';
      alert(errorMessage);
    }
  }
};

onMounted(() => {
  profileUrl.value = getProfileUrl(user.value.profileImg);

  watch(() => user.value.profileImg, (newVal) => {
    profileUrl.value = getProfileUrl(newVal);
  }, { immediate: true });
});

</script>

<style scoped>
@import url('/public/css/mypage/mypageMain.css');

.mypage__menulist li a,
.mypage__fuction-icons li a {
  font-weight: normal;
  /* 기본 폰트 두께는 normal */
  transition: font-weight 0.3s ease, transform 0.3s ease;
  /* 부드러운 전환 효과 */
}

/* 호버 시 폰트 두께와 크기 증가 */
.mypage__menulist li a:hover,
.mypage__fuction-icons li a:hover {
  font-weight: bold;
  /* 호버 시 폰트 두께를 bold로 변경 */
  transform: scale(1.005);
  /* 호버 시 아이콘과 텍스트 크기 살짝 증가 */
  cursor: pointer;
}

/* 메뉴 내 아이콘 텍스트 */
.mypage__menulist li a .mypage__icon-wrap,
.mypage__fuction-icons li a .mypage__icon-wrap {
  font-weight: normal;
  /* 기본 두께는 normal */
  transition: font-weight 0.3s ease;
}

/* 호버 시 아이콘 텍스트 볼드 처리 */
.mypage__menulist li a:hover .mypage__icon-wrap,
.mypage__fuction-icons li a:hover .mypage__icon-wrap {
  font-weight: bold;
  /* 호버 시 아이콘 텍스트도 볼드 처리 */
  cursor: pointer;
}

/* 메뉴 내 아이콘 크기 조정 */
.mypage__menulist li a .mypage__angleright-icon,
.mypage__fuction-icons li a i {
  transition: transform 0.3s ease;
  /* 부드러운 전환 효과 */
}

/* 호버 시 아이콘 크기 확대 */
.mypage__menulist li a:hover .mypage__angleright-icon,
.mypage__fuction-icons li a:hover i {
  transform: scale(1.2);
  /* 호버 시 아이콘 크기 살짝 커짐 */
  cursor: pointer;
}
</style>