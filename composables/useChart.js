import { ref, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';

export const useChart = () => {
  const chartRef = ref(null);
  let chartInstance = null;

  const createChart = async (config) => {
    await nextTick();
    if(!chartRef.value) return;
    if(chartInstance) chartInstance.destroy();
    chartInstance = new Chart(chartRef.value, config);
  };

  const createDoughnut = (labels, data, colors) => {
    if (!data.some(v => v > 0)) return;

    createChart({
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } }
      }
    });
  };

  const createHorizontalBar = (labels, data) => {
    if (!data.length) return;

    createChart({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: 'rgba(12, 95, 205, 0.8)',
          borderRadius: 10
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { display: false } },
          y: { grid: { display: false } }
        }
      }
    });
  };

  onBeforeUnmount(() => {
    if (chartInstance) chartInstance.destroy();
  });

  return { chartRef, createDoughnut, createHorizontalBar };
}