import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		isLoggedIn: false,
		user: null,
	}),

	actions: {
		checkAuth() {
			if (typeof window !== "undefined") {
				const token = localStorage.getItem("access_token");
				if (token) {
					try {
						const decoded = jwtDecode(token);
						const currentTime = Date.now() / 1000;

						if (decoded.exp && decoded.exp > currentTime) {
							this.isLoggedIn = true;
							this.user = {
								id: decoded.id,
								username: decoded.username,
								role: decoded.role,
							};
						} else {
							this.logout();
						}
					} catch (error) {
						console.error("토큰 검증 오류: ", error);
					}
				} else {
					this.isLoggedIn = false;
					this.user = null;
				}
			}
		},

		login(token) {
			localStorage.setItem("access_token", token);
			this.isLoggedIn = true;

			try {
				const decoded = jwtDecode(token);
				this.user = {
					id: decoded.id,
					username: decoded.username,
					role: decoded.role,
				};
			} catch (error) {
				console.error("토큰 디코딩 오류:", error);
			}
		},

		logout() {
			localStorage.removeItem("access_token");
			this.isLoggedIn = false;
			this.user = null;
		},
	},
});
