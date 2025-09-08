<!-- components/admin/concert/ConcertListItem.vue (예시) -->
<template>
  <div class="list-item">
    <div class="item-content">
      <h4>{{ concert.title }}</h4>
      <p>{{ concert.venue }} | {{ formatDate(concert.startDate) }} ~ {{ formatDate(concert.endDate) }}</p>
      
      <!-- 데이터 소스 표시 추가 -->
      <div class="data-source">
        <span 
          class="source-badge" 
          :class="concert.dataSource?.toLowerCase()"
        >
          {{ getDataSourceText(concert.dataSource) }}
        </span>
        <span v-if="concert.lastSynced" class="sync-time">
          동기화: {{ formatDateTime(concert.lastSynced) }}
        </span>
      </div>
    </div>
    
    <div class="item-actions">
      <button @click="editConcert(concert.id)" class="btn-edit">수정</button>
      <button @click="deleteConcert(concert.id)" class="btn-delete">삭제</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  concert: {
    type: Object,
    required: true
  }
})

const getDataSourceText = (dataSource) => {
  const sourceMap = {
    'MANUAL': '수기등록',
    'KOPIS_API': 'KOPIS'
  }
  return sourceMap[dataSource] || '알 수 없음'
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('ko-KR').format(new Date(date))
}

const formatDateTime = (dateTime) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateTime))
}
</script>

<style scoped>
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.data-source {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.source-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.source-badge.manual {
  background: #e9ecef;
  color: #495057;
}

.source-badge.kopis_api {
  background: #d4edda;
  color: #155724;
}

.sync-time {
  font-size: 0.75rem;
  color: #6c757d;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-edit {
  background: #007bff;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}
</style>