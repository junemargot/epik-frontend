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
              <img class="mypage__img-my" :src="profileUrl" alt="프로필이미지" ref="imgProfile" />
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
              {{ userDetails.nickname.value }}
            </div>
            <div class="mypage__username">
              {{ userDetails.email.value }}
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
                <NuxtLink :to="`/mypage/${userDetails.id.value}/bookmark`">
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
import { ref, onMounted, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

const userDetails = useUserDetails();

const currentProfileImg = computed(() => {
  // userDetails.profileImg이 null이면 localStorage에서 직접 확인
  if (!userDetails.profileImg.value && process.client) {
    const storedProfileImg = localStorage.getItem("profile_img");
    if (storedProfileImg) return storedProfileImg;
  }
  return userDetails.profileImg.value;
});

// 프로필 이미지 url 생성 함수
const profileUrl = computed(() => {
  if (currentProfileImg.value.startsWith('uploads/')) {
    return `${apiBase}/uploads/${currentProfileImg.value.substring('uploads/'.length)}`;
  } else {
    return `${apiBase}/uploads/images/user/basic.png`;
  }
});

onMounted(() => {
  let token = localStorage.getItem("access_token");  // 로컬스토리지에서 토큰 가져오기

  if (!token) {
    // 토큰이 없으면 메인 페이지로 리디렉션
    location.href=('http://localhost:3000');
  
  } else {
    try {
      const userInfo = jwtDecode(token);  // JWT 토큰 디코딩
      console.log("토큰에서 정보 가져오기", userInfo);

      // 먼저 profileImg 값을 명시적으로 확인
      console.log("토큰의 profileImg 값:", userInfo.profileImg);

      // 역할 정보 처리 (오류 방지)
      let roles = [];
      if (userInfo.role) {
        if (Array.isArray(userInfo.role)) {
          roles = userInfo.role.map(role => 
            typeof role === 'object' ? role.authority : role
          );
        } else {
          roles = [userInfo.role];
        }
      }
      
      userDetails.setAuthentication({
        id: userInfo.id,
        nickname: userInfo.nickname,
        username: userInfo.username,
        email: userInfo.email,
        profileImg: userInfo.profileImg,
        role: userInfo.role.map(role => role.authority),
        token: token
      });

      console.log("토큰에서 정보 가져오기", userInfo);
      console.log("userDetails 설정 후:", {
        nickname: userDetails.nickname.value,
        profileImg: userDetails.profileImg.value,
        email: userDetails.email.value
      });
    } catch(error) {
      console.error('토큰 디코딩 오류: ', error);
    }
  }
})

//프로필사진 변경하기
const handleFileChange = async (event) => {


  //로컬호스트 유지
  let token = localStorage.getItem("access_token");  // 로컬스토리지에서 토큰 가져오기


  // 토큰이 있으면, 토큰을 디코딩하여 사용자 정보 추출
  const userInfo = jwtDecode(token); // JWT 토큰 디코딩
  userDetails.setAuthentication({
    id: userInfo.id,
    nickname: userInfo.nickname,
    username: userInfo.username,
    email: userInfo.email,
    profileImg: userInfo.profileImg || 'basic.png',
    role: userInfo.role.map(role => role.authority),
    token: token
  });

  //id값만 담기
  const idtest = userInfo.id;

  const file = event.target.files[0];  // 사용자가 선택한 파일
  if (file) {
    const formData = new FormData();
    formData.append('profileImage', file);  // 파일을 FormData에 추가


    //이미지랑 아이디 전달 패치 
    const reponse = await fetch('유저아이디랑 이미지 전달할 컨트롤러', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordCheckDto),
    })
  }
}







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