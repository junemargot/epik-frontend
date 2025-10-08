import Lenis from "lenis";

export default defineNuxtPlugin((nuxtApp) => {
	// client-side에서만 실행
	if (process.client) {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			direction: "vertical",
			gestureDirection: "vertical",
			smooth: true,
			smoothTouch: false,
			touchMultiplier: 2,
		});

		// 스크롤 이벤트와 RAF 연결
		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		// 글로벌 속성으로 Lenis 인스턴스 노출
		nuxtApp.provide("lenis", lenis);

		// 스크롤 위치 저장소 및 네비게이션 타입 추적
		const MAX_STORED_POSITIONS = 50;
		const scrollPositions = new Map();
		const visitedPages = [];
		let isBackNavigation = false;

		const route = useRoute();
		const router = useRouter();

		// 현재 페이지를 방문 기록에 추가
		visitedPages.push(route.path);

		window.addEventListener("popstate", (event) => {
			try {
				const targetPath = window.location.pathname;
				const lastVisitedIndex = visitedPages.lastIndexOf(targetPath);

				// 마지막 방문 페이지가 현재보다 이전이면 뒤로가기
				isBackNavigation =
					lastVisitedIndex >= 0 && lastVisitedIndex < visitedPages.length - 1;
			} catch (error) {
				console.error("[Lenis] popstate 처리 중 오류: ", error);
				isBackNavigation = false;
			}
		});

		// 링크 클릭 시 현재 스크롤 위치 저장
		router.beforeEach((to, from) => {
			try {
				if (from.path) {
					scrollPositions.set(from.path, lenis.scroll);

					// Map 크기 제한 (FIFO 방식)
					if (scrollPositions.size >= MAX_STORED_POSITIONS) {
						const firstKey = scrollPositions.keys().next().value;
						scrollPositions.delete(firstKey);
					}
				}
			} catch (error) {
				console.error("[Lenis] 스크롤 위치 저장 중 오류: ", error);
			}
		});

		// 페이지 전환 시 스크롤 처리
		nuxtApp.hook("page:finish", () => {
			setTimeout(() => {
				try {
					const currentPath = route.path;

					// 방문 기록에 추가 (popstate가 아닌 경우)
					if (!isBackNavigation) {
						visitedPages.push(currentPath);

						// 배열 크기 제한
						if (visitedPages.length > MAX_STORED_POSITIONS) {
							visitedPages.shift();
						}
					}

					// 뒤로가기인 경우에만 저장된 위치로, 나머지는 최상단으로
					if (isBackNavigation && scrollPositions.has(currentPath)) {
						const savedPosition = scrollPositions.get(currentPath);
						lenis.scrollTo(savedPosition, { immediate: true });
						// 방문 기록에서 마지막 항목 제거
						visitedPages.pop();
					} else {
						lenis.scrollTo(0, { immediate: true });
					}

					// 플래그 초기화
					isBackNavigation = false;
				} catch (error) {
					console.error("[Lenis] 스크롤 위치 복원 중 오류: ", error);
					try {
						lenis.scrollTo(0, { immediate: true });
					} catch (fallbackError) {
						console.error("[Lenis] Fallback 스크롤 실패: ", fallbackError);
					}
					isBackNavigation = false;
				}
			}, 50);
		});
	}
});
