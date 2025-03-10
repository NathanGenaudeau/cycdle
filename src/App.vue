<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch, onMounted } from 'vue';
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);
 
import logo from './assets/logo/cycdle-white.png';
import fr from './assets/lang/fr.json';
import en from './assets/lang/en.json';
 
const router = useRouter();
 
const isStatDialogActive = ref<boolean>(false);
const isHelpDialogActive = ref<boolean>(false);
const isCreditDialogActive = ref<boolean>(false);

const lang = ref<string>(localStorage.getItem('lang') || 'fr');
const langFile = ref<typeof fr | typeof en>(localStorage.getItem('lang') === 'fr' ? fr : en);

const showStats = (val: boolean) => {
  isStatDialogActive.value = val;
}

onMounted(async () => {
  if (!localStorage.getItem('lang')) localStorage.setItem('lang', 'fr');
});

watch(lang, () => {
  localStorage.setItem('lang', lang.value);
  langFile.value = lang.value === 'fr' ? fr : en;
});

interface Stat {
  nbGuess: number;
  green: number;
  orange: number;
  red: number;
}

const statsWT = ref<Stat[]>([]);
const statsPRT = ref<Stat[]>([]);
const statsTotal = ref<Stat[]>([]);
const stats = ref<Stat>({ nbGuess: 0, green: 0, orange: 0, red: 0 });

watch(isStatDialogActive, () => {
  statsWT.value = JSON.parse(localStorage.getItem('statsWT') || '[]');
  statsPRT.value = JSON.parse(localStorage.getItem('statsPRT') || '[]');
  statsTotal.value = [...statsWT.value, ...statsPRT.value];

  const keys = ['nbGuess', 'green', 'orange', 'red'] as const;
  const totalCount = statsTotal.value.length || 1;
  stats.value = keys.reduce((acc, key) => {
    const sum = statsTotal.value.reduce((total, stat) => total + stat[key], 0);
    acc[key] = sum / totalCount;
    return acc;
  }, {} as Stat);
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
      text: chartType === 'world-tour' ? langFile.value.app_modal_stats_title_chart_1 : langFile.value.app_modal_stats_title_chart_2,
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
  <v-layout class="app rounded rounded-md">
    <v-app-bar>
      <v-app-bar-title>
        <v-img :src="logo" class="logo" @click="router.push('/')" />
      </v-app-bar-title>
      <v-btn icon="mdi-chart-box-outline" @click="isStatDialogActive = true"></v-btn>
      <v-btn icon="mdi-help" @click="isHelpDialogActive = true"></v-btn>
      <v-btn icon="mdi-link-variant" @click="isCreditDialogActive = true"></v-btn>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-translate" v-bind="props"></v-btn>
        </template>
        <v-list id="lang">
          <v-list-item @click="lang = 'fr'" class="lang-item">
            <v-avatar>
              <span class="fi fi-fr flag-icon"></span>
            </v-avatar>
          </v-list-item>
          <v-list-item @click="lang = 'en'" class="lang-item">
            <v-avatar>
              <span class="fi fi-gb flag-icon"></span>
            </v-avatar>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
 
    <v-main class="d-flex align-center justify-center">
      <RouterView :lang @goToStats="showStats" />
    </v-main>
  </v-layout>
  <v-dialog max-width="500" v-model="isStatDialogActive">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pb-0">
          <div class="text-h5 ps-2">{{ langFile.app_modal_stats_title }}</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <v-col cols="12" class="pt-0">
            <v-row dense class="justify-space-between">
              <v-col cols="6" md="3">
                <v-card class="pa-2 text-center" color="rgba(10, 116, 218, 0.8)">
                  <v-card-title class="text-h5 font-weight-bold px-0">{{ statsTotal.length }}</v-card-title>
                  <v-card-text class="text-caption pa-0">{{ langFile.app_modal_stats_stat_1 }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card class="pa-2 text-center" color="rgba(10, 116, 218, 0.8)">
                  <v-card-title class="text-h5 font-weight-bold px-0">{{ stats.nbGuess.toFixed(1) }}</v-card-title>
                  <v-card-text class="text-caption pa-0">{{ langFile.app_modal_stats_stat_2 }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card class="pa-2 text-center" color="rgba(10, 116, 218, 0.8)">
                  <v-card-title class="text-h5 font-weight-bold px-0">{{ Math.round(stats.green) }}%</v-card-title>
                  <v-card-text class="text-caption pa-0">{{ langFile.app_modal_stats_stat_3 }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card class="pa-2 text-center" color="rgba(10, 116, 218, 0.8)">
                  <v-card-title class="text-h5 font-weight-bold px-0">{{ Math.round(stats.orange) }}%</v-card-title>
                  <v-card-text class="text-caption pa-0">{{ langFile.app_modal_stats_stat_4 }}</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
          <h3 class="py-2">{{ langFile.app_modal_stats_text_chart }}</h3>
          <div id="chart-container">
            <BarChart class="chart" :chartData="formatStats(statsWT)" :options="options('world-tour')" />
            <BarChart class="chart" :chartData="formatStats(statsPRT)" :options="options('pro-tour')" />
          </div>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
  <v-dialog max-width="500" v-model="isHelpDialogActive">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 ps-2">{{ langFile.app_modal_how_to_play_title }}</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <p class="text-justify">
            {{ langFile.app_modal_how_to_play_text_1 }}
            <v-row class="mt-0">
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <v-chip color="red" class="px-3">
                    61kg <v-icon icon="mdi-chevron-up" />
                  </v-chip>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <v-chip color="orange" class="px-3">
                    70 kg <v-icon icon="mdi-chevron-down" />
                  </v-chip>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <v-chip color="green" class="px-3">
                    68kg <v-icon icon="mdi-check" />
                  </v-chip>
                </v-sheet>
              </v-col>
            </v-row>
            <v-row class="mt-n4">
              <v-col class="d-flex justify-center align-center text-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_1_1 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center text-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_1_2 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center text-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_1_3 }}</v-sheet>
              </v-col>
            </v-row>
          </p>
          <p class="text-justify">
            <span v-html="langFile.app_modal_how_to_play_text_2" ></span>
            <v-row class="mt-0">
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <img alt="Chart explaining red chart signification" src="./assets/help/help_graph_red.png"/>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <img alt="Chart explaining orange chart signification" src="./assets/help/help_graph_orange.png"/>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <img alt="Chart explaining green chart signification" src="./assets/help/help_graph_green.png"/>
                </v-sheet>
              </v-col>
            </v-row>
            <v-row class="mt-n4">
              <v-col class="d-flex justify-center align-center text-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_2_1 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center text-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_2_2 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center text-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_2_3 }}</v-sheet>
              </v-col>
            </v-row>
          </p>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
  <v-dialog max-width="500" v-model="isCreditDialogActive">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 ps-2">{{ langFile.app_modal_credits_title }}</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <div v-html="langFile.app_modal_credits_text_1" ></div>
          <div v-html="langFile.app_modal_credits_text_2" ></div>
          <div v-html="langFile.app_modal_credits_text_3" ></div>
          <div v-html="langFile.app_modal_credits_text_4" ></div>
          <div v-html="langFile.app_modal_credits_text_5" ></div>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>