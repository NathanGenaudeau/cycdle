<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PolarAreaChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const riders: any = ref([]);
const randomRider: any = ref('');
const guesses: any = ref([]);
const input = ref('');
const lifes = ref(10);

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

  randomRider.value = (await (await fetch(`http://localhost:3000/api/riders/random?mode=${props.mode}`)).json())[0];
  console.log(randomRider.value.name);
});

const riderInput = async () => {
  if (input.value.length >= 2) {
    riders.value = await (await fetch(`http://localhost:3000/api/riders/search/${input.value}?mode=${props.mode}`)).json();
  } else {
    riders.value = [];
  }
};

const selectRider = (rider: any) => {
  if (!guesses.value.includes(rider)) {
    guesses.value.unshift(rider);
    if (props.mode === 'rider-wt') localStorage.setItem('guessesWT', JSON.stringify(guesses.value));
    if (props.mode === 'rider-prt') localStorage.setItem('guessesPRT', JSON.stringify(guesses.value));
  }
  riders.value = [];
  input.value = '';
  lifes.value = rider === randomRider.value ? lifes.value : lifes.value - 1;
};

const config = {
  responsive: true
  // remove arc legend
};

const formatRiderSpecialities = (rider: any) => {
  return {
    /*labels: [
      'Classement général',
      'Montagne',
      'Sprint',
      'Course d\'un jour',
      'Contre la montre'
    ],*/
    datasets: [{
      label: 'Spécialités',
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
  <div class="search">
    <input type="text" v-model="input" @input="riderInput" placeholder="Entrez le nom d'un coureur" />
    <ul v-if="riders" class="search-riders">
      <li v-for="rider in riders" :key="rider.id" @click="selectRider(rider)">
        {{ rider.name }}
      </li>
    </ul>
  </div>

  <div class="lifes">
    <h3>Vies restantes :</h3>
    <span class="heart" v-for="i in lifes" :key="i" />
    <span class="heart-empty" v-for="i in 10 - lifes" :key="i" />
  </div>

  <table>
    <tr>
      <th>Nom</th>
      <th>Âge</th>
      <th>Équipe</th>
      <th>Nationalité</th>
      <th>Poids</th>
      <th>Taille</th>
      <th>Victoire</th>
      <th>Part. GT</th>
      <th>Part. Classique</th>
      <!--<th>GC</th>
      <th>Montagne</th>
      <th>Sprint</th>
      <th>Course d'un jour</th>
      <th>Contre la montre</th>-->
      <th>Graphe</th>
    </tr>
    <tr v-for="rider in guesses" :key="rider.id">
      <td>{{ rider.name }}</td>
      <td :class="rider.age === randomRider.age ? 'green' : 'red'">
        {{ rider.age }} ans
        <span v-if="rider.age < randomRider.age">&uarr;</span>
        <span v-if="rider.age > randomRider.age">&darr;</span>
      </td>
      <td :class="rider.team === randomRider.team ? 'green' : 'red'">{{ rider.team }}</td>
      <td :class="rider.nationality === randomRider.nationality ? 'green' : 'red'">{{ rider.nationality }}</td>
      <td :class="rider.weight === randomRider.weight ? 'green' : 'red'">
        {{ rider.weight }} kg
        <span v-if="rider.weight < randomRider.weight">&uarr;</span>
        <span v-if="rider.weight > randomRider.weight">&darr;</span>
      </td>
      <td :class="rider.height === randomRider.height ? 'green' : 'red'">
        {{ rider.height }} m
        <span v-if="rider.height < randomRider.height">&uarr;</span>
        <span v-if="rider.height > randomRider.height">&darr;</span>
      </td>
      <td :class="rider.win === randomRider.win ? 'green' : 'red'">
        {{ rider.win }}
        <span v-if="rider.win < randomRider.win">&uarr;</span>
        <span v-if="rider.win > randomRider.win">&darr;</span>
      </td>
      <td :class="rider.gt_participation === randomRider.gt_participation ? 'green' : 'red'">
        {{ rider.gt_participation }}
        <span v-if="rider.gt_participation < randomRider.gt_participation">&uarr;</span>
        <span v-if="rider.gt_participation > randomRider.gt_participation">&darr;</span>
      </td>
      <td :class="rider.classic_participation === randomRider.classic_participation ? 'green' : 'red'">
        {{ rider.classic_participation }}
        <span v-if="rider.classic_participation < randomRider.classic_participation">&uarr;</span>
        <span v-if="rider.classic_participation > randomRider.classic_participation">&darr;</span>
      </td>
      <!--<td :class="rider.general_classification === randomRider.general_classification ? 'green' : 'red'">
        {{ rider.general_classification }}%
        <span v-if="rider.general_classification < randomRider.general_classification">&uarr;</span>
        <span v-if="rider.general_classification > randomRider.general_classification">&darr;</span>
      </td>
      <td :class="rider.climber === randomRider.climber ? 'green' : 'red'">
        {{ rider.climber }}%
        <span v-if="rider.climber < randomRider.climber">&uarr;</span>
        <span v-if="rider.climber > randomRider.climber">&darr;</span>
      </td>
      <td :class="rider.sprint === randomRider.sprint ? 'green' : 'red'">
        {{ rider.sprint }}%
        <span v-if="rider.sprint < randomRider.sprint">&uarr;</span>
        <span v-if="rider.sprint > randomRider.sprint">&darr;</span>
      </td>
      <td :class="rider.one_day_races === randomRider.one_day_races ? 'green' : 'red'">
        {{ rider.one_day_races }}%
        <span v-if="rider.one_day_races < randomRider.one_day_races">&uarr;</span>
        <span v-if="rider.one_day_races > randomRider.one_day_races">&darr;</span>
      </td>
      <td :class="rider.time_trial === randomRider.time_trial ? 'green' : 'red'">
        {{ rider.time_trial }}%
        <span v-if="rider.time_trial < randomRider.time_trial">&uarr;</span>
        <span v-if="rider.time_trial > randomRider.time_trial">&darr;</span>
      </td>-->
      <td>
        <PolarAreaChart :chartData="formatRiderSpecialities(rider)" :config="config" />
      </td>
    </tr>
  </table>
</template>
