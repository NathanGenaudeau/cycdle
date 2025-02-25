<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);

import fr from '../assets/lang/fr.json';
import en from '../assets/lang/en.json';

const props = defineProps({ lang: String});
const langFile = ref(localStorage.getItem('lang') === 'fr' ? fr : en);

watch(() => props.lang, () => {
  langFile.value = props.lang === 'fr' ? fr : en;
  headers = props.lang === 'fr' ? headerFR : headerEN;
});

enum teamLevel {
  WT,
  PRT
}

interface RiderSpecialities {
  general_classification: number;
  climber: number;
  hills: number;
  one_day_races: number;
  sprint: number;
  time_trial: number;
}

interface Rider extends RiderSpecialities {
  id: string;
  name: string;
  photo: string;
  team: string;
  teamLevel: teamLevel;
  age: number;
  nationality: string;
  flag: string;
  weight: number;
  height: number;
  uciRank: number;
  sum_specialities: number;
  win: number;
  gt_participation: number;
  classic_participation: number;
}

const riders = ref<Rider[]>([]);
const randomRider = ref<Rider>();
const guesses = ref<Rider[]>([]);
const selectedValue = ref<Rider | null>(null);
const won = ref<boolean>(false);
const isDialogWinActive = ref<boolean>(false);

const shareButtonText = ref<string>(langFile.value.game_modal_win_button_share);

const headerFR = [
  { title: fr.game_datatable_header_name, key: 'name', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_team, key: 'team', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_age, key: 'age', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_nationality, key: 'nationality', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_weight_height, key: 'measurement', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_uci_rank, key: 'uci_rank', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_win, key: 'win', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_gt_classic, key: 'partGTClassic', sortable: false, align: 'center' },
  { title: fr.game_datatable_header_specialties, key: 'stats', sortable: false, minWidth: '230px', maxWidth: '230px', align: 'center' }
];
const headerEN = [
  { title: en.game_datatable_header_name, key: 'name', sortable: false, align: 'center' },
  { title: en.game_datatable_header_team, key: 'team', sortable: false, align: 'center' },
  { title: en.game_datatable_header_age, key: 'age', sortable: false, align: 'center' },
  { title: en.game_datatable_header_nationality, key: 'nationality', sortable: false, align: 'center' },
  { title: en.game_datatable_header_weight_height, key: 'measurement', sortable: false, align: 'center' },
  { title: en.game_datatable_header_uci_rank, key: 'uci_rank', sortable: false, align: 'center' },
  { title: en.game_datatable_header_win, key: 'win', sortable: false, align: 'center' },
  { title: en.game_datatable_header_gt_classic, key: 'partGTClassic', sortable: false, align: 'center' },
  { title: en.game_datatable_header_specialties, key: 'stats', sortable: false, minWidth: '230px', maxWidth: '230px', align: 'center' }
];

let headers = props.lang === 'en' ? headerEN : headerFR;
 
const mode= ref<string | null>();
 
onMounted(async () => {

  mode.value = localStorage.getItem('mode');
  if (localStorage.getItem('lastPlayed') !== new Date().toLocaleDateString()) {
    localStorage.setItem('lastPlayed', new Date().toLocaleDateString());
    localStorage.setItem('guessesWT', JSON.stringify([]));
    localStorage.setItem('guessesPRT', JSON.stringify([]));
    localStorage.setItem('wonWT', JSON.stringify(false));
    localStorage.setItem('wonPRT', JSON.stringify(false));
  } else {
    won.value = mode.value === 'rider-wt' ? JSON.parse(localStorage.getItem('wonWT') as string) : JSON.parse(localStorage.getItem('wonPRT') as string);
    guesses.value = mode.value === 'rider-wt' ? JSON.parse(localStorage.getItem('guessesWT') as string) : JSON.parse(localStorage.getItem('guessesPRT') as string);
  }
  if (won.value) {
    isDialogWinActive.value = true;

  }
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/riders?mode=${mode.value}`);
  riders.value = await response.json();
  updateRidersList();
  randomRider.value = (await (await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/riders/random?mode=${mode.value}`)).json())[0];
});

