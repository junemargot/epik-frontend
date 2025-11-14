<!-- ADMIN MAIN PAGE -->
<template>
  <div class="admin_wrap">
    <section id="content">
      <main>
        <div class="content__info-data">
          <div class="card">
            <div class="card__head">
              <div>
                <h2>{{ dashboardStats.totalContents || 0 }}<span>건</span></h2>
                <p>전체 콘텐츠</p>
                <p>{{ getToday() }}</p>
              </div>
              <i class='bx bx-book-content icon'></i>
            </div>
            <div class="card__breakdown">
              <div class="breakdown-item">
                <span class="label">팝업</span>
                <span class="value">{{ dashboardStats.totalPopups || 0 }}건</span>
              </div>
              <div class="breakdown-item">
                <span class="label">콘서트</span>
                <span class="value">{{ dashboardStats.totalConcerts || 0 }}건</span>
              </div>
              <div class="breakdown-item">
                <span class="label">뮤지컬</span>
                <span class="value">{{ dashboardStats.totalMusicals || 0 }}건</span>
              </div>
              <div class="breakdown-item">
                <span class="label">전시회</span>
                <span class="value">{{ dashboardStats.totalExhibitions || 0 }}건</span>
              </div>
            </div>
          </div>
          <div class="card card--ongoing">
            <div class="card__head">
              <div>
                <h2>{{ dashboardStats.ongoingContents || 0 }}<span>건</span></h2>
                <p>진행 중인 행사</p>
                <p>{{ getToday() }}</p>
              </div>
              <i class='bx bx-doughnut-chart icon'></i>
              <!-- <i class="bx bx-trending-up icon"></i> -->
            </div>
            <!-- <span class="card__progress" :data-value="calculateProgress(dashboardStats.ongoingContents, dashboardStats.totalContents)"></span>
            <span class="label">{{ calculateProgress(dashboardStats.ongoingContents, dashboardStats.totalContents) }}</span> -->
            <!-- 기존 progress bar 제거 타입별 분포 -->
            <div class="card__breakdown">
              <div class="breakdown-item">
                <span class="label">팝업</span>
                <span class="value">{{ dashboardStats.ongoingContentsByType.popups || 0 }}건</span>
              </div>
              <div class="breakdown-item">
                <span class="label">콘서트</span>
                <span class="value">{{ dashboardStats.ongoingContentsByType.concerts || 0 }}건</span>
              </div>
              <div class="breakdown-item">
                <span class="label">뮤지컬</span>
                <span class="value">{{ dashboardStats.ongoingContentsByType.musicals || 0 }}건</span>
              </div>
              <div class="breakdown-item">
                <span class="label">전시회</span>
                <span class="value">{{ dashboardStats.ongoingContentsByType.exhibitions || 0 }}건</span>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card__head">
              <div>
                <h2>{{ dashboardStats.todayContents || 0 }}<span>건</span></h2>
                <p>오늘 등록된 콘텐츠</p>
                <p>{{ getToday() }}</p>
              </div>
              <i class='bx bx-message-square-add icon'></i>
              <!-- <i class="bx bx-trending-up icon"></i> -->
            </div>
            <span class="card__progress" :data-value="'40%'"></span>
            <span class="label">40%</span>
          </div>
          <div class="card">
            <div class="card__head">
              <div>
                <h2>
                  <span>
                    <p v-if="dashboardStats.lastKopisSyncTime">{{ formatSyncTime(dashboardStats.lastKopisSyncTime) }}</p>
                    <p v-else>동기화 기록 없음</p>
                  </span>
                </h2>
                <p>최근 동기화 시간</p>
                <p>{{ formatDateOnly(dashboardStats.lastKopisSyncTime) }}</p>
              </div>
              <i class="bx bx-refresh icon"></i>
            </div>
            <span class="card__progress" :data-value="'50%'"></span>
            <span class="label">50%</span>
          </div>   
        </div>
        
        <div class="charts-section">
          <!-- 지역별 분포 -->
          <div class="chart-card">
            <div class="chart-header" @click="isRegionChartOpen = !isRegionChartOpen">
              <h3>지역별 콘텐츠 분포</h3>
              <i class="bx bx-chevron-down icon" :class="{ 'rotate': isRegionChartOpen }"></i>
            </div>
            <div class="chart-content" v-if="isRegionChartOpen">
              <div v-if="dashboardStats.regionStats && dashboardStats.regionStats.length > 0">
                <div v-for="region in dashboardStats.regionStats" :key="region.regionName" class="chart-bar">
                  <div class="bar-label">{{ region.regionName }}</div>
                  <div class="bar-wrapper">
                    <div class="bar-fill" :style="{ width: calculatePercentage(region.count, maxRegionCount) + '%' }"></div>
                    <span class="bar-value" :class="{ 'white-text': calculatePercentage(region.count, maxRegionCount) >= 100 }">{{ region.count }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="no-data">데이터가 없습니다</div>
            </div>
          </div>

          <!-- 장르별 분포 -->
          <div class="chart-card">
            <div class="chart-header" @click="isGenreChartOpen = !isGenreChartOpen">
              <h3>장르별 콘텐츠 분포</h3>
              <i class="bx bx-chevron-down icon" :class="{ 'rotate': isGenreChartOpen }"></i>
            </div>
            <div class="chart-content" v-if="isGenreChartOpen">
              <div v-if="dashboardStats.genreStats && dashboardStats.genreStats.length > 0">
                <div v-for="genre in dashboardStats.genreStats" :key="genre.genreName" class="chart-bar">
                  <div class="bar-label">{{ genre.genreName }}</div>
                  <div class="bar-wrapper">
                    <div class="bar-fill" :style="{ width: calculatePercentage(genre.count, maxGenreCount) + '%' }"></div>
                    <span class="bar-value" :class="{ 'white-text': calculatePercentage(genre.count, maxGenreCount) >= 100}">{{ genre.count }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="no-data">데이터가 없습니다</div>
            </div>
          </div>
        </div>

        <!-- 게시글 섹션 -->
        <div class="data">
          <div class="content-data" v-for="(section, index) in contentSections" :key="index">
            <div class="head">
              <h3>
                <Router-Link :to="section.link">{{ section.title }}</Router-Link>
              </h3>
              <div class="menu">
                <i class='bx bx-dots-horizontal-rounded icon' @click="toggleMenu(index)"></i>
                <ul class="menu-link" :class="{ show: isMenuOpen[index] }">
                  <li>
                    <RouterLink :to="section.link">더보기</RouterLink>
                  </li>
                  <li v-if="section.title === '공지사항'">
                    <RouterLink to="/admin/notice/new">글작성</RouterLink>
                  </li>
                </ul>
              </div>
            </div>
            <div class="notice">
              <table>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(notice, idx) in section.items" :key="notice.id">
                    <td class="content-num">{{ notice.id }}</td>
                    <td class="content-title">
                      <RouterLink :to="`/admin/notice/${notice.id}`">{{ notice.title }}</RouterLink>
                    </td>
                    <td class="content-writer">{{ notice.writer }}</td>
                    <td class="content-date">{{ formatDate(notice.writeDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const config = useRuntimeConfig();
const apiBase = config.public.apiBase || 'http://localhost:8081/api/v1';

// setup 단계 호출
const { data: dashboardData, error: dashboardError, pending: dashboardPending } = await useAuthFetch('/admin/dashboard/stats');
const { data: noticeData, error: noticeError } = await useAuthFetch('/admin/notice', {
  params: {
    p: 1,
    size: 5,
    sort: 'writeData,desc'
  }
});

const dashboardStats = computed(() => {
  const data = dashboardData.value || {};
  console.log('dashboardData.value: ', data);
  console.log('ongoingContentsByType: ', data.ongoingContentsByType);

  return {
    totalContents: data.totalContents || 0,
    ongoingContents: data.ongoingContents || 0,
    todayContents: data.todayContents || 0,
    totalConcerts: data.totalConcerts || 0,
    totalMusicals: data.totalMusicals || 0,
    totalExhibitions: data.totalExhibitions || 0,
    totalPopups: data.totalPopups || 0,
    regionStats: data.regionStats || [],
    genreStats: data.genreStats || [],
    lastKopisSyncTime: data.lastKopisSyncTime || null,
    ongoingContentsByType: data.ongoingContentsByType || {
      popups: 0,
      concerts: 0,
      musicals: 0,
      exhibitions: 0
    }
  };
});

const adminNotices = computed(() => noticeData.value?.noticeList || []);
const contentSections = computed(() => [
  {
    title: '공지사항',
    link: '/admin/notice',
    items: adminNotices.value.map(notice => ({
      id: notice.id,
      title: notice.title,
      writer: notice.writer,
      writeDate: notice.writeDate
    }))
  },
  {
    title: '1:1 문의내역',
    link: '/admin/inquiries/personal',
    items: [
      { id: 5, title: '회원가입 문의', writer: 'apple1234', writeDate: '2024-11-23' },
      { id: 4, title: '비밀번호 변경 방법', writer: '이영희', writeDate: '2024-11-23' },
      { id: 3, title: '탈퇴 신청 문의', writer: '김철수', writeDate: '2024-11-20' },
      { id: 2, title: '이메일 인증 실패', writer: '박민수', writeDate: '2024-11-20' },
      { id: 1, title: '포인트 적립 관련 문의', writer: '최유리', writeDate: '2024-11-19' },
    ]
  },
  {
    title: '비즈니스 문의내역',
    link: '/admin/inquiries/business',
    items: [
      { id: 5, title: '협찬 제안 문의', writer: '김경민', writeDate: '2024-11-25' },
      { id: 4, title: '공동 이벤트 제안', writer: '담당자', writeDate: '2024-11-23' },
      { id: 3, title: '탈퇴 신청 문의', writer: '김철재', writeDate: '2024-11-20' },
      { id: 2, title: '이메일 인증 실패', writer: '박민수', writeDate: '2024-11-20' },
      { id: 1, title: '포인트 적립 관련 문의', writer: '최유리', writeDate: '2024-11-19' },
    ]
  },
  {
    title: '피드 신고내역',
    link: '/admin/reports/feed',
    items: [
      { id: 5, title: '게시물 수정 요청드립니다.', writer: '바니', writeDate: '2024-11-25' },
      { id: 4, title: '공동 이벤트 제안', writer: '래빗', writeDate: '2024-11-23' },
      { id: 3, title: '탈퇴 신청 문의', writer: '애플', writeDate: '2024-11-20' },
      { id: 2, title: '이메일 인증 실패', writer: '박민수', writeDate: '2024-11-20' },
      { id: 1, title: '포인트 적립 관련 문의', writer: '최유리', writeDate: '2024-11-19' },
    ]
  },
]);

const isMenuOpen = ref([false]);
const isRegionChartOpen = ref(true);
const isGenreChartOpen = ref(true);

// 차트용 최대값 계산
const maxRegionCount = computed(() => {
  if(!dashboardStats.value.regionStats || dashboardStats.value.regionStats.length === 0) return 1;
  return Math.max(...dashboardStats.value.regionStats.map(r => r.count));
});

const maxGenreCount = computed(() => {
  if (!dashboardStats.value.genreStats || dashboardStats.value.genreStats.length === 0) return 1;
  return Math.max(...dashboardStats.value.genreStats.map(g => g.count));
});

// 퍼센티지 계산
const calculatePercentage = (value, max) => {
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
};

const calculateProgress = (ongoing, total) => {
  if (total === 0) return  '0%';
  return Math.round((ongoing / total) * 100) + '%';
}

// 오늘 날짜
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0].replace(/-/g, '.'); // "2025.04.30"
}

// 동기화 시간 포맷
const formatSyncTime = (dateTimeString) => {
  if(!dateTimeString) return '동기화 기록 없음';
  const date = new Date(dateTimeString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // 초 단위

  if(diff < 60) return '방금 전';
  if(diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if(diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\s/g, '').replace(/\.$/, '');
};

const formatDateOnly = (dateTimeString) => {
  if(!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\s/g, '').replace(/\.$/, '');
}

// 날짜 포맷
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = new Date(dateString).toLocaleDateString('ko-KR', options);
  return formattedDate.replace(/\s/g, '').replace(/\.$/, '');
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const progressItems = ref([
  { value: getRandomInt(20, 60), description: '오늘 방문자 수', date: getToday(), unit: '명', progress: '60%' },
  { value: getRandomInt(5, 20), description: '오늘 신규회원', date: getToday(), unit: '명', progress: '30%' },
  { value: getRandomInt(5, 10), description: '새로 등록된 피드', date: getToday(), unit: '건', progress: '40%' },
  { value: getRandomInt(1, 10), description: '1:1 문의접수', date: getToday(), unit: '건', progress: '50%' },
]);

onMounted(() => {
  const allProgress = document.querySelectorAll('main .card__progress');
  allProgress.forEach(item => {
    item.style.setProperty('--value', item.dataset.value);
  });

  console.log('최종 렌더될 progressItem: ', progressItems.value);
});

// 컨텐츠 더 보기 DROPDOWN
const props = defineProps({
  contentSections: {
    type: Array,
    default: () => [] // 기본값으로 빈 배열 설정
  }
}); // contentSections 각 컨텐츠 데이터

// 메뉴 토글
const toggleMenu = (index) => {
  isMenuOpen.value[index] = !isMenuOpen.value[index];
};

const closeMenu = (event) => {
  if (!event.target.closest('.menu')) {
    isMenuOpen.value.fill(false);
  }
};

onMounted(() => {
  window.addEventListener('click', closeMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenu);
});

</script>

<style lang="css" scoped>
@import url('public/css/admin/index.css');
</style>