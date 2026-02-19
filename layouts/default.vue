<template>
    <Header />
    <slot />
    <Toast />
    <Footer />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import Toast from '~/components/common/Toast.vue';

const authStore = useAuthStore();

onMounted(() => {
    authStore.checkAuth();
});

</script>