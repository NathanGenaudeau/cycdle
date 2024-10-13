<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
 
const riders: any = ref([]);
const randomRider: any = ref('');
const guesses: any = ref([]);
const selectedValue = ref(null);
const won = ref(false);
const isDialogActive = ref(false);

const shareButtonText = ref('Partager');
 
const headers = [
  { title: 'Nom', key: 'name', sortable: false, maxWidth: '130px', align: 'center' },
  { title: 'Age', key: 'age', sortable: false, align: 'center' },
  { title: 'Equipe', key: 'team', sortable: false, align: 'center' },
  { title: 'Nationalité', key: 'nationality', sortable: false, align: 'center' },
  { title: 'Poids / Taille', key: 'measurement', sortable: false, align: 'center' },
  { title: 'Rang UCI', key: 'uci_rank', sortable: false, align: 'center' },
  { title: 'Victoire', key: 'win', sortable: false, align: 'center' },
  { title: 'Grand Tour / Classique', key: 'partGTClassic', sortable: false, align: 'center' },
  { title: 'Spécialités', key: 'stats', sortable: false, minWidth: '230px', maxWidth: '230px', align: 'center' }
];
 
let mode: string | null = '';
 
onMounted(async () => {

  mode = localStorage.getItem('mode');
  if (localStorage.getItem('lastPlayed') !== new Date().toLocaleDateString()) {
    localStorage.setItem('lastPlayed', new Date().toLocaleDateString());
    localStorage.setItem('guessesWT', JSON.stringify([]));
    localStorage.setItem('guessesPRT', JSON.stringify([]));
    localStorage.setItem('wonWT', JSON.stringify(false));
    localStorage.setItem('wonPRT', JSON.stringify(false));
  } else {
    won.value = mode === 'rider-wt' ? JSON.parse(localStorage.getItem('wonWT') as string) : JSON.parse(localStorage.getItem('wonPRT') as string);
    guesses.value = mode === 'rider-wt' ? JSON.parse(localStorage.getItem('guessesWT') as string) : JSON.parse(localStorage.getItem('guessesPRT') as string);
  }
  if (won.value) {
    isDialogActive.value = true;

  }
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/riders?mode=${mode}`);
  riders.value = await response.json();
  randomRider.value = (await (await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/riders/random?mode=${mode}`)).json())[0];
});
 
const selectRider = (riderSelected: any) => {
  const selectedRider = riders.value.find((rider: any) => rider.name === riderSelected);
  if (!selectedRider || selectedRider && guesses.value.find((rider: any) => rider.id === selectedRider.id)) return;
  if (selectedRider.id === randomRider.value.id) {
    won.value = true;
    isDialogActive.value = true;
    if (mode === 'rider-wt') localStorage.setItem('wonWT', JSON.stringify(true))
    if (mode === 'rider-prt') localStorage.setItem('wonPRT', JSON.stringify(true));
  }
 
  guesses.value.unshift(selectedRider);
  if (mode === 'rider-wt') localStorage.setItem('guessesWT', JSON.stringify(guesses.value));
  if (mode === 'rider-prt') localStorage.setItem('guessesPRT', JSON.stringify(guesses.value));
  selectedValue.value = null;
};
 
const attributes = ['age', 'team', 'nationality', 'weight', 'height', 'uci_rank', 'win', 'gt_participation', 'classic_participation'];
 
const getColor = (value: string, type: string) => {
  if (value !== randomRider.value[type]) return 'red';
  return 'green';
};
 
const getArrow = (value: string, type: string) => {
  if ((parseFloat(value) < parseFloat(randomRider.value[type]) && type !== 'uci_rank') || (parseFloat(value) > parseFloat(randomRider.value[type]) && type === 'uci_rank')) return 'mdi-chevron-up';
  if ((parseFloat(value) > parseFloat(randomRider.value[type]) && type !== 'uci_rank') || (parseFloat(value) < parseFloat(randomRider.value[type]) && type === 'uci_rank')) return 'mdi-chevron-down';
  if (value === null) return 'mdi-close';
  return 'mdi-check';
};
 
const barChartColors = (value: number, type: string) => {
  if (value - 5 <= randomRider.value[type] && value + 5 >= randomRider.value[type]) return 'green';
  else if (value - 15 <= randomRider.value[type] && value + 15 >= randomRider.value[type]) return 'orange';
  else return 'red';
};
 
