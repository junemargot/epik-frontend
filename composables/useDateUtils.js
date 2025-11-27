// composables/useDateUtils.js
export const useDateUtils = () => {
  
  /**
   * 서버에서 받은 날짜를 한국시간 기준으로 포맷팅
   * @param {string} dateString - 서버에서 받은 날짜 문자열
   * @param {string} format - 출력 형식 ('date', 'datetime', 'time')
   * @returns {string} - 포맷팅된 날짜 문자열
   */
  const formatDate = (dateString, format = 'date') => {
    if (!dateString) return '';
    
    try {
      // 서버에서 받은 날짜를 Date 객체로 변환
      const date = new Date(dateString);
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return '';
      }
      
      switch (format) {
        case 'date':
          return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Seoul' // 명시적으로 한국시간 지정
          }).replace(/\. /g, '.').replace(/\.$/, '');
          
        case 'datetime':
          return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Seoul'
          }).replace(/\. /g, '.').replace(/\.$/, '');
          
        case 'time':
          return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Seoul'
          });
          
        default:
          return date.toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul'
          });
      }
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return '';
    }
  };

  /**
   * 날짜를 상대적 시간으로 표시 (예: "2일 전", "1시간 전")
   * @param {string} dateString - 날짜 문자열
   * @returns {string} - 상대 시간 문자열
   */
  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      const intervals = [
        { label: '년', seconds: 31536000 },
        { label: '개월', seconds: 2592000 },
        { label: '일', seconds: 86400 },
        { label: '시간', seconds: 3600 },
        { label: '분', seconds: 60 }
      ];
      
      for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count > 0) {
          return `${count}${interval.label} 전`;
        }
      }
      
      return '방금 전';
    } catch (error) {
      console.error('Relative date formatting error:', error);
      return formatDate(dateString);
    }
  };

  /**
   * 1주일까지는 상대시간, 그 이후는 날짜 형식으로 표시
   * @param {string} dateString - 날짜 문자열
   * @returns {string} - "5분 전" 또는 "11월 27일" 또는 "2023년 11월 27일"
   */
  const formatTimeAgo = (dateString) => {
    if(!dateString) return "";

    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffInMs = now - past;
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      // 1주일(7일) 이내: 상대 시간 표시
      if (diffInSeconds < 60) {
        return '방금 전';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
      } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
      } else if (diffInDays < 7) {
        return `${diffInDays}일 전`;
      }

      // 1주일 이후: 날짜 형식으로 표시
      const pastYear = past.getFullYear();
      const currentYear = now.getFullYear();
      const month = past.getMonth() + 1; // 0-based이므로 +1
      const day = past.getDate();

      // 올해 게시글: 월, 일만 표시
      if(pastYear === currentYear) {
        return `${month}월 ${day}일`;
      }

      // 작년 이전 게시글: 연도 포함
      return `${pastYear}년 ${month}월 ${day}일`;
    } catch(error) {
      console.error("Time ago formatting error: ", error);
      return "";
    }
  };

  return {
    formatDate,
    formatRelativeDate,
    formatTimeAgo
  };
};
