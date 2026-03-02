<template>
  <div class="card">
    <div class="card__head">
      <div>
        <h2>{{ count }}<span>건</span></h2>
        <p>{{ label }}</p>
        <p>{{ today }}</p>
      </div>
      <i :class="`bx ${icon} icon`"></i>
    </div>

    <div v-if="hasData" class="chart-container">
      <div class="chart-legend">
        <div v-for="(item, i) in legendItems" :key="i" class="legend-item">
          <span class="legend-dot" :style="{ background: item.color }"></span>
          <div class="legend-text">
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-count">{{ item.count }}건</span>
          </div>
        </div>
      </div>
      <div class="chart-wrapper">
        <canvas :ref="el => chartRef = el"></canvas>
      </div>
    </div>

    <div v-else class="no-data-message">
      <i class="bx bx-info-circle"></i>
      <p>{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useChart } from '~/composables/useChart';
import { CHART_COLORS, CHART_LABELS } from '~/utils/chartConfig';
import { getToday } from '~/utils/dateFormat';

const props = defineProps({
  count: { type: Number, default: 0 },
  label: { type: String, required: true },
  icon: { type: String, required: true },
  breakdown: { type: Object, default: () => ({}) },  // { popups, concerts, musicals, exhibitions }
  emptyMessage: { type: String, default: '데이터가 없습니다' }
});

const today = getToday();
const { chartRef, createDoughnut } = useChart();

const chartData = computed(() => [
  props.breakdown.popups || 0,
  props.breakdown.concerts || 0,
  props.breakdown.musicals || 0,
  props.breakdown.exhibitions || 0
]);

const hasData = computed(() => chartData.value.some(v => v > 0));

const legendItems = computed(() =>
  CHART_LABELS.map((label, i) => ({
    label,
    color: CHART_COLORS[i],
    count: chartData.value[i]
  }))
);

const renderChart = () => {
  if (hasData.value) {
    createDoughnut(CHART_LABELS, chartData.value, CHART_COLORS);
  }
};

onMounted(renderChart);
watch(() => props.breakdown, renderChart, { deep: true });
</script>