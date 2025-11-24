import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.$pinia.use(piniaPluginPersistedstate);
  }
});