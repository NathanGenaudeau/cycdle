<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, } from 'vue';
import { useDisplay } from 'vuetify'
import ChartSpecialities from './ChartSpecialities.vue';

import type { Rider } from '../types/Rider';

import neighbours from '../api/data/neighbours.json';
const neighboursTyped = neighbours as Record<string, { neighbours: string[] }>;

const emit = defineEmits(['goToStats']);
const goToStats = (val: boolean) => {
  emit('goToStats', val);
}

const { mobile } = useDisplay();
const riders = ref<Rider[]>([]);
const randomRider = ref<Rider>();
const guesses = ref<Rider[]>([]);
const selectedValue = ref<Rider | null>(null);
const won = ref<boolean>(false);
const isDialogWinActive = ref<boolean>(false);

import fr from '../assets/lang/fr.json';
import en from '../assets/lang/en.json';

const props = defineProps({ lang: String });
const langFile = ref(localStorage.getItem('lang') === 'en' ? en : fr);

const baseHeaders = [
  { key: 'name' },
  { key: 'team' },
  { key: 'age' },
  { key: 'nationality' },
  { key: 'weight_height' },
  { key: 'uci_rank' },
  { key: 'win' },
  { key: 'gt_classic' },
  { key: 'specialties', minWidth: '230px', maxWidth: '230px' },
];

const generateHeaders = (langObj: typeof en | typeof fr) =>
  baseHeaders.map(h => ({
    title: langObj[`game_datatable_header_${h.key}` as keyof typeof langObj] as string,
    key: h.key,
    align: 'center' as const,
    ...('minWidth' in h ? { minWidth: h.minWidth } : {}),
    ...('maxWidth' in h ? { maxWidth: h.maxWidth } : {})
  }));

const headers = ref(generateHeaders(langFile.value));

watch(() => props.lang, () => {
  langFile.value = props.lang === 'en' ? en : fr;
  headers.value = generateHeaders(langFile.value);
});

const shareButtonText = ref<string>(langFile.value.game_modal_win_button_share);
const mode= ref<string>(localStorage.getItem('mode') || 'rider-wt');

const attributes = ['age', 'team', 'nationality', 'weight', 'height', 'uci_rank', 'win', 'gt_participation', 'classic_participation'];
 
