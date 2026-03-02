<template>
  <div class="chart-card">
    <div class="chart-header" @click="isOpen = !isOpen">
      <h3>{{ title }}</h3>
      <i class="bx bx-chevron-down icon" :class="{ rotate: isOpen }"></i>
    </div>
    <div class="chart-content-wrapper">
      <div class="chart-content" :class="{ collapsed: !isOpen }">
        <div v-if="hasData">
          <div class="chart-canvas-wrapper">
            <canvas ref="canvasEl"></canvas>
          </div>
        </div>
        <div v-else class="no-data">데이터가 없습니다</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useChart } from '~/composables/useChart';

const props = defineProps({
  title: { type: String, required: true },
  data: { type: Array, default: () => [] },
  labelKey: { type: String, required: true },
  valueKey: { type: String, required: true }
});

const isOpen = ref(true);
const { chartRef, createHorizontalBar } = useChart();
const canvasEl = ref(null);

// useChart의 chartRef를 canvasEl과 동기화
watch(canvasEl, (el) => {
  chartRef.value = el;
}, { immediate: true });

const hasData = computed(() => props.data && props.data.length > 0);

const renderChart = async () => {
  await nextTick();
  if (!hasData.value) return;
  // canvasEl → chartRef 동기화 후 생성
  chartRef.value = canvasEl.value;
  const labels = props.data.map(item => item[props.labelKey]);
  const values = props.data.map(item => item[props.valueKey]);
  createHorizontalBar(labels, values);
};

onMounted(renderChart);

watch(() => props.data, renderChart, { deep: true });
watch(isOpen, async (open) => {
  if (open) {
    await nextTick();
    renderChart();
  }
});
</script>
