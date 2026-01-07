export const useImageUtils = () => {
  /**
   * 컨텐츠 타입과 데이터에 따라 동적으로 이미지 URL을 생성
   * @param {Object} item - 콘서트, 뮤지컬, 전시회 등의 데이터
   * @param {String} contentType - 'concert', 'musical', 'exhibition', 'popup'
   * @returns {String | null} - 이미지 URL 또는 null
   */
  const getImageUrl = (item, contentType) => {
    if(!item) return null;

    // KOPIS API 데이터인 경우
    if(item.dataSource === 'KOPIS_API') {
      // imageUrl이 있으면 사용 (KOPIS 포스터 URL)
      if(item.imageUrl) {
        return item.imageUrl;
      }
      // imageUrl이 없고 saveImageName이 HTTP URL인 경우
      if(item.saveImageName && item.saveImageName.startsWith('http')) {
        return item.saveImageName;
      }
    }

    // 수기 입력 데이터이거나 로컬 이미지인 경우
    if(item.saveImageName && !item.saveImageName.startsWith('http')) {
      return `http://localhost:8081/api/v1/uploads/images/${contentType}/${item.saveImageName}`;
    }

    // 기본 이미지 또는 null
    return null;
  };

  /**
   * 이미지 로드 에러 처리
   * @param {Event} event - 이미지 에러 이벤트
   * @param {String} fallbackUrl - 대체 이미지 URL
   */
  const handleImageError = (event, initialFallbackUrl = null) => {
    console.warn('이미지 로드 실패:', event.target.src);

    const defaultFallbackUrl = '/images/default-poster.png';
    const currentSrc = event.target.src;

    if(currentSrc.includes(defaultFallbackUrl)) {
      // 이미 기본 대체 이미지를 로드하려 했으나 실패한 경우, 숨김 처리
      event.target.style.display = 'none';
      console.error("기본 대체 이미지 로드에 실패했습니다. 이미지를 숨깁니다.");
    } else if(initialFallbackUrl && currentSrc !== initialFallbackUrl) {
      // 초기 대체 url이 있고, 아직 로드하지 않은 경우 (초기 대체 이미지 시도)
      event.target.src = initialFallbackUrl;
    } else {
      // 초기 대체 url이 없거나 이미 실패한 경우 (기본 대체 이미지 로드 시도)
      event.target.src = defaultFallbackUrl;
    }
  };

  /**
   * 이미지 URL 유효성 검사
   * @param {String} url - 검사할 이미지 url
   * @returns {Boolean} - 유효한 이미지 URL인지 여부
   */
  const isValidImageUrl = (url) => {
    if(!url) return false;

    // HTTP/HTTPS로 시작하는 절대 URL이거나 상대 경로인 경우
    return url.startsWith('http') || url.startsWith('/');
  };

  /**
   * 데이터 소스에 따른 이미지 처리 설명 텍스트
   * @param {String} dataSource - 'MANUAL', 'KOPIS_API'
   * @returns {String} - 설명 텍스트
   */
  const getImageSourceDescription = (dataSource) => {
    switch(dataSource) {
      case 'KOPIS_API':
        return 'KOPIS_API에서 제공하는 공식 포스터 이미지';
      case 'MANUAL':
        return '관리자가 직접 업로드한 이미지';
      default:
        return '이미지 정보 없음';
    }
  };

  return {
    getImageUrl,
    handleImageError,
    isValidImageUrl,
    getImageSourceDescription
  };
};