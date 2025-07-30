<script setup lang="ts">
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

import type { RiderSpecialities } from '../types/RiderSpecialities';

const props = defineProps({
  rider: {
    type: Object as () => RiderSpecialities,
    required: true,
  },
  randomRider: {
    type: Object as () => RiderSpecialities,
    required: true,
  },
  height: {
    type: Number,
    default: 300,
  },
});

const options = {
  layout: {
    padding: {
      top: 25
    }
  },
  responsive: true,
  plugins: {
    datalabels: {
      color: 'white',
      anchor: 'end',
      align: 'end',
      offset: (context: any) => {
        if (!props.randomRider) return;
        switch(context.chart.data.labels[context.dataIndex]) {
          case 'ONE':
            return labelPositionning(props.randomRider.one_day_races, context.dataset.data[context.dataIndex]);
          case 'GC':
            return labelPositionning(props.randomRider.general_classification, context.dataset.data[context.dataIndex]);
          case 'TT':
            return labelPositionning(props.randomRider.time_trial, context.dataset.data[context.dataIndex]);
          case 'SPR':
            return labelPositionning(props.randomRider.sprint, context.dataset.data[context.dataIndex]);
          case 'CLI':
            return labelPositionning(props.randomRider.climber, context.dataset.data[context.dataIndex]);
          case 'HIL':
            return labelPositionning(props.randomRider.hills, context.dataset.data[context.dataIndex]);
        }
      },
      formatter: (val: any, context: any) => {
        if (!props.randomRider) return;
        switch(context.chart.data.labels[context.dataIndex]) {
          case 'ONE':
            return compareGraph(props.randomRider.one_day_races, val);
          case 'GC':
            return compareGraph(props.randomRider.general_classification, val);
          case 'TT':
            return compareGraph(props.randomRider.time_trial, val);
          case 'SPR':
            return compareGraph(props.randomRider.sprint, val);
          case 'CLI':
            return compareGraph(props.randomRider.climber, val);
          case 'HIL':
            return compareGraph(props.randomRider.hills, val);
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return context.dataset.data[context.dataIndex] + '%';
        },
      }
    },
    legend: {
      display: false
    }
  },
 
  scales: {
    y: {
      ticks: {
        callback: function (value: number) {
          return value + '%';
        },
      }
    }
  }
};

const labelPositionning = (val: number, val2: number) => {
  return val > val2 ? '-5' : '-20';
}

const compareGraph = (val: number, val2: number) => {
  if (val - 5 <= val2 && val + 5 >= val2) return '';
  else if (val > val2) return '▲';
  else if (val < val2) return '▼';
};

const formatRiderSpecialities = (rider: RiderSpecialities) => {
  return {
    labels: ['ONE', 'GC', 'TT', 'SPR', 'CLI', 'HIL'],
    datasets: [{
      data: [rider.one_day_races, rider.general_classification, rider.time_trial, rider.sprint, rider.climber, rider.hills],
      backgroundColor: [
        getSpecialityColor(rider.one_day_races, 'one_day_races'),
        getSpecialityColor(rider.general_classification, 'general_classification'),
        getSpecialityColor(rider.time_trial, 'time_trial'),
        getSpecialityColor(rider.sprint, 'sprint'),
        getSpecialityColor(rider.climber, 'climber'),
        getSpecialityColor(rider.hills, 'hills')
      ]
    }]
  };
}

const getSpecialityColor = (value: number, type: string) => {
  if (!props.randomRider) return 'red';
  if (value - 5 <= props.randomRider[type as keyof RiderSpecialities] && value + 5 >= props.randomRider[type as keyof RiderSpecialities]) return 'green';
  else if (value - 15 <= props.randomRider[type as keyof RiderSpecialities] && value + 15 >= props.randomRider[type as keyof RiderSpecialities]) return 'orange';
  else return 'red';
};
</script>

<template>
  <BarChart :chartData="formatRiderSpecialities(rider)" :options="options" :height="height" />
</template>