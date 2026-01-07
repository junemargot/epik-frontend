export const useProfileImage = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const getProfileImageUrl = (imgValue) => {
    if(!imgValue) {
      return `${apiBase}/uploads/images/user/basic.png`;
    }

    // 외부 URL (카카오, 구글, 네이버 등) - 그대로 반환
    if(imgValue.startsWith('http://') || imgValue.startsWith('https://')) {
      return imgValue;
    }

    // /uploads/로 시작하는 절대 경로
    if(imgValue.startsWith('/uploads/')) {
      return `${apiBase}${imgValue}`;
    }

    // uploads/로 시작하는 상대 경로
    if(imgValue.startsWith('uploads/')) {
      return `${apiBase}/${imgValue}`;
    }

    // 파일명만 있는 경우 (basic.png 등)
    if (imgValue === 'basic.png' || !imgValue.includes('/')) {
      return `${apiBase}/uploads/images/user/${imgValue}`;
    }

    // 기타 경로
    return `${apiBase}${imgValue}`;
  };

  return {
    getProfileImageUrl
  };
}