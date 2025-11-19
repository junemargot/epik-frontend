// export const useFeed = () => {
//   const feeds = ref([]);
//   const loading = ref(false);
//   const hasMore = ref(true);
//   const lastId = ref(null);
//   const config = useRuntimeConfig();
//   const apiBase = config.public.apiBase || 'http://localhost:8081/api/v1';

//   // 1. 피드 목록 조회 (무한 스크롤)
//   const fetchFeeds = async (categoryId = null) => {
//     if(loading.value) return;

//     loading.value = true;
//     try {
//       // let url = `${apiBase}/feed` // 전체 조회
//       let url = '/feed';
//       if(categoryId) {
//         url = `/feed/category/${categoryId}`
//       }

//       const params = {};
//       if(lastId.value) {
//         params.lastId = lastId.value;
//       }

//       const { data } = await useAuthFetch(url, { params });
//       if(data.value && data.value.length > 0) {
//         feeds.value.push(...data.value);
//         lastId.value = data.value[data.value.length - 1].id;
//         hasMore.value = data.value.length >= 10; // 백엔드에서 기본 10개씩 반환 
//       } else {
//         hasMore.value = false;
//       }
//     } catch(error) {
//       console.error("피드 조회 실패: ", error);
//     } finally {
//       loading.value = false;
//     }
//   }

//   // 2. 피드 초기화 (카테고리 변경 시)
//   const resetFeeds = () => {
//     feeds.value = [];
//     lastId.value = null;
//     hasMore.value = true;
//   }

//   // 3. 피드 작성
//   const createFeed = async (formData) => {
//     try {
//       const { data } = await useAuthFetch('/feed', {
//         method: 'POST',
//         body: formData
//       });
//       return data.value;
    
//     } catch(error) {
//       console.error("피드 작성 실패: ", error);
//       throw error;
//     }
//   }

//   // 4. 좋아요 토글
//   const toggleLike = async (feedId, isLiked) => {
//     try {
//       const method = isLiked ? 'DELETE' : 'POST';
//       await useAuthFetch(`/feed/${feedId}/like`, { method });

//       // 로컬 상태 업데이트
//       const feed = feeds.value.find(f => f.id === feedId);
//       if(feed) {
//         feed.isLiked = !isLiked;
//         feed.likeCount += isLiked ? -1 : 1;
//       }
//       return true;

//     } catch(error) {
//       console.error("좋아요 처리 실패", error);
//       return false;
//     }
//   }

//   // 5. 댓글 목록 조회
//   const fetchComments = async (feedId) => {
//     try {
//       const { data } = await useAuthFetch(`/feed/${feedId}/comment`);
//       return data.value || [];
//     } catch(error) {
//       console.error("댓글 조회 실패: ", error);
//       return [];
//     }
//   }

//   // 6. 댓글 작성
//   const createComment = async (feedId, content) => {
//     try {
//       const { data } = await useAuthFetch(`/feed/${feedId}/comment`, {
//         method: 'POST',
//         body: { content }
//       });
//       return data.value;

//     } catch(error) {
//       console.error("댓글 작성 실패: ", error);
//       throw error;
//     }
//   }

//   // 7. 댓글 수정
//   const updateComment = async (feedId, commentId, content) => {
//     try {
//       await useAuthFetch(`/feed/${feedId}/comment/${commentId}`, {
//         method: 'POST',
//         body: { content }
//       });
//       return true;
    
//     } catch(error) {
//       console.error("댓글 수정 실패: ", error);
//       return false;
//     }
//   }

//   // 8. 댓글 삭제
//   const deleteComment = async (feedId, commentId) => {
//     try {
//       await useAuthFetch(`/feed/${feedId}/comment/${commentId}`, {
//         method: 'DELETE'
//       })
//       return true
//     } catch (error) {
//       console.error('댓글 삭제 실패:', error)
//       return false
//     }
//   }

//   return {
//     feeds,
//     loading,
//     hasMore,
//     lastId,
//     fetchFeeds,
//     resetFeeds,
//     createFeed,
//     toggleLike,
//     fetchComments,
//     createComment,
//     updateComment,
//     deleteComment
//   };
// }