/**
 * 범용 북마크 composable
 * @param {string} type - 'concert' | 'musical' | 'exhibition'
 */

export const useBookmark = (type = 'concert') => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  // 타입 검증
  const validTypes = ['concert', 'musical', 'exhibition'];
  if(!validTypes.includes(type)) {
    console.error(`Invalid bookmark type: ${type}. Must be one of ${validTypes.join(', ')}`);
    type = 'concert'; // 기본값
  }

  /**
   * 북마크 상태 조회
   */
  // const getBookmarkStatus = async (concertId) => {
  //   try {
  //     const response = await $fetch(`${apiBase}/member/concert/${concertId}/bookmark/status`, {
  //       method: 'GET',
  //       credentials: 'include',
  //     });

  //     return {
  //       isBookmarked: response?.isBookmarked || false,
  //       authenticated: response?.authenticated !== false
  //     };
  //   } catch (error) {
  //     console.error('북마크 상태 조회 실패:', error);
  //     return { isBookmarked: false, authenticated: false };
  //   }
  // };
  const getBookmarkStatus = async (itemId) => {
    try {
      const response = await $fetch(`${apiBase}/member/${type}/${itemId}/bookmark/status`, {
        method: 'GET',
        credentials: 'include',
      });

      return {
        isBookmarked: response?.isBookmarked || false,
        authenticated: response?.authenticated !== false
      };
    } catch (error) {
      console.error(`${type} 북마크 상태 조회 실패:`, error);
      return { isBookmarked: false, authenticated: false };
    }
  };

  /**
   * 북마크 토글 (추가/삭제)
   */
  // const toggleBookmark = async (concertId) => {
  //   try {
  //     const response = await $fetch(`${apiBase}/member/concert/${concertId}/bookmark/toggle`, {
  //       method: 'POST',
  //       credentials: 'include',
  //     });

  //     return {
  //       success: response?.success !== false,
  //       isBookmarked: response?.isBookmarked || false,
  //       message: response?.message || '',
  //     };
  //   } catch (error) {
  //     console.error('북마크 토글 실패:', error);
      
  //     if (error.statusCode === 401) {
  //       return {
  //         success: false,
  //         isBookmarked: false,
  //         message: '로그인이 필요합니다.',
  //         needLogin: true
  //       };
  //     }
      
  //     return {
  //       success: false,
  //       isBookmarked: false,
  //       message: '북마크 처리 중 오류가 발생했습니다.'
  //     };
  //   }
  // };
  const toggleBookmark = async (itemId) => {
    try {
      const response = await $fetch(`${apiBase}/member/${type}/${itemId}/bookmark/toggle`, {
        method: 'POST',
        credentials: 'include',
      });

      return {
        success: response?.success !== false,
        isBookmarked: response?.isBookmarked || false,
        message: response?.message || '',
      };
    } catch (error) {
      console.error(`${type} 북마크 토글 실패:`, error);

      if(error.statusCode === 401) {
        return {
          success: false,
          isBookmarked: false,
          message: '로그인이 필요합니다.',
          needLogin: true
        };
      }

      return {
        success: false,
        isBookmarked: false,
        message: '북마크 처리 중 오류가 발생했습니다.'
      };
    }
  };

  return {
    getBookmarkStatus,
    toggleBookmark,
  };
};
