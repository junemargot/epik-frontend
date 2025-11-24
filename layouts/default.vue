<template>
    <Header />
    <slot />
    <Footer />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
    authStore.checkAuth();
});

</script>