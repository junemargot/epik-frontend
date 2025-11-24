import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		isLoggedIn: false,
		user: {
			id: null,
			username: null,
			email: null,
			nickname: null,
			profileImg: null,
			role: null,
		},
		token: null,
	}),

	getters: {
		isAnonymous: (state) => state.user.username === null,
		isAuthenticated: (state) => state.isLoggedIn && !!state.token,
		hasRole: (state) => (roleToCheck) => {
			if(!state.user.role) return false;
			if(Array.isArray(state.user.role)) {
				return state.user.role.some(r => {
					if(typeof r === 'object' && r.authority) {
						return r.authority === roleToCheck;
					}
					return r === roleToCheck;
				});
			}

			return state.user.role === roleToCheck;
		},
		profileImageUrl: (state) => {
			const config = useRuntimeConfig();
			const apiBase = config.public.apiBase;
			const imgValue = state.user.profileImg;

			if(!imgValue) {
				return `${apiBase}/uploads/images/user/basic.png`;
			}

			if (imgValue.startsWith('http://') || imgValue.startsWith('https://')) {
        return imgValue;
      }

			if (imgValue.startsWith('uploads/')) {
        return `${apiBase}/uploads/${imgValue.substring('uploads/'.length)}`;
      }

			if (imgValue === 'basic.png' || !imgValue.includes('/')) {
        return `${apiBase}/uploads/images/user/${imgValue}`;
      }

			return `${apiBase}${imgValue}`;
		},
	},

	actions: {
		// JWT 토큰으로 로그인
		login(token) {
			try {
				const decoded = jwtDecode(token);
				const currentTime = Date.now() / 1000;

				// 토큰 만료 확인
				if(decoded.exp && decoded.exp < currentTime) {
					console.error("만료된 토큰입니다.");
					this.logout();
					return false;
				}

				this.isLoggedIn = true;
				this.token = token;
				this.user = {
					id: decoded.id,
					username: decoded.username,
					email: decoded.email,
          nickname: decoded.nickname,
          profileImg: decoded.profileImg || null,
          role: decoded.role,
				};
				return true;
			} catch(error) {
				console.error("토큰 디코딩 오류: ", error);
				this.logout();
				return false;
			}
		},

		// 로그아웃
		logout(options = { navigate: false }) {
      this.isLoggedIn = false;
      this.token = null;
      this.user = {
        id: null,
        username: null,
        email: null,
        nickname: null,
        profileImg: null,
        role: null,
      };

			if(process.client) {
				localStorage.removeItem('access_token');
				localStorage.removeItem('profile_img');
				localStorage.removeItem('nickname');
				localStorage.removeItem('id');
				localStorage.removeItem('username');
				localStorage.removeItem('email');
				localStorage.removeItem('role');
			}

			if(options.navigate) {
				return navigateTo('/login');
			}
    },

		// 토큰 체크 (페이지 로드 시)
		checkAuth() {
			if(!this.token) {
				this.isLoggedIn = false;
				return false;
			}

			try {
				const decoded = jwtDecode(this.token);
				const currentTime = Date.now() / 1000;

				if(decoded.exp && decoded.exp < currentTime) {
					this.logout();
					return false;
				}

				this.isLoggedIn = true;
				return true;

			} catch(error) {
				console.error("비정상적인 토큰으로 인해 자동으로 로그아웃합니다. ", error);
				this.logout();
				return false;
			}
		},

		// 프로필 이미지 업데이트
    updateProfileImage(newToken, profileImgPath) {
      if (newToken) {
        // 새 토큰으로 전체 갱신
        this.login(newToken);
      } else if (profileImgPath) {
        // 이미지 경로만 업데이트
        this.user.profileImg = profileImgPath;
      }
    },
	},

	persist: true,
});
