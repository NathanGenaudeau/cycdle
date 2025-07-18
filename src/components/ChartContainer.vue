<script setup lang="ts">

import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

import type { Stat } from '../types/Stat';

const props = defineProps({
  stats: {
    type: Array as () => Stat[],
    required: true,
  },
  chartType: {
    type: String,
    required: true,
  },
  langFile: {
    type: Object as () => any,
    required: true,
  },
});

const formatStats = (stats: Stat[]) => {
  stats = stats.reduce((acc: any, { nbGuess }) => {
    if (nbGuess >= 1 && nbGuess <= 5) {
      acc[nbGuess] = (acc[nbGuess] || 0) + 1;
    } else if (nbGuess >= 6 && nbGuess <= 10) {
      acc['6-10'] = (acc['6-10'] || 0) + 1;
    } else {
      acc['10+'] = (acc['10+'] || 0) + 1;
    }
    return acc;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6-10': 0, '10+': 0 });

  const labels = Object.keys(stats);
  const data = Object.values(stats);

  return {
    labels,
    datasets: [
      {
        data: data.map((i: any) => i + 1),
        backgroundColor: 'rgb(10, 116, 218, 0.5)',
        borderColor: 'rgba(10, 116, 218, 1)',
        borderRadius: 4,
        borderWidth: 2,
      },
    ],
  };
};

const options = (chartType: string) => ({
  barPercentage: 1.1, 
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    title: {
      display: true,
      text: chartType === 'world-tour' ? props.langFile.app_modal_stats_title_chart_1 : chartType === 'pro-tour' ? props.langFile.app_modal_stats_title_chart_2 : props.langFile.app_modal_stats_title_chart_3,
      position: 'bottom',
      color: 'white',
    },
    datalabels: {
      color: 'white',
      anchor: 'end',
      align: (context: any) => Math.max(...context.chart.data.datasets[0].data) / context.dataset.data[context.dataIndex] < 10 ? 'start' : 'end',
      formatter: (value: any) => { return value - 1 === 0 ? '' : value - 1 },
      font: {
        size: 11,
        weight: 'bold',
      },
    },
    tooltip: {
      enabled: false,
    },
    legend: {
      display: false,
    },
  },
  scales:{
    x: {
      beginAtZero: true,
      suggestedMax: (context: any) => Math.max(...context.chart.data.datasets[0].data) + 1,
      display: false,
    },
    y: {
      ticks: {
        color: 'white',
        font: {
          size: 14,          
        },
      },
      grid: {
        display: false,
      },
    },
  },
});

</script>

<template>
  <BarChart class="chart" :chart-data="formatStats(props.stats)" :options="options(props.chartType)" />
</template>