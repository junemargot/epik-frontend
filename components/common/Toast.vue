<template>
  <transition name="toast-fade">
    <div v-if="isVisible" :class="['toast-container', `toast--${type}`]">
      <p class="toast-message">{{ message }}</p>
      <button @click="hideToast" class="toast-close-btn">&times;</button>
    </div>
  </transition>
</template>

<script setup>
import { useToast } from '~/composables/useToast';

const { isVisible, message, type, hideToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
  max-width: 500px;
  color: #fff;
}

.toast--info {
  background-color: #3498db;
}

.toast--success {
  background-color: #2ecc71;
}

.toast--error {
  background-color: #e74c3c;
}

.toast-message {
  margin: 0;
  margin-right: 15px;
  font-size: 1rem;
}

.toast-close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.8;
}

.toast-close-btn:hover {
  opacity: 1;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
