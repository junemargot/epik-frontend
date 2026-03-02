export const getToday = () => {
  return new Date().toISOString().split('T')[0].replace(/-/g, '.');
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\s/g, '').replace(/\.$/, '');
};

export const formatSyncTime = (dateTimeString) => {
  if (!dateTimeString) return '동기화 기록 없음';
  const diff = Math.floor((Date.now() - new Date(dateTimeString)) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

  return formatDate(dateTimeString);
};