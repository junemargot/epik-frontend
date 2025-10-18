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
          @click="$emit('bookmark-click')" 
          class="btn-icon"
          :class="{ 'bookmarked': isBookmarked }"
        >
          <i :class="isBookmarked ? 'bx bxs-bookmark' : 'bx bx-bookmark'"></i>
        </button>
      </div>
    </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    title: string,
    isBookmarked: {
      type: Boolean,
      default: false
    }
  }>()

defineEmits(['notification-click', 'bookmark-click']);
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
}

.btn-icon:hover {
  color: #ff6b6b;
}

.btn-icon.bookmarked {
  color: #ff6b6b;
}

.btn-icon i {
  display: block;
}
</style>

