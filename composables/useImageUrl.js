export const useImageUrl = () => {
  const config = useRuntimeConfig();

  const getImageUrl = (item, type) => {
    if(!item) return null;

    // 1. KOPIS API 데이터인 경우
    if(item.dataSource === 'KOPIS_API') {
      // 백엔드에서 캐시된 이미지 경로를 반환하는 경우
      if(item.imageUrl) {
        // 상대 경로면 백엔드 URL 붙이기
        if(item.imageUrl.startsWith('/cache') || item.imageUrl.startsWith('/api')) {
          return `${config.public.apiBase}${item.imageUrl}`;
        }
        return item.imageUrl;
      }

      // saveImageName이 HTTP URL인 경우 (KOPIS 원본 URL)
      if (item.saveImageName && item.saveImageName.startsWith('http')) {
        return item.saveImageName;
      }
    }

    // 2. 수기 입력 데이터 (로컬 업로드 이미지)
    if (item.saveImageName && !item.saveImageName.startsWith('http')) {
      return `${config.public.apiBase}/uploads/images/${type}/${item.saveImageName}`;
      // 결과: http://localhost:8081/api/v1/uploads/images/popup/abc123.png
    }

    // 3. imageFileName도 확인 (normalizeData에서 생성)
    if (item.imageFileName && !item.imageFileName.startsWith('http')) {
      return `${config.public.apiBase}/uploads/images/${type}/${item.imageFileName}`;
    }

    // 3. 기본 fallback
    console.warn("useImageUrl: No valid image found for item", item);
    return null;
  };

  return {
    getImageUrl
  };
}