<!-- ADMIN MAIN PAGE -->
<template>
  <div class="admin_wrap">
    <section id="content">
      <main>
        <!-- 통계 카드 -->
        <div class="content__info-data">
          <StatCard
            label="전체 콘텐츠"
            icon="bx-book-content"
            :count="stats.totalContents"
            :breakdown="{
              popups: stats.totalPopups,
              concerts: stats.totalConcerts,
              musicals: stats.totalMusicals,
              exhibitions: stats.totalExhibitions
            }"
            empty-message="등록된 콘텐츠가 없습니다"
          />
          <StatCard
            label="진행 중인 행사"
            icon="bx-doughnut-chart"
            :count="stats.ongoingContents"
            :breakdown="stats.ongoingContentsByType"
            empty-message="진행 중인 행사가 없습니다"
          />
          <StatCard 
            label="오늘 등록된 콘텐츠"
            icon="bx-message-square-add"
            :count="stats.todayContents"
            :breakdown="stats.todayContentsByType"
            empty-message="오늘 등록된 콘텐츠가 없습니다"
          />
          <SyncStatusCard :sync-time="stats.lastKopisSyncTime" />
        </div>
        
        <!-- 차트 섹션 -->
        <div class="charts-section">
          <ChartSection
            title="지역별 콘텐츠 분포"
            :data="stats.regionStats"
            label-key="regionName"
            value-key="count"
          />
          <ChartSection
            title="장르별 콘텐츠 분포"
            :data="stats.genreStats"
            label-key="genreName"
            value-key="count"
          />
        </div>

        <!-- 게시글 섹션 -->
        <div class="data">
          <ContentSection
            title="공지사항"
            link="/admin/notice"
            :items="notices"
            :show-write-button="true"
          />
          <ContentSection
            title="1:1 문의내역"
            link="/admin/inquiry"
            :items="inquiries"
          />
        </div>
      </main>
    </section>
  </div>
</template>

<script setup>
import StatCard from '~/components/admin/dashboard/StatCard.vue';
import SyncStatusCard from '~/components/admin/dashboard/SyncStatusCard.vue';
import ChartSection from '~/components/admin/dashboard/ChartSection.vue';
import ContentSection from '~/components/admin/dashboard/ContentSection.vue';

const { stats, notices, inquiries } = await useAdminDashboard();
</script>

<style lang="css" scoped>
@import url('public/css/admin/index.css');
</style>
