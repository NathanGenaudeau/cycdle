<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const riders: any = ref([]);
const randomRider: any = ref('');
const guesses: any = ref([]);
const selectedValue = ref(null);
const lifes = ref(10);

const headers = [
  { title: 'Nom', key: 'name', sortable: false },
  { title: 'Age', key: 'age', sortable: false },
  { title: 'Equipe', key: 'team', sortable: false },
  { title: 'Nationalité', key: 'nationality', sortable: false },
  { title: 'Taille', key: 'height', sortable: false },
  { title: 'Poids', key: 'weight', sortable: false },
  { title: 'Victoire', key: 'win', sortable: false },
  { title: 'Participation GT', key: 'gt_participation', sortable: false },
  { title: 'Participation classique', key: 'classic_participation', sortable: false },
  { title: 'Stats', key: 'stats', sortable: false }
];

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
    lifes.value = 10 - guesses.value.length;
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
    lifes.value = selectedRider === randomRider.value ? lifes.value : lifes.value - 1;
  }
  selectedValue.value = '';
};

const getColor = (value: number) => {
  if (value !== randomRider.value.age) return 'red';
  return 'green';
};

const getArrow = (value: number) => {
  if (value < randomRider.value.age) return 'mdi-chevron-up';
  if (value > randomRider.value.age) return 'mdi-chevron-down';
  return 'mdi-check';
};

const formatRiderSpecialities = (rider: any) => {
  return {
    labels: ['GC', 'MON', 'SPR', 'CLA', 'CLM'],
    datasets: [{
      label: ['Spécialités'],
      data: [rider.general_classification, rider.climber, rider.sprint, rider.one_day_races, rider.time_trial],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(75, 192, 192)',
        'rgb(255, 205, 86)',
        'rgb(201, 203, 207)',
        'rgb(54, 162, 235)'
      ]
    }]
  };
}
</script>

<template>
  <v-autocomplete
    label="Cycliste"
    :items="riders.map(rider => rider.name)"
    v-model="selectedValue"
    @update:model-value="selectRider(selectedValue)"
    placeholder="Entrez le nom d'un coureur"
    variant="outlined"
  ></v-autocomplete>

  <div class="lifes">
    <h3>Vies restantes :</h3>
    <span class="heart" v-for="i in lifes" :key="i" />
    <span class="heart-empty" v-for="i in 10 - lifes" :key="i" />
  </div>

  <v-data-table :items="guesses" :headers="headers">
    <template v-slot:item.age="{ value }">
      <v-chip :color=getColor(value)>
        {{ value }} <v-icon :icon="getArrow(value)"/>
      </v-chip>
    </template>
    <template v-slot:item.stats="{ item }">
      <BarChart :chartData="formatRiderSpecialities(item)" />
    </template>
  </v-data-table>
</template>
