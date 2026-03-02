<template>
  <div class="card">
    <div class="card__head">
      <div>
        <h2>
          <span v-if="syncTime">{{ relativeTime }}</span>
          <span v-else>동기화 기록 없음</span>
        </h2>
        <p>최근 동기화 시간</p>
        <p>{{ dateOnly }}</p>
      </div>
      <i class="bx bx-refresh icon"></i>
    </div>
    <div class="sync-info">
      <div class="sync-schedule">
        <div class="schedule-item">
          <span class="label">자동 동기화</span>
          <span class="value">매일 새벽 2시</span>
        </div>
        <div class="schedule-item">
          <span class="label">다음 동기화</span>
          <span class="value">{{ nextSyncTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatSyncTime, formatDate } from '~/utils/dateFormat';

const props = defineProps({
  syncTime: { type: String, default: null }
});

const relativeTime = computed(() => formatSyncTime(props.syncTime));
const dateOnly = computed(() => props.syncTime ? formatDate(props.syncTime) : '');

const nextSyncTime = computed(() => {
  const now = new Date();
  const nextSync = new Date();
  nextSync.setHours(2, 0, 0, 0);

  if (now.getHours() >= 2) {
    nextSync.setDate(nextSync.getDate() + 1);
  }

  const diff = nextSync - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours === 0) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}분 후`;
  }
  return `${hours}시간 후`;
});
</script>
