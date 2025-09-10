<template>
  <main>
    <div class="kopis-admin-container">
      <div class="admin-header">
        <h1>KOPIS API 데이터 관리</h1>
        <p>KOPIS(공연예술통합전산망) API를 통한 공연 데이터 자동 동기화</p>
      </div>

      <div class="sync-controls">
        <div class="sync-buttons">
          <button 
            @click="syncAllData" 
            :disabled="isLoading"
            class="btn-primary"
          >
            {{ isLoading ? '동기화 중...' : '전체 동기화' }}
          </button>
          
          <button 
            @click="syncConcerts" 
            :disabled="isLoading || concertSyncCompleted"
            class="btn-secondary"
            :class="{ 'btn-loading': isLoading, 'btn-success': lastConcertSyncSuccess, 'btn-disabled': concertSyncCompleted }"
          >
            <i v-if="isLoading" class="loading-spinner"></i>
              {{ getButtonText('concert') }}
          </button>
          <button 
            @click="syncMusicals" 
            :disabled="isLoading || musicalSyncCompleted"
            class="btn-secondary"
            :class="{ 'btn-loading': isLoading, 'btn-success': lastMusicalSyncSuccess, 'btn-disabled': musicalSyncCompleted }"
          >
            <i v-if="isLoading" class="loading-spinner"></i>
              {{ getButtonText('musical') }}
          </button>

          <!-- 데이터 확인 버튼들 추가 -->
          <button 
            @click="viewConcerts" 
            class="btn-info"
          >
            콘서트 데이터 확인
          </button>
          <button 
            @click="viewMusicals" 
            class="btn-info"
          >
            뮤지컬 데이터 확인
          </button>
        </div>

        <!-- 동기화 상태 정보 추가 -->
        <div class="sync-status" v-if="lastSyncResult">
          <div class="status-item">
            <span class="label">처리된 항목:</span>
            <span class="value">{{ lastSyncResult.totalProcessed }}개</span>
          </div>
          <div class="status-item">
            <span class="label">성공:</span>
            <span class="value success">{{ lastSyncResult.successCount }}개</span>
          </div>
          <div class="status-item">
            <span class="label">실패:</span>
            <span class="value error">{{ lastSyncResult.failureCount }}개</span>
          </div>
          <div class="status-item">
            <span class="label">신규:</span>
            <span class="value">{{ lastSyncResult.newItemCount }}개</span>
          </div>
          <div class="status-item">
            <span class="label">업데이트:</span>
            <span class="value">{{ lastSyncResult.updatedItemCount }}개</span>
          </div>
          <div class="status-item">
            <span class="label">마지막 동기화:</span>
            {{ lastSyncResult && lastSyncResult.endTime ? formatTime(lastSyncResult.endTime) : '정보 없음' }}
          </div>
        </div>
      </div>
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div class="sync-log">
        <h3>동기화 로그</h3>
        <div class="log-container">
          <div v-for="log in syncLogs" :key="log.id" class="log-item">
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-type" :class="log.type">{{ log.type.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// 반응형 데이터
const isLoading = ref(false);
const message = ref('');
const messageType = ref('success');
const syncStatus = ref({});
const syncLogs = ref([]);
const lastSyncResult = ref(null); // 마지막 동기화 결과 저장
const lastConcertSyncSuccess = ref(false);
const lastMusicalSyncSuccess = ref(false);
const lastSyncTime = ref(null);
const concertSyncCompleted = ref(false);
const musicalSyncCompleted = ref(false);
const syncCooldownTime = 60000;

// API 호출 함수
const syncAllData = async () => {
  isLoading.value = true;
  message.value = '';

  try {
    const response = await $fetch('/admin/kopis/sync/all', {
      method: 'POST',
      baseURL: config.public.apiBase,
    });

    if(response.success) {
      message.value = response.message;
      messageType.value = 'success';
      addLog('success', '전체 데이터 동기화 완료');
      await getSyncStatus();
    } else {
      throw new Error(response.message);
    }
  } catch(error) {
    message.value = error.message || '전체 동기화 중 오류가 발생했습니다.';
    messageType.value = 'error';
    addLog('error', message.value);
  } finally {
    isLoading.value = false;
  }
}

