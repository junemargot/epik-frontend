<template>
  <div class="event__header">
    <h1>{{ title }}</h1>
    <!-- <div class="event__icons">
      <div class="event__icon">
        <a href="#" @click.prevent="$emit('notification-click')">
          <i class="bx bx-bell"></i>
        </a>
        <span>알림받기</span>
      </div>
      <div class="event__icon">
        <a href="#" @click.prevent="$emit('bookmark-click')">
          <i class="bx bx-bookmark"></i>
        </a>
        <span>북마크</span>
      </div>
    </div> -->
    <div class="actions">
      <button @click="$emit('notification-click')" class="btn-icon">
        <i class="bx bx-bell"></i>
      </button>
      <button 
        @click="$emit('toggle-bookmark')" 
        class="btn-icon"
        :class="{ 'bookmarked': props.isBookmarked }"
        :title="props.isBookmarked ? '북마크 제거' : '북마크 추가'"
      >
        <i :class="props.isBookmarked ? 'bx bxs-bookmark' : 'bx bx-bookmark'"></i>
        <span v-if="props.isBookmarked" class="bookmark-label">저장됨</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  isBookmarked?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isBookmarked: false
});

const emit = defineEmits(['notification-click', 'toggle-bookmark']);

</script>

<style>
@import url('/public/css/components/event.css');
.actions {
  display: flex;
  gap: 14px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #333;
  transition: color .3s;
  position: relative;
  padding: 8px;
  border-radius: 8px;
}

.btn-icon:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.btn-icon.bookmarked {
  color: #ff6b6b;
}

.btn-icon i {
  display: block;
  transition: all 0.3s ease;
}

.bookmark-label {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #ff6b6b;
  font-weight: 600;
  white-space: nowrap;
  padding: 2px 6px;
}
</style>