const options = {
  responsive: true,
  plugins: {
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
 
const formatRiderSpecialities = (rider: any) => {
  return {
    labels: ['GC', 'MON', 'SPR', 'CLA', 'CLM'],
    datasets: [{
      data: [rider.general_classification, rider.climber, rider.sprint, rider.one_day_races, rider.time_trial],
      backgroundColor: [
        barChartColors(rider.general_classification, 'general_classification'),
        barChartColors(rider.climber, 'climber'),
        barChartColors(rider.sprint, 'sprint'),
        barChartColors(rider.one_day_races, 'one_day_races'),
        barChartColors(rider.time_trial, 'time_trial')
      ]
    }]
  };
}
 
const saveToClipboard = () => {
  const firstDate = new Date('2024-06-29');
  const nb = Math.floor((new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  let textToShare = `Cycdle (@Cycdle) #${nb}\n`;
 
  for (const guess of guesses.value.slice().reverse()) {
    for (const key of Object.keys(guess)) {
      if (attributes.includes(key)) {
        textToShare += getColor(guess[key], key) === 'green' ? '🟩' : '🟥';
      }
    }
    textToShare += '\n';
  }
  textToShare += 'https://cycdle.fun';
 
  navigator.clipboard.writeText(textToShare).then(
    function () {
      shareButtonText.value = 'Copié';
      setTimeout(() => {
        shareButtonText.value = 'Partager';
      }, 2000);
    },
  );
}
 
</script>
 
<template>
  <div class="game d-block flex-column align-center justify-center">
    <v-autocomplete label="Rechercher un cycliste" :items="riders.map((rider: any) => rider.name)"
      v-model="selectedValue" @update:model-value="selectRider(selectedValue)" placeholder="Entrez le nom d'un coureur"
      variant="outlined" :disabled="won" color="#0a74da" base-color="#0a74da" hide-no-data>
    </v-autocomplete>
 
    <v-data-table :items="guesses" :headers="headers as any" hide-no-data>
      <template v-slot:header.stats="{ column }">
        {{ column.title }}
        <v-tooltip>
          <template v-slot:activator="{ props }">
            <v-icon icon="mdi-information" v-bind="props"></v-icon>
          </template>
          <p>Profil du coureur basé sur PCS</p>
          <p>GC: Classement général</p>
          <p>MON: Grimpeur</p>
          <p>SPR: Sprinteur</p>
          <p>CLA: Classique</p>
          <p>CLM: Contre-la-montre</p>
        </v-tooltip>
      </template>
      <template v-slot:item.age="{ value }">
        <v-chip :color="getColor(value, 'age')">
          {{ value }} <v-icon :icon="getArrow(value, 'age')" />
        </v-chip>
      </template>
      <template v-slot:item.team="{ value }">
        <v-chip :color="getColor(value, 'team')">
          {{ value.split(' ').splice(0, 2).join(' ') }} <br /> {{ value.split(' ').splice(2).join(' ') }}
        </v-chip>
      </template>
      <template v-slot:item.nationality="{ item }">
        <v-chip :color="getColor((item as any).nationality, 'nationality')" :prepend-icon="`fi fi-${(item as any).flag}`">
          {{ (item as any).nationality }}
        </v-chip>
      </template>
      <template v-slot:item.measurement="{ item }">
        <v-chip :color="getColor((item as any).weight, 'weight')">
          {{ (item as any).weight || '?? ' }}kg <v-icon :icon="getArrow((item as any).weight, 'weight')" />
        </v-chip>
        <v-divider inset thickness="5" color="transparent" />
        <v-chip :color="getColor((item as any).height, 'height')">
          {{ (item as any).height || '?? ' }}m <v-icon :icon="getArrow((item as any).height, 'height')" />
        </v-chip>
      </template>
      <template v-slot:item.uci_rank="{ value }">
        <v-chip :color="getColor(value, 'uci_rank')">
          {{ value }} <v-icon :icon="getArrow(value, 'uci_rank')" />
        </v-chip>
      </template>
      <template v-slot:item.win="{ value }">
        <v-chip :color="getColor(value, 'win')">
          {{ value }} <v-icon :icon="getArrow(value, 'win')" />
        </v-chip>
      </template>
      <template v-slot:item.partGTClassic="{ item }">
        <v-chip :color="getColor((item as any).gt_participation, 'gt_participation')">
          {{ (item as any).gt_participation }} <v-icon :icon="getArrow((item as any).gt_participation, 'gt_participation')" />
        </v-chip>
        <v-divider inset thickness="5" color="transparent" />
        <v-chip :color="getColor((item as any).classic_participation, 'classic_participation')">
          {{ (item as any).classic_participation }} <v-icon
            :icon="getArrow((item as any).classic_participation, 'classic_participation')" />
        </v-chip>
      </template>
      <template v-slot:item.stats="{ item }">
        <BarChart :chartData="formatRiderSpecialities(item)" :options="options" />
      </template>
      <template v-slot:bottom>
      </template>
    </v-data-table>
 
    <v-dialog max-width="500" v-model="isDialogActive" persistent>
      <template v-slot:default="{ isActive }">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="text-h5 text-medium-emphasis ps-2">Félicitations !</div>
            <v-btn icon="mdi-close" variant="text" @click="isActive.value = false" />
          </v-card-title>
          <v-card-text>
            <div>
              Bravo, vous avez trouvé le coureur du jour ! Partagez votre score à vos amis pour qu'ils essaient de le battre.
            </div>
            <div class="pixels">
              <div v-for="guess in guesses.slice().reverse()" :key="guess.id">
                <span v-for="key of Object.keys(guess)" :key="key">
                  <v-icon v-if="attributes.includes(key)" icon="mdi mdi-square" :color="getColor(guess[key], key)" />
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