const updateRidersList = () => {
  riders.value = riders.value.filter((rider: Rider) => {
    return !guesses.value.find((guess: Rider) => guess.id === rider.id);
  });
}
 
const selectRider = (riderSelected: Rider | null) => {
  if (!randomRider.value || !riderSelected || guesses.value.find((rider: Rider) => rider.id === riderSelected.id)) return;
  if (riderSelected.id === randomRider.value.id) {
    won.value = true;
    isDialogWinActive.value = true;
    if (mode.value === 'rider-wt') localStorage.setItem('wonWT', JSON.stringify(true))
    if (mode.value === 'rider-prt') localStorage.setItem('wonPRT', JSON.stringify(true));
  }
 
  guesses.value.unshift(riderSelected);
  if (mode.value === 'rider-wt') localStorage.setItem('guessesWT', JSON.stringify(guesses.value));
  if (mode.value === 'rider-prt') localStorage.setItem('guessesPRT', JSON.stringify(guesses.value));
  selectedValue.value = null;
  updateRidersList();
};
 
const attributes = ['age', 'team', 'nationality', 'weight', 'height', 'uci_rank', 'win', 'gt_participation', 'classic_participation'];
 
const getAttributeColor = (value: any, type: string) => {
  if (!randomRider.value) return 'red';
  if (value !== randomRider.value[type as keyof Rider]) return 'red';
  return 'green';
};
 
const getAttributeArrow = (value: any, type: string) => {
  if (!randomRider.value) return 'mdi-close';
  if ((value < randomRider.value[type as keyof Rider] && type !== 'uci_rank') || (value > randomRider.value[type as keyof Rider] && type === 'uci_rank')) return 'mdi-chevron-up';
  if ((value > randomRider.value[type as keyof Rider] && type !== 'uci_rank') || (value < randomRider.value[type as keyof Rider] && type === 'uci_rank')) return 'mdi-chevron-down';
  if ((!value || !randomRider.value[type as keyof Rider]) && value !== 0) return 'mdi-close';
  return 'mdi-check';
};
 
const getSpecialityColor = (value: any, type: string) => {
  if (!randomRider.value) return 'red';
  if (value - 5 <= randomRider.value[type as keyof RiderSpecialities] && value + 5 >= randomRider.value[type as keyof RiderSpecialities]) return 'green';
  else if (value - 15 <= randomRider.value[type as keyof RiderSpecialities] && value + 15 >= randomRider.value[type as keyof RiderSpecialities]) return 'orange';
  else return 'red';
};

const compareGraph = (val: number, val2: number) => {
  if (val - 5 <= val2 && val + 5 >= val2) return '';
  else if (val > val2) return '▲';
  else if (val < val2) return '▼';
};

