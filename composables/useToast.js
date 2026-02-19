import { ref, readonly } from 'vue';

const isVisible = ref(false);
const message = ref('');
const type = ref('info'); // 'info', 'success', 'error'

let timeoutId = null;

export function useToast() {
  const showToast = (msg, toastType = 'info', duration = 3000) => {
    message.value = msg;
    type.value = toastType;
    isVisible.value = true;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    isVisible.value = false;
    message.value = '';
  };

  return {
    isVisible: readonly(isVisible),
    message: readonly(message),
    type: readonly(type),
    showToast,
    hideToast,
  };
}
