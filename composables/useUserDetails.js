// import { jwtDecode } from 'jwt-decode';
// import { useAuthStore } from '~/stores/auth.js';

// export default () => {
//   const id = useState("id", () => null);
//   const username = useState("username", () => null);
//   const email = useState("email", () => null);
//   const role = useState("role", () => null);
//   const nickname = useState("nickname", () => null);
//   const token = useState("token", () => null);
//   const profileImg = useState("profileImg", () => null);

//   // 인증 정보 설정
//   const setAuthentication = (loginInfo) => {
//     const processedRole = loginInfo.role ?
//       (Array.isArray(loginInfo.role) ? 
//       loginInfo.role.filter(r => r !== null) : 
//       [loginInfo.role]).filter(Boolean) : 
//     [];

//     // 상태 업데이트
//     id.value = loginInfo.id;
//     username.value = loginInfo.username;
//     email.value = loginInfo.email;
//     role.value = loginInfo.role;
//     nickname.value = loginInfo.nickname || '';
//     token.value = loginInfo.token;
//     profileImg.value = loginInfo.profileImg || '';

//     // localStorage에 저장
//     if(process.client) {
//       localStorage.setItem("id", loginInfo.id);
//       localStorage.setItem("username", loginInfo.username);
//       localStorage.setItem("email", loginInfo.email || '');
//       localStorage.setItem("role", JSON.stringify(processedRole));
//       localStorage.setItem("nickname", loginInfo.nickname || '');
//       localStorage.setItem("access_token", loginInfo.token);
//       localStorage.setItem("profile_img", loginInfo.profileImg || '');

//       // // Pinia 스토어 업데이트
//       // const authStore = useAuthStore();
//       // if(authStore) {
//       //   authStore.login(loginInfo.token);
//       // }
//     }
//   };

//   // 로그아웃 시 상태 초기화
//   const logout = () => {
//     id.value = null;
//     username.value = null;
//     email.value = null;
//     nickname.value = null;
//     role.value = null;
//     token.value = null;
    
//     // localStorage 정리
//     if(process.client) {
//       localStorage.removeItem("id");
//       localStorage.removeItem("username");
//       localStorage.removeItem("email");
//       localStorage.removeItem("role");
//       localStorage.removeItem("nickname");
//       localStorage.removeItem("token");
//       localStorage.removeItem("profile_img");
//       localStorage.removeItem("access_token"); // 다른 곳에서 사용하는 키도 제거

//       const authStore = useAuthStore();
//       if(authStore) {
//         authStore.logout();
//       }
//     }
//   };

//   // 토큰 기반 인증 상태 확인
//   const checkAuthentication = (tokenValue) => {
//     if(!tokenValue && process.client) {
//       tokenValue = localStorage.getItem("access_token");
//     }

//     if(tokenValue) {
//       try {
//         // 토큰 유효성 기본 검사 추가
//         if(!tokenValue.includes('.')) {
//           console.error('유효하지 않은 토큰 형식입니다.');
//           return false;
//         }

//         // JWT 디코딩
//         const userInfo = jwtDecode(tokenValue);

//         // 토큰 만료 확인
//         const currentTime = Date.now() / 1000;
//         if (userInfo.exp && userInfo.exp > currentTime) {
//           // 역할 정보 처리
//           let userRoles;
//           if (Array.isArray(userInfo.role)) {
//             userRoles = userInfo.role.map(r => typeof r === 'object' ? r.authority : r);
//           } else if (typeof userInfo.role === 'object' && userInfo.role.authority) {
//             userRoles = [userInfo.role.authority];
//           } else {
//             userRoles = [userInfo.role];
//           }

//           setAuthentication({
//             id: userInfo.id,
//             username: userInfo.username,
//             email: userInfo.email,
//             role: userRoles,
//             nickname: userInfo.nickname,
//             profileImg: userInfo.profileImg,
//             token: tokenValue
//           });
//           return true;
//         } else {
//           logout();
//           return false;
//         }
//       } catch (error) {
//         console.error("토큰 검증 오류: ", error);
//         tryLoadFromLocalStorage();
//         // logout();
//         return false;
//       }
//     }
//     return false;
//   };

//   // Pinia 스토어 참조
//   let authStore;
//   if(process.client) {
//     authStore = useAuthStore();
//   }