onMounted(async () => {
  if (localStorage.getItem('lastPlayed') !== new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Paris' })) {
    localStorage.setItem('lastPlayed', new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Paris' }));
    localStorage.setItem('guessesWT', JSON.stringify([]));
    localStorage.setItem('guessesPRT', JSON.stringify([]));
    localStorage.setItem('guessesTDF', JSON.stringify([]));
    localStorage.setItem('wonWT', JSON.stringify(false));
    localStorage.setItem('wonPRT', JSON.stringify(false));
    localStorage.setItem('wonTDF', JSON.stringify(false));
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

  guesses.value.unshift(riderSelected);
  if (mode.value === 'rider-wt') localStorage.setItem('guessesWT', JSON.stringify(guesses.value));
  if (mode.value === 'rider-prt') localStorage.setItem('guessesPRT', JSON.stringify(guesses.value));
  selectedValue.value = null;
  updateRidersList();

  if (riderSelected.id === randomRider.value.id) {
    won.value = true;
    isDialogWinActive.value = true;
    if (mode.value === 'rider-wt') localStorage.setItem('wonWT', JSON.stringify(true))
    if (mode.value === 'rider-prt') localStorage.setItem('wonPRT', JSON.stringify(true));

    const statsName = mode.value === 'rider-wt' ? 'statsWT' : 'statsPRT';
    const stats:any[] = JSON.parse(localStorage.getItem(statsName) as string) || [];

    const totalAttributes = guesses.value.length * attributes.length;
    const colorCounts = guesses.value.flatMap(guess =>
      attributes.map(attr => getAttributeColor(guess[attr as keyof Rider], attr))
    ).reduce((counts, color) => {
      counts[color]++;
      return counts;
    }, { green: 0, orange: 0, red: 0 });

    stats.push({
      nbGuess: guesses.value.length,
      green: parseFloat((colorCounts.green / totalAttributes * 100).toFixed(1)),
      orange: parseFloat((colorCounts.orange / totalAttributes * 100).toFixed(1)),
      red: parseFloat((colorCounts.red / totalAttributes * 100).toFixed(1))
    });

    localStorage.setItem(statsName, JSON.stringify(stats));
  }
};

const timeBeforeNextRider = ref<string>('');
const day = new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' });
const nextDay = new Date(new Date(day).getFullYear(), new Date(day).getMonth(),  new Date(day).getDate() + 1);
let countdownInterval: number | undefined;

const updateCountdown = () => {
  const newDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const diff = nextDay.getTime() - newDate.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours <= 0 && minutes <= 0 && seconds <= 0) {
    timeBeforeNextRider.value = '00:00:00';
  } else {
    timeBeforeNextRider.value = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
};

onMounted(() => {
  countdownInterval = window.setInterval(updateCountdown, 1000);
  updateCountdown();
});

onUnmounted(() => {
  if (countdownInterval !== undefined) clearInterval(countdownInterval);
});

const getHelpText = (value: string | number, type: string) => {
  switch (type) {
    case 'flag':
      if (typeof value !== 'string') return '';
      return neighboursTyped[value.toUpperCase()]?.neighbours.length > 0 ? langFile.value.game_datatable_tooltip_nationality_orange : langFile.value.game_datatable_tooltip_nationality_red;
    case 'age':
      return getAttributeArrow(value, 'age') === 'mdi-chevron-up' ? langFile.value.game_datatable_tooltip_age_upper : langFile.value.game_datatable_tooltip_age_lower;
    case 'weight':
      return getAttributeArrow(value, 'weight') === 'mdi-chevron-up' ? langFile.value.game_datatable_tooltip_weight_upper : langFile.value.game_datatable_tooltip_weight_lower;
    case 'height':
      return getAttributeArrow(value, 'height') === 'mdi-chevron-up' ? langFile.value.game_datatable_tooltip_height_upper : langFile.value.game_datatable_tooltip_height_lower;
    case 'uci_rank':
      return getAttributeArrow(value, 'uci_rank') === 'mdi-chevron-up' ? langFile.value.game_datatable_tooltip_uci_rank_upper : langFile.value.game_datatable_tooltip_uci_rank_lower;
    case 'win':
      return getAttributeArrow(value, 'win') === 'mdi-chevron-up' ? langFile.value.game_datatable_tooltip_win_upper : langFile.value.game_datatable_tooltip_win_lower;
    case 'gt_participation':
      return getAttributeArrow(value, 'gt_participation') === 'mdi-chevron-up' ? langFile.value.game_datatable_tooltip_gt_participation_upper : langFile.value.game_datatable_tooltip_gt_participation_lower;
    case 'classic_participation':
      return getAttributeArrow(value, 'classic_participation') === 'mdi-chevron-up' ? langFile.value.game_datatable_tooltip_classic_participation_upper : langFile.value.game_datatable_tooltip_classic_participation_lower;
    default:
      return '';
  }
}

const getOrdinalSuffix = (value: number) => {
  if (props.lang === 'fr') {
    return value === 1 ? 'er' : 'ème';
  } 
  else if (props.lang === 'en') {
    if ([11, 12, 13].includes(value % 100)) return 'th';
    const lastDigit = value % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  }
  return '';
};
 
const getAttributeColor = (value: string | number, type: string) => {
  if (!randomRider.value) return 'red';

  const valueRider = randomRider.value[type as keyof Rider];
  if (value === valueRider) return 'green';

  if (type === 'flag' && typeof value === 'string' && typeof valueRider === 'string' && neighboursTyped[value.toUpperCase()].neighbours.includes(valueRider.toUpperCase())) return 'orange';
  
  const helpGap: any  = {age: 2, height: 0.04, weight: 4, uci_rank: 30, win: 5, gt_participation: 1, classic_participation: 2}; // customize variables to return orange to help the player
  if (typeof valueRider === 'number' && typeof value === 'number' && value - helpGap[type] <= valueRider && value + helpGap[type] >= valueRider) return 'orange';
  return 'red';
};
 
const getAttributeArrow = (value: number|string, type: string) => {
  if (!randomRider.value) return 'mdi-close';
  if ((value < randomRider.value[type as keyof Rider] && type !== 'uci_rank') || (value > randomRider.value[type as keyof Rider] && type === 'uci_rank')) return 'mdi-chevron-up'; // invert logic on UCI rank
  if ((value > randomRider.value[type as keyof Rider] && type !== 'uci_rank') || (value < randomRider.value[type as keyof Rider] && type === 'uci_rank')) return 'mdi-chevron-down';
  if ((!value || !randomRider.value[type as keyof Rider]) && value !== 0) return 'mdi-close';
  return 'mdi-check';
};
 
const saveToClipboard = () => {
  const firstDate = new Date('2025-03-02');
  const nb = Math.floor((new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  let textToShare = `Cycdle (@Cycdle) ${mode.value === 'rider-wt' ? 'WT' : 'PRT'}#${nb} - ${guesses.value.length} ${langFile.value.game_modal_win_text_share_try}\n`;

  for (const guess of guesses.value.slice().reverse()) {
    for (const key of Object.keys(guess)) {
      if (attributes.includes(key)) {
        const color = getAttributeColor(guess[key as keyof Rider], key);
        let colorEmoji = '';
        if (color === 'green') {
          colorEmoji = '🟩';
        } else if (color === 'orange') {
          colorEmoji = '🟧';
        } else {
          colorEmoji = '🟥';
        }
        textToShare += colorEmoji;
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
  const name = typeof item.raw.name === 'string' ? item.raw.name.toLowerCase() : '';
  const team = typeof item.raw.team === 'string' ? item.raw.team.toLowerCase() : '';
  const nationality = typeof item.raw.nationality === 'string' ? item.raw.nationality.toLowerCase() : '';
  return name.indexOf(query.toLowerCase()) > -1 || team.indexOf(query.toLowerCase()) > -1 || nationality.indexOf(query.toLowerCase()) > -1;
}
</script>
 
<template>
  <div class="game d-block flex-column align-center justify-center">
    <div v-if="won" class="d-flex align-center justify-center flex-column flex-md-row text-center text-md-left">
      <h4 class="mb-2 mb-md-0 mr-2">{{ langFile.game_win_text }}</h4>
      <v-btn @click="isDialogWinActive = true" class="ml-md-2" color="#0a74da" prepend-icon="mdi-trophy-variant-outline">{{ langFile.game_win_button }}</v-btn>
    </div>
    <div v-if="won" class="d-flex align-center justify-center text-center mt-2 mb-8 ">
      <h4>{{ langFile.game_win_time_before_new_game }}</h4>
      <v-chip variant="outlined" size="large" class="ml-2 font-weight-bold" color="#0a74da">{{ timeBeforeNextRider }}</v-chip>
    </div>
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
 
    <v-data-table :items="guesses" :headers="headers" hide-no-data items-per-page="-1" disable-sort>
      <template v-slot:header.specialties="{ column }">
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
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(value, 'age') === 'green'" max-width="250">
          {{ getHelpText(value, 'age') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(value, 'age')" v-bind="props">
              {{ value }} <v-icon :icon="getAttributeArrow(value, 'age')" />
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.nationality="{ item }">
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(item.flag, 'flag') === 'green'" max-width="250">
          {{ getHelpText(item.flag, 'flag') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(item.flag, 'flag')" :prepend-icon="`fi fi-${item.flag}`" v-bind="props">
              {{ item.nationality }}
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.weight_height="{ item }">
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(item.weight, 'weight') === 'green'" max-width="250">
          {{ getHelpText(item.weight, 'weight') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(item.weight, 'weight')" v-bind="props">
              {{ item.weight || '-- ' }}kg <v-icon :icon="getAttributeArrow(item.weight, 'weight')" />
            </v-chip>
          </template>
        </v-tooltip>
        <v-divider inset thickness="5" color="transparent" />
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(item.height, 'height') === 'green'" max-width="250">
          {{ getHelpText(item.height, 'height') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(item.height, 'height')" v-bind="props">
              {{ item.height || '-- ' }}m <v-icon :icon="getAttributeArrow(item.height, 'height')" />
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.uci_rank="{ value }">
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(value, 'uci_rank') === 'green'" max-width="250">
          {{ getHelpText(value, 'uci_rank') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(value, 'uci_rank')" v-bind="props">
              {{ value }}{{ getOrdinalSuffix(value) }} <v-icon :icon="getAttributeArrow(value, 'uci_rank')" />
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.win="{ value }">
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(value, 'win') === 'green'" max-width="250">
          {{ getHelpText(value, 'win') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(value, 'win')" v-bind="props">
              {{ value }}<v-icon :icon="getAttributeArrow(value, 'win')" />
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.gt_classic="{ item }">
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(item.gt_participation, 'gt_participation') === 'green'" max-width="250">
          {{ getHelpText(item.gt_participation, 'gt_participation') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(item.gt_participation, 'gt_participation')" v-bind="props">
              {{ item.gt_participation }}<v-icon :icon="getAttributeArrow(item.gt_participation, 'gt_participation')" />
            </v-chip>
          </template>
        </v-tooltip>
        <v-divider inset thickness="5" color="transparent" />
        <v-tooltip :open-on-click="mobile" :location="mobile ? 'bottom' : 'right'" :disabled="getAttributeColor(item.classic_participation, 'classic_participation') === 'green'" max-width="250">
          {{ getHelpText(item.classic_participation, 'classic_participation') }}
          <template v-slot:activator="{ props }">
            <v-chip :color="getAttributeColor(item.classic_participation, 'classic_participation')" v-bind="props">
              {{ item.classic_participation }}<v-icon :icon="getAttributeArrow(item.classic_participation, 'classic_participation')" />
            </v-chip>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.specialties="{ item }">
        <ChartSpecialities v-if="randomRider" :rider="item" :randomRider />
      </template>
      <template v-slot:bottom>
      </template>
    </v-data-table>
 
    <v-dialog max-width="500" v-model="isDialogWinActive" persistent>
      <template v-slot:default="{ isActive }">
        <v-card>
          <v-card-title class="d-flex justify-end align-center">
            <v-btn icon="mdi-close" variant="text" @click="isActive.value = false" />
          </v-card-title>
          <v-card-text class="pt-0">
            <v-container>
              <v-row justify="center">
                <v-col cols="12" class="text-center pa-0">
                  <div class="custom-avatar-wrapper">
                    <div class="custom-avatar">
                      <img :src="randomRider?.photo" alt="Rider" class="custom-avatar-img" />
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" class="text-center pb-6">
                  <a class="rider-name" :href="randomRider?.url" target="_blank">{{ randomRider?.name }}</a>
                </v-col>
              </v-row>
            </v-container>
            <div>{{ langFile.game_modal_win_text }}</div>
            <div class="pixels pt-2">
              <div v-for="guess in guesses.slice().reverse()" :key="guess.id">
                <span v-for="key of Object.keys(guess)" :key="key">
                  <v-icon v-if="attributes.includes(key)" icon="mdi mdi-square" :color="getAttributeColor(guess[key as keyof Rider], key)" />
                </span>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="mx-4 my-2">
            <v-btn @click="goToStats(true)" prepend-icon="mdi-chart-box-outline" color="#0a74da" variant="flat" class="font-weight-bold">
              {{ langFile.app_modal_stats_title }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="saveToClipboard" prepend-icon="mdi-share-variant" color="green" variant="flat" class="font-weight-bold">
              {{ shareButtonText }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>