const labelPositionning = (val: number, val2: number) => {
  return val > val2 ? '-5' : '-20';
}
 
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
        if (!randomRider.value) return;
        switch(context.chart.data.labels[context.dataIndex]) {
          case 'ONE':
            return labelPositionning(randomRider.value.one_day_races, context.dataset.data[context.dataIndex]);
          case 'GC':
            return labelPositionning(randomRider.value.general_classification, context.dataset.data[context.dataIndex]);
          case 'TT':
            return labelPositionning(randomRider.value.time_trial, context.dataset.data[context.dataIndex]);
          case 'SPR':
            return labelPositionning(randomRider.value.sprint, context.dataset.data[context.dataIndex]);
          case 'CLI':
            return labelPositionning(randomRider.value.climber, context.dataset.data[context.dataIndex]);
          case 'HIL':
            return labelPositionning(randomRider.value.hills, context.dataset.data[context.dataIndex]);
        }
      },
      formatter: (val: any, context: any) => {
        if (!randomRider.value) return;
        switch(context.chart.data.labels[context.dataIndex]) {
          case 'ONE':
            return compareGraph(randomRider.value.one_day_races, val);
          case 'GC':
            return compareGraph(randomRider.value.general_classification, val);
          case 'TT':
            return compareGraph(randomRider.value.time_trial, val);
          case 'SPR':
            return compareGraph(randomRider.value.sprint, val);
          case 'CLI':
            return compareGraph(randomRider.value.climber, val);
          case 'HIL':
            return compareGraph(randomRider.value.hills, val);
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
 
const formatRiderSpecialities = (rider: Rider) => {
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
 
const saveToClipboard = () => {
  const firstDate = new Date('2024-10-10');
  const nb = Math.floor((new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  let textToShare = `Cycdle (@Cycdle) ${mode.value === 'rider-wt' ? 'WT' : 'PRT'}#${nb} - ${guesses.value.length} ${langFile.value.game_modal_win_text_share_try}\n`;

  //add the guess count to local storage
  const stats:Number[] = JSON.parse(localStorage.getItem('stats') as string) || [];
  console.log(stats);
  stats.push(guesses.value.length);
  localStorage.setItem('stats', JSON.stringify(stats));
  
  for (const guess of guesses.value.slice().reverse()) {
    for (const key of Object.keys(guess)) {
      if (attributes.includes(key)) {
        textToShare += getAttributeColor(guess[key as keyof Rider], key) === 'green' ? '🟩' : '🟥';
      }
    }
    textToShare += '\n';
  }
  textToShare += '\nhttps://cycdle.fun';
  navigator.clipboard.writeText(textToShare).then(
    function () {
      shareButtonText.value = langFile.value.game_modal_win_button_copy;
      setTimeout(() => {
        shareButtonText.value = langFile.value.game_modal_win_button_share;
      }, 2000);
    },
  );
}

const customFilter = (_itemTitle: any, query: string, item: any) => {
  const name = item.raw.name.toLowerCase();
  return name.indexOf(query.toLowerCase()) > -1;
}
</script>
 
<template>
  <div class="game d-block flex-column align-center justify-center">
    <v-autocomplete :label="langFile.game_autocomplete_label" :items="riders" :custom-filter="customFilter"
      v-model="selectedValue" @update:model-value="selectRider(selectedValue)" :placeholder="langFile.game_autocomplete_placeholder"
      variant="outlined" :disabled="won" color="#0a74da" base-color="#0a74da" hide-no-data>
      <template v-slot:chip="{ item }">
        {{ item.raw.name }}
      </template>
      <template v-slot:item="{ props, item }" >
        <v-list-item
          v-bind="props"
          :title="item.raw.name"
        >
          <template v-slot:prepend>
            <v-avatar rounded="0" size="60">
              <v-img class="mb-n6" :src="item.raw.photo" max-width="40px" id="avatar-img-autocomplete" />
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-icon :icon="`fi fi-${item.raw.flag}`"/>
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>
 
    <v-data-table :items="guesses" :headers="headers" hide-no-data items-per-page="-1">
      <template v-slot:header.stats="{ column }">
        {{ column.title }}
        <v-tooltip open-on-click>
          <template v-slot:activator="{ props }">
            <v-icon icon="mdi-information" class="mt-n1" v-bind="props"></v-icon>
          </template>
          <p>{{ langFile.game_datatable_tooltip_specialties_text }}</p>
          <p>ONE: {{ langFile.game_datatable_tooltip_specialties_one }}</p>
          <p>GC: {{ langFile.game_datatable_tooltip_specialties_gc }}</p>
          <p>TT: {{ langFile.game_datatable_tooltip_specialties_tt }}</p>
          <p>SPR: {{ langFile.game_datatable_tooltip_specialties_spr }}</p>
          <p>CLI: {{ langFile.game_datatable_tooltip_specialties_cli }}</p>
          <p>HIL: {{ langFile.game_datatable_tooltip_specialties_hil }}</p>
        </v-tooltip>
      </template>
      <template v-slot:item.name="{ item }">
        <v-avatar rounded="0" size="120">
          <v-img :src="item.photo" max-width="80px" id="avatar-img-datatable" />
        </v-avatar>
        <div class="mt-n8">{{ item.name.split(' ').splice(0, 2).join(' ') }} <br /> {{ item.name.split(' ').splice(2).join(' ') }}</div>
      </template>
      <template v-slot:item.team="{ value }">
        <v-chip :color="getAttributeColor(value, 'team')">
          {{ value.split(' ').splice(0, 2).join(' ') }} <br /> {{ value.split(' ').splice(2).join(' ') }}
        </v-chip>
      </template>
      <template v-slot:item.age="{ value }">
        <v-chip :color="getAttributeColor(value, 'age')">
          {{ value }} <v-icon :icon="getAttributeArrow(value, 'age')" />
        </v-chip>
      </template>
      <template v-slot:item.nationality="{ item }">
        <v-chip :color="getAttributeColor(item.nationality, 'nationality')" :prepend-icon="`fi fi-${item.flag}`">
          {{ item.nationality }}
        </v-chip>
      </template>
      <template v-slot:item.measurement="{ item }">
        <v-chip :color="getAttributeColor(item.weight, 'weight')">
          {{ item.weight || '-- ' }}kg <v-icon :icon="getAttributeArrow(item.weight, 'weight')" />
        </v-chip>
        <v-divider inset thickness="5" color="transparent" />
        <v-chip :color="getAttributeColor(item.height, 'height')">
          {{ item.height || '-- ' }}m <v-icon :icon="getAttributeArrow(item.height, 'height')" />
        </v-chip>
      </template>
      <template v-slot:item.uci_rank="{ value }">
        <v-chip :color="getAttributeColor(value, 'uci_rank')">
          {{ value === 1 ? `${value}er` : `${value}ème` }} <v-icon :icon="getAttributeArrow(value, 'uci_rank')" />
        </v-chip>
      </template>
      <template v-slot:item.win="{ value }">
        <v-chip :color="getAttributeColor(value, 'win')">
          {{ value }} <v-icon :icon="getAttributeArrow(value, 'win')" />
        </v-chip>
      </template>
      <template v-slot:item.partGTClassic="{ item }">
        <v-chip :color="getAttributeColor(item.gt_participation, 'gt_participation')">
          {{ item.gt_participation }} <v-icon :icon="getAttributeArrow(item.gt_participation, 'gt_participation')" />
        </v-chip>
        <v-divider inset thickness="5" color="transparent" />
        <v-chip :color="getAttributeColor(item.classic_participation, 'classic_participation')">
          {{ item.classic_participation }} <v-icon
            :icon="getAttributeArrow(item.classic_participation, 'classic_participation')" />
        </v-chip>
      </template>
      <template v-slot:item.stats="{ item }">
        <BarChart :chartData="formatRiderSpecialities(item)" :options="options" :height="300" />
      </template>
      <template v-slot:bottom>
      </template>
    </v-data-table>
 
    <v-dialog max-width="500" v-model="isDialogWinActive" persistent>
      <template v-slot:default="{ isActive }">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="text-h5 text-medium-emphasis ps-2">{{ langFile.game_modal_win_title }}</div>
            <v-btn icon="mdi-close" variant="text" @click="isActive.value = false" />
          </v-card-title>
          <v-card-text>
            <div>{{ langFile.game_modal_win_text }}</div>
            <div class="pixels">
              <div v-for="guess in guesses.slice().reverse()" :key="guess.id">
                <span v-for="key of Object.keys(guess)" :key="key">
                  <v-icon v-if="attributes.includes(key)" icon="mdi mdi-square" :color="getAttributeColor(guess[key as keyof Rider], key)" />
                </span>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="saveToClipboard" prepend-icon="mdi-share-variant">
              {{ shareButtonText }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>