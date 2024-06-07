<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const riders: any = ref([]);
const randomRider: any = ref('');
const guesses: any = ref([]);
const selectedValue = ref(null);

const headers = [
  { title: 'Nom', key: 'name', sortable: false },
  { title: 'Age', key: 'age', sortable: false },
  { title: 'Equipe', key: 'team', sortable: false },
  { title: 'Nationalité', key: 'nationality', sortable: false },
  { title: 'Taille', key: 'height', sortable: false },
  { title: 'Poids', key: 'weight', sortable: false },
  { title: 'Clas. UCI', key: 'uci_rank', sortable: false },
  { title: 'Victoire', key: 'win', sortable: false },
  { title: 'Part. GT', key: 'gt_participation', sortable: false },
  { title: 'Part. Classique', key: 'classic_participation', sortable: false },
  { title: 'Spécialités', key: 'stats', sortable: false, width: '230px' }
];

const legendChart = 'GC: Classement général, MON: Grimpeur, SPR: Sprinteur, CLA: Classique, CLM: Contre-la-montre';

const props = defineProps({
  mode: String
});

onMounted(async () => {
  if (localStorage.getItem('lastPlayed') !== new Date().toLocaleDateString()) {
    localStorage.setItem('lastPlayed', new Date().toLocaleDateString());
    localStorage.setItem('guessesWT', JSON.stringify([]));
    localStorage.setItem('guessesPRT', JSON.stringify([]));
  } else {
    guesses.value = props.mode === 'rider-wt' ? JSON.parse(localStorage.getItem('guessesWT') as string) : JSON.parse(localStorage.getItem('guessesPRT') as string);
  }
  const response = await fetch(`http://localhost:3000/api/riders?mode=${props.mode}`);
  riders.value = await response.json();
  randomRider.value = (await (await fetch(`http://localhost:3000/api/riders/random?mode=${props.mode}`)).json())[0];
  console.log(randomRider.value.name);
});

const selectRider = (riderSelected: any) => {
  const selectedRider = riders.value.find(rider => rider.name === riderSelected);
  if (riderSelected && !guesses.value.includes(selectedRider)) {
    guesses.value.unshift(selectedRider);
    if (props.mode === 'rider-wt') localStorage.setItem('guessesWT', JSON.stringify(guesses.value));
    if (props.mode === 'rider-prt') localStorage.setItem('guessesPRT', JSON.stringify(guesses.value));
  }
  selectedValue.value = null;
};

const getColor = (value: number, type: string) => {
  if (value !== randomRider.value[type]) return 'red';
  return 'green';
};

const getArrow = (value: number, type: string) => {
  if ((value < randomRider.value[type] && type !== 'uci_rank') || (value > randomRider.value[type] && type === 'uci_rank')) return 'mdi-chevron-up';
  if ((value > randomRider.value[type] && type !== 'uci_rank') || (value < randomRider.value[type] && type === 'uci_rank')) return 'mdi-chevron-down';
  return 'mdi-check';
};

const barChartColors = (value: number, type: string) => {
  if (value - 3 < randomRider.value[type] && value + 3 > randomRider.value[type]) return 'green';
  else if (value - 10 < randomRider.value[type] && value + 10 > randomRider.value[type]) return 'orange';
  else return 'red';
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false
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
</script>

<template>
  <div class="game d-block flex-column align-center justify-center">
    <v-autocomplete
      label="Cycliste"
      :items="riders.map(rider => rider.name)"
      v-model="selectedValue"
      @update:model-value="selectRider(selectedValue)"
      placeholder="Entrez le nom d'un coureur"
      variant="outlined"
    ></v-autocomplete>

    <v-data-table :items="guesses" :headers="headers">
      <template v-slot:header.stats="{ column }">
        {{ column.title }}
        <v-tooltip :text="legendChart">
          <template v-slot:activator="{ props }">
            <v-icon icon="mdi-information" v-bind="props"></v-icon>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:item.age="{ value }">
        <v-chip :color="getColor(value, 'age')">
          {{ value }} <v-icon :icon="getArrow(value, 'age')"/>
        </v-chip>
      </template>
      <template v-slot:item.team="{ value }">
        <v-chip :color="getColor(value, 'team')">
          {{ value }}
        </v-chip>
      </template>
      <template v-slot:item.nationality="{ item }">
        <v-chip :color="getColor(item.nationality, 'nationality')">
          <span :class="`fi fi-${item.flag}`" />&nbsp;{{ item.nationality }}
        </v-chip>
      </template>
      <template v-slot:item.height="{ value }">
        <v-chip :color="getColor(value, 'height')">
          {{ value }} <v-icon :icon="getArrow(value, 'height')"/>
        </v-chip>
      </template>
      <template v-slot:item.weight="{ value }">
        <v-chip :color="getColor(value, 'weight')">
          {{ value }} <v-icon :icon="getArrow(value, 'weight')"/>
        </v-chip>
      </template>
      <template v-slot:item.uci_rank="{ value }">
        <v-chip :color="getColor(value, 'uci_rank')">
          {{ value }} <v-icon :icon="getArrow(value, 'uci_rank')"/>
        </v-chip>
      </template>
      <template v-slot:item.win="{ value }">
        <v-chip :color="getColor(value, 'win')">
          {{ value }} <v-icon :icon="getArrow(value, 'win')"/>
        </v-chip>
      </template>
      <template v-slot:item.gt_participation="{ value }">
        <v-chip :color="getColor(value, 'gt_participation')">
          {{ value }} <v-icon :icon="getArrow(value, 'gt_participation')"/>
        </v-chip>
      </template>
      <template v-slot:item.classic_participation="{ value }">
        <v-chip :color="getColor(value, 'classic_participation')">
          {{ value }} <v-icon :icon="getArrow(value, 'classic_participation')"/>
        </v-chip>
      </template>
      <template v-slot:item.stats="{ item }">
        <BarChart :chartData="formatRiderSpecialities(item)" :options="options" />
      </template>
      <template v-slot:bottom>
      </template>
    </v-data-table>
  </div>
</template>
