<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch, onMounted } from 'vue';

import ChartContainer from './components/ChartContainer.vue';
import type { Stat } from './types/Stat';

import logo from './assets/logo/cycdle-white.png';
import fr from './assets/lang/fr.json';
import en from './assets/lang/en.json';
 
const router = useRouter();
 
const isStatDialogActive = ref<boolean>(false);
const isHelpDialogActive = ref<boolean>(false);
const isCreditDialogActive = ref<boolean>(false);

const lang = ref<string>(localStorage.getItem('lang') || 'fr');
const langFile = ref<typeof fr | typeof en>(localStorage.getItem('lang') === 'en' ? en : fr);

const showStats = (val: boolean) => {
  isStatDialogActive.value = val;
}

onMounted(async () => {
  if (!localStorage.getItem('lang')) localStorage.setItem('lang', 'fr');
});

watch(lang, () => {
  localStorage.setItem('lang', lang.value);
  langFile.value = lang.value === 'en' ? en : fr;
});

const statsWT = ref<Stat[]>([]);
const statsPRT = ref<Stat[]>([]);
const statsTDF = ref<Stat[]>([]);
const statsTotal = ref<Stat[]>([]);
const stats = ref<Stat>({ nbGuess: 0, green: 0, orange: 0, red: 0 });

watch(isStatDialogActive, () => {
  statsWT.value = JSON.parse(localStorage.getItem('statsWT') || '[]');
  statsPRT.value = JSON.parse(localStorage.getItem('statsPRT') || '[]');
  statsTDF.value = JSON.parse(localStorage.getItem('statsTDF') || '[]');
  statsTotal.value = [...statsWT.value, ...statsPRT.value, ...statsTDF.value];

  const keys = ['nbGuess', 'green', 'orange', 'red'] as const;
  const totalCount = statsTotal.value.length || 1;
  stats.value = keys.reduce((acc, key) => {
    const sum = statsTotal.value.reduce((total, stat) => total + stat[key], 0);
    acc[key] = sum / totalCount;
    return acc;
  }, {} as Stat);
});


</script>
 
<template>
  <v-layout class="app rounded rounded-md">
    <v-app-bar>
      <v-app-bar-title>
        <v-img :src="logo" class="logo" @click="router.push('/')" alt="Cycdle Logo" />
      </v-app-bar-title>
      <v-btn icon="mdi-chart-box-outline" @click="isStatDialogActive = true" data-test="stats-btn"></v-btn>
      <v-btn icon="mdi-help" @click="isHelpDialogActive = true" data-test="help-btn"></v-btn>
      <v-btn icon="mdi-link-variant" @click="isCreditDialogActive = true" data-test="credits-btn"></v-btn>
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
            <ChartContainer :stats="statsWT" chartType="world-tour" :langFile="langFile" />
            <ChartContainer :stats="statsPRT" chartType="pro-tour" :langFile="langFile" />
            <ChartContainer :stats="statsTDF" chartType="tour-de-france" :langFile="langFile" />
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
</v-layout>
</template>