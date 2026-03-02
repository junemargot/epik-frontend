export const useAdminDashboard = () => {
  const { data: statsData } = useAuthFetch('/admin/dashboard/stats');
  const { data: noticeData } = useAuthFetch('/admin/notice', {
    params: { p: 1, size: 5, sort: 'writeData,desc' }
  });
  const { data: inquiryData } = useAuthFetch('/admin/inquiry', {
    params: { page: 0, size: 5 }
  });

  const stats = computed(() => {
    const d = statsData.value || {};
    return {
      totalContents: d.totalContents || 0,
      ongoingContents: d.ongoingContents || 0,
      todayContents: d.todayContents || 0,
      totalConcerts: d.totalConcerts || 0,
      totalMusicals: d.totalMusicals || 0,
      totalExhibitions: d.totalExhibitions || 0,
      totalPopups: d.totalPopups || 0,
      regionStats: d.regionStats || [],
      genreStats: d.genreStats || [],
      lastKopisSyncTime: d.lastKopisSyncTime || null,
      ongoingContentsByType: d.ongoingContentsByType || {},
      todayContentsByType: d.todayContentsByType || {}
    };
  });

  const notices = computed(() =>
    (noticeData.value?.noticeList || []).map(n => ({
      id: n.id, title: n.title, writer: n.writer, date: n.writeDate
    }))
  );

  const inquiries = computed(() =>
    (inquiryData.value?.content || []).map(i => ({
      id: i.id, title: i.title, writer: i.writer, date: i.createdAt
    }))
  );

  return { stats, notices, inquiries };
};