//   // 새로운 함수: localStorage에서 직접 데이터 로드 시도
// const tryLoadFromLocalStorage = () => {
//   if(process.client) {
//     const storedNickname = localStorage.getItem("nickname");
//     const storedProfileImg = localStorage.getItem("profile_img");
    
//     if(storedNickname) {
//       nickname.value = storedNickname;
//       profileImg.value = storedProfileImg || 'basic.png';
//       console.log("localStorage에서 직접 로드:", nickname.value, profileImg.value);
//       return true;
//     }
//   }
//   return false;
// };

//   // localStorage에서 사용자 정보 로드
//   const loadUserFromStorage = () => {
//     if (process.client) {
//       console.log("loadUserFromStorage 실행");

//       // 1. authStore에서 먼저 확인 (Pinia persist가 이미 복원했을 수 있음)
//       const authStore = useAuthStore();
//       if(authStore.token) {
//         const tokenSuccess = checkAuthentication(authStore.token);
//         if(tokenSuccess) {
//           console.log("authStore 토큰 기반 인증 성공");
//           return true;
//         }
//       }

//       // 2. access_token으로 시도 (fallback)
//       const storedToken = localStorage.getItem("access_token");
//       if (storedToken) {
//         const tokenSuccess = checkAuthentication(storedToken);

//         if(tokenSuccess) {
//           console.log("토큰 기반 인증 성공");
//           return true;
//         }
//       }

    
//       // 3. 토큰 인증 실패 시, localStorage에서 직접 값 로드
//       const storedNickname = localStorage.getItem('nickname');
//       const storedProfileImg = localStorage.getItem('profile_img');
//       const storedId = localStorage.getItem('id');
//       const storedUsername = localStorage.getItem('username');
//       const storedEmail = localStorage.getItem('email');
      
//       if(storedNickname || storedUsername) {
//         console.log('localStorage에서 직접 데이터 로드');

//         nickname.value = storedNickname || '관리자';
//         profileImg.value = storedProfileImg || 'basic.png';
//         id.value = storedId || null;
//         username.value = storedUsername || null;
//         email.value = storedEmail || '';

//         // 역할 정보 파싱
//         try {
//           const roleStr = localStorage.getItem('role');
//           if(roleStr) {
//             role.value = JSON.parse(roleStr);
//           }
//         } catch(e) {
//           console.error('역할 정보 파싱 오류: ', e);
//           role.value = null;
//         }

//         token.value = null;

//         console.log('loadUserFromStorage 실행 후 nickname: ', nickname.value);
//         console.log('loadUserFromStorage 실행 후 profileImg: ', profileImg.value);
//         return true;
//       }

//       console.log('loadUserFromStorage 실패: 저장된 사용자 정보 없음');
//       return false;
//     }
//     return false;
//   };

//   // 클라이언트 사이드에서 자동으로 사용자 정보 로드
//   if(process.client) {
//     loadUserFromStorage();
//   }

//   // 비회원 확인
//   const isAnonymous = () => {
//     return username.value === null;
//   };

//   // 특정 역할 확인
//   const hasRole = (roleToCheck) => {
//     if(!role.value) return false;

//     // role.value가 배열인 경우
//     if (Array.isArray(role.value)) {
//       return role.value.some(r => {
//         if (typeof r === 'object' && r.authority) {
//           return r.authority === roleToCheck;
//         }
//         return r === roleToCheck;
//       });
//     }

//     // role.value가 문자열인 경우
//     return role.value === roleToCheck;
//   };

//   return {
//     id,
//     username,
//     email,
//     role,
//     nickname,
//     profileImg,
//     token,
//     isAnonymous,
//     setAuthentication,
//     hasRole,
//     logout,
//     loadUserFromStorage,
//     checkAuthentication
//   };
// }

// onMounted(() => {
//   if (process.client) {
//     const token = localStorage.getItem('access_token');
//     console.log('토큰 존재 여부:', !!token);
    
//     if (token) {
//       const authResult = userDetails.checkAuthentication(token);
//       console.log('인증 결과:', authResult);
      
//       // 인증 후 값 확인
//       console.log('인증 후 nickname:', userDetails.nickname.value);
//       console.log('인증 후 profileImg:', userDetails.profileImg.value);
//     }
//   }
// });