const syncConcerts = async () => {
  // 이미 완료된 상태면 차단
  if(concertSyncCompleted.value) {
    showToast('warning', '동기화 대기 중', '최근에 동기화를 완료했습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  isLoading.value = true;
  message.value = '';

  try {
    console.log("콘서트 동기화 시작");
    addLog('info', '콘서트 동기화 요청 시작');

    const response = await $fetch('/admin/kopis/sync/concerts', {
      method: 'POST',
      baseURL: config.public.apiBase,
      timeout: 30000, // 30초
    });
    console.log("응답 받음:", response);

    if(response) {
      console.log('받은 응답 상세:', JSON.stringify(response, null, 2)); // 디버깅

      lastSyncResult.value = response; // 결과 저장
      const syncType = response.syncType || 'CONCERT';
      const successCount = response.successCount || 0;
      const skippedCount = response.skippedItemCount || 0;
      const failureCount = response.failureCount || 0;
      const totalProcessed = response.totalProcessed || 0;

      if(totalProcessed === 0) {
        message.value = `${syncType} 동기화 완료: 처리할 데이터가 없습니다.`;
      } else if(skippedCount > 0 && successCount === 0 && failureCount === 0) {
        message.value = `${syncType} 동기화 완료: ${totalProcessed}개 확인, ${skippedCount}개 건너뜀 (조건 불일치)`;
      } else  {
        message.value = `${syncType} 동기화 완료: 성공 ${successCount}개, 실패 ${failureCount}개, 건너뜀 ${skippedCount}개`;
      }
      messageType.value = 'success';
      
      if(successCount > 0 || failureCount > 0) {
        addLog('success', `콘서트 데이터 동기화 완료 - 성공 ${successCount}개, 실패 ${failureCount}개`);
      } else if(skippedCount > 0) {
        addLog('info', `콘서트 데이터 동기화 완료 - ${skippedCount}개 건너뜀 (조건 불일치)`);
      } else {
        addLog('info', `콘서트 데이터 동기화 완료 - 처리할 데이터 없음`);
      }

      lastConcertSyncSuccess.value = true;
      lastSyncTime.value = new Date();
      concertSyncCompleted.value = true;
      setTimeout(() => {
        concertSyncCompleted.value = false;
      }, syncCooldownTime);

    } else {
      console.error('응답 형식:', response);
      throw new Error('응답 형식이 올바르지 않습니다.');
    }
  } catch(error) {
    if (error.message.includes('timeout')) {
      message.value = '동기화가 진행 중입니다. 잠시 후 데이터를 확인해주세요.';
      messageType.value = 'warning';
    } else {
      message.value = error.message || '콘서트 동기화 중 오류가 발생했습니다.';
      messageType.value = 'error';
    }
    addLog('error', message.value);
  } finally {
    isLoading.value = false;
  }
}

const syncMusicals = async () => {
  isLoading.value = true;
  message.value = '';

  try {
    console.log('뮤지컬 동기화 시작');
    addLog('info', '뮤지컬 동기화 요청 시작');

    const response = await $fetch('/admin/kopis/sync/musicals', {
      method: 'POST',
      baseURL: config.public.apiBase,
      timeout: 30000,
    });
    console.log("응답 받음:", response);

    if(response) {
      console.log('받은 응답 상세:', JSON.stringify(response, null, 2)); // 디버깅

      lastSyncResult.value = response; // 결과 저장
      const syncType = response.syncType || 'MUSICAL'
      const successCount = response.successCount || 0;
      const skippedCount = response.skippedItemCount || 0;
      const failureCount = response.failureCount || 0;
      const totalProcessed = response.totalProcessed || 0;

      if(totalProcessed === 0) {
        message.value = `${syncType} 동기화 완료: 처리할 데이터가 없습니다.`;
      } else if(skippedCount > 0 && successCount === 0 && failureCount === 0) {
        message.value = `${syncType} 동기화 완료: ${totalProcessed}개 확인, ${skippedCount}개 건너뜀 (조건 불일치)`;
      } else  {
        message.value = `${syncType} 동기화 완료: 성공 ${successCount}개, 실패 ${failureCount}개, 건너뜀 ${skippedCount}개`;
      }
      messageType.value = 'success';
      
      if(successCount > 0 || failureCount > 0) {
        addLog('success', `뮤지컬 데이터 동기화 완료 - 성공 ${successCount}개, 실패 ${failureCount}개`);
      } else if(skippedCount > 0) {
        addLog('info', `뮤지컬 데이터 동기화 완료 - ${skippedCount}개 건너뜀 (조건 불일치)`);
      } else {
        addLog('info', `뮤지컬 데이터 동기화 완료 - 처리할 데이터 없음`);
      }

      lastMusicalSyncSuccess.value = true;
      lastSyncTime.value = new Date();
      musicalSyncCompleted.value = true;
      setTimeout(() => {
        musicalSyncCompleted.value = false;
      }, syncCooldownTime);

    } else {
      console.error('응답 형식:', response);
      throw new Error('응답 형식이 올바르지 않습니다.');
    }
  } catch(error) {
    if(error.message.incllude('timeout')) {
      message.value = '동기화가 진행 중입니다. 잠시 후 데이터를 확인해주세요.';
      messageType.value = 'warning';
    } else {
      message.value = error.message || '뮤지컬 동기화 중 오류가 발생했습니다.';
      messageType.value = 'error';
    }
    addLog('error', message.value);
  } finally {
    isLoading.value = false;
  }
}

const getSyncStatus = async () => {
  try {
    const response = await $fetch('/admin/kopis/sync/status', {
      baseURL: config.public.apiBase,
    });
    if(response.success) {
      syncStatus.value = response;
    }
  } catch(error) {
    console.error('동기화 상태 조회 중 오류가 발생했습니다.: ', error);
  }
}

// 토스트 알림 함수
const showToast = (type, title, message) => {
  const existingToast = document.querySelector('.toast');
  if(existingToast) existingToast.remove();

  // 새 토스트 생성
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML - `
    <div class="toast-header">
      <strong>${title}</strong>
      <button class="toast-close">&times;</button>
    </div>
    <div class="toast-body">${message}</div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);

  // 닫기 이벤트
  toast.querySelector('.toast-close').onclick = () => toast.remove();
};

// 데이터 확인 함수들
const viewConcerts = () => {
  // 콘서트 관리 페이지로 이동
  navigateTo('/admin/contents/concert');
}

const viewMusicals = () => {
  // 뮤지컬 관리 페이지로 이동
  navigateTo('/admin/contents/musical');
}

// 유틸리티 함수들
const getStatusText = (status) => {
  const statusMap = {
    'RUNNING': '진행중',
    'COMPLETED': '완료',
    'ERROR': '오류',
    'PENDING': '대기중',
  }
  return statusMap[status] || '알 수 없음'
}

const addLog = (type, message) => {
  syncLogs.value.unshift({
    id: Date.now(),
    timestamp: new Date(),
    type,
    message,
  });

  // 최대 50개 로그만 유지
  if(syncLogs.value.length > 50) {
    syncLogs.value = syncLogs.value.slice(0, 50);
  }
}

const formatTime = (timestamp) => {
  if(!timestamp) return '시간 정보 없음';

  try {
    let date;

    if(timestamp instanceof Date) {
      date = timestamp;
    } else if(typeof timestamp === 'string') {
      let dateString = timestamp;
      const microsecondPattern = /(\.\d{3})\d{3,}/;
      if(microsecondPattern.test(dateString)) {
        dateString = dateString.replace(microsecondPattern, '$1');
      }

      date = new Date(dateString);
    } else if(typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return '유효하지 않은 시간 형식';
    }

    // 유효성 검사
    if(isNaN(date.getTime())) {
      console.warn('Invalid date after processing:', timestamp, '-> processed:', dateString || timestamp);
      return '유효하지 않은 시간';
    }

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);

  } catch(error) {
    console.error('formatTime 에러:', error, 'timestamp:', timestamp);
    return '시간 형식 오류';
  }
};

const getButtonText = (type) => {
  if(isLoading.value) {
    return type === 'concert' ? '콘서트 동기화 중...' : '뮤지컬 동기화 중...';
  }

  if(type === 'concert' && concertSyncCompleted.value) {
    return '콘서트 동기화 ✓';
  }

  if(type === 'musical' && musicalSyncCompleted.value) {
    return '뮤지컬 동기화 ✓';
  }

  return type === 'concert' ? '콘서트 동기화' : '뮤지컬 동기화';
};

// 컴포넌트 마운트 시 동기화 상태 조회
onMounted(async () => {
  await getSyncStatus();
});
</script>

<style scoped>
  main {
    box-sizing: border-box;
    background-color: #F2F2F2;
    width: 960px;
    margin: 0 auto;
    padding: 20px 0;
  }

  .kopis-admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .admin-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .admin-header p {
    color: #666;
    margin-bottom: 2rem;
  }

  .sync-controls {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .sync-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .btn-primary, .btn-secondary, .btn-info {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0056b3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #545b62;
  }

  .btn-info {
    background: #17a2b8;
    color: white;
  }

  .btn-info:hover {
    background: #138496;
  }

  .btn-primary:disabled, .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sync-status {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-top: 20px;
    padding: 15px;
    background: white;
    border-radius: 6px;
    border: 1px solid #dee2e6;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-weight: 600;
    color: #333;
  }

  .value {
    color: #666;
  }

  .value.success {
    color: #28a745;
    font-weight: 600;
  }

  .value.error {
    color: #dc3545;
    font-weight: 600;
  }

  .status {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .status.completed {
    background: #d4edda;
    color: #155724;
  }

  .status.running {
    background: #fff3cd;
    color: #856404;
  }

  .status.error {
    background: #f8d7da;
    color: #721c24;
  }

  .message {
    padding: 12px;
    border-radius: 4px;
    margin: 20px 0;
  }

  .message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .sync-log h3 {
    margin-bottom: 1rem;
  }

  .log-container {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
  }

  .log-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
  }

  .log-item:last-child {
    border-bottom: none;
  }

  .log-time {
    color: #999;
    font-size: 0.85rem;
    min-width: 140px;
  }

  .log-type {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    min-width: 60px;
    text-align: center;
  }

  .log-type.success {
    background: #d4edda;
    color: #155724;
  }

  .log-type.error {
    background: #f8d7da;
    color: #721c24;
  }

  .log-type.info {
    background: #d1ecf1;
    color: #0c5460;
  }

  .log-message {
    flex: 1;
    color: #333;
  }

  @media (max-width: 768px) {
    .sync-buttons {
      flex-direction: column;
    }
  
    .sync-status {
      flex-direction: column;
      gap: 10px;
    }
  
    .log-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  
    .log-time {
      min-width: auto;
    }
  }
</style>