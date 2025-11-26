import { defineStore } from "pinia";

export const useFeedStore = defineStore('feed', {
  state: () => ({
    feeds: [],
    loading: false,
    hasMore: true,
    lastId: null,
    initialized: false, // 초기화 여부 플래그
    version: 2
  }),

  actions: {
    // localStorage에서 상태 복구
    loadFromStorage() {
      if (process.client) {
        try {
          const saved = localStorage.getItem('feedStore');
          if (saved) {
            const data = JSON.parse(saved);

            // 버전 체크: 버전이 다르면 localStorage 무시
            if(data.version !== this.version) {
              console.log("localStorage 버전 불일치. 데이터 초기화");
              localStorage.removeItem('feedStore');
              return;
            }

            this.feeds = data.feeds || [];
            this.lastId = data.lastId || null;
            this.hasMore = data.hasMore ?? true;
            this.initialized = data.initialized || false;
            console.log('localStorage에서 피드 복구:', this.feeds.length, '개');
          }
        } catch (error) {
          console.error('localStorage 로드 실패:', error);
        }
      }
    },

    // localStorage에 상태 저장
    saveToStorage() {
      if (process.client) {
        try {
          const data = {
            feeds: this.feeds,
            lastId: this.lastId,
            hasMore: this.hasMore,
            initialized: this.initialized,
            version: this.version
          };
          localStorage.setItem('feedStore', JSON.stringify(data));
        } catch (error) {
          console.error('localStorage 저장 실패:', error);
        }
      }
    },

    // 피드 목록 조회
    async fetchFeeds(categoryId = null) {
      if(this.loading) return;

      this.loading = true;
      try {
        let url = '/feed';
        if(categoryId) {
          url = `/feed/category/${categoryId}`;
        }

        const params = {};
        if(this.lastId) {
          params.lastId = this.lastId;
        };
        console.log("fetchFeeds() API 요청: ", url, params);
        
        const { data } = await useAuthFetch(url, { params });
        console.log("fetchFeeds() API 응답: ", data.value);

        if(data.value && data.value.length > 0) {
          this.feeds.push(...data.value);
          this.lastId = data.value[data.value.length - 1].feedId;
          this.hasMore = data.value.length >= 10;
          this.initialized = true;
          this.saveToStorage();
        } else {
          this.hasMore = false;
          this.initialized = true;
          this.saveToStorage();
        }

      } catch(error) {
        console.error("피드 조회 실패: ", error);
        this.initialized = true;

      } finally {
        this.loading = false;
      }
    },

    // 피드 초기화
    resetFeeds() {
      this.feeds = [];
      this.lastId = null;
      this.hasMore = true;
      this.initialized = false;
      this.saveToStorage();
    },

    // 피드 작성
    async createFeed(formData) {
      try {
        const { data } = await useAuthFetch('/feed', {
          method: 'POST',
          body: formData
        });
        return data.value;
      } catch(error) {
        console.error("피드 작성 실패: ", error);
        throw error;
      }
    },

    // 좋아요 토글
    async toggleLike(feedId, isLiked) {
      try {
        const response = await useAuthFetch(`/feed/${feedId}/like`, { 
          method: 'POST',
        });

        // 에러 체크
        if(response.error.value) {
          console.error("좋아요 API 호출 에러: ", response.error.value);
          return false;
        }

        // 로컬 상태 업데이트
        const feed = this.feeds.find(f => f.feedId === feedId)
        if (feed) {
          feed.isLiked = !isLiked;
          feed.likeCount += isLiked ? -1 : 1;
          this.saveToStorage();
        }
        return true;
      } catch (error) {
        console.error('좋아요 처리 실패:', error);
        return false;
      }
    },

    // 댓글 목록 조회
    async fetchComments(feedId) {
      try {
        const { data } = await useAuthFetch(`/feed/${feedId}/comment`);
        return data.value || [];
      } catch(error) {
        console.error("댓글 조회 실패: ", error);
        return;
      }
    },

    // 댓글 작성
    async createComment(feedId, content) {
      try {
        const { data } = await useAuthFetch(`/feed/${feedId}/comment`, {
          method: 'POST',
          body: { content }
        });

        // 댓글 수 증가
        const feed = this.feed.find(f => f.feedId === feedId);
        if(feed) {
          feed.commentCount = (feed.commentCount || 0) + 1;
          this.saveToStorage();
        }

        return data.value;
      } catch(error) {
        console.error("댓글 작성 실패: ", error);
        throw error;
      }
    },

    // 댓글 수정
    async updateComment(feedId, commentId, contnet) {
      try {
        await useAuthFetch(`/feed/${feedId}/comment/${commentId}`, {
          method: 'POST',
          body: { content }
        });

        return true;
      } catch(error) {
        console.error("댓글 수정 실패", error);
        return false;
      }
    },

    // 댓글 삭제
    async deleteComment(feedId, commentId) {
      try {
        await useAuthFetch(`/feed/${feedId}/comment/${commentId}`, {
          method: 'DELETE'
        });

        // 댓글 수 감소
        const feed = this.feed.find(f => f.feedId === feedId);
        if(feed && feed.commentCount > 0) {
          feed.commentCount -= 1;
          this.saveToStorage();
        }

        return true;
      } catch(error) {
        console.error("댓글 삭제 실패: ", error);
        return false;
      }
    }
  }
});