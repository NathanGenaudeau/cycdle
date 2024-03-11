<script setup lang="ts">
import { onMounted, ref } from 'vue';

const riders : any = ref([]);
const randomRider : any = ref('');
const guesses : any = ref([]);

onMounted(async () => {
  randomRider.value = (await (await fetch('http://localhost:3000/api/riders/random')).json())[0];
});

const riderInput = async (e : any) => {
  if (e.target.value.length > 2) {
    riders.value = await (await fetch('http://localhost:3000/api/riders/search/' + e.target.value)).json();
    console.log(riders.value);
  }
};

const selectRider = (rider : any) => {
  if (!guesses.value.includes(rider)) guesses.value.push(rider);
};
</script>

<template>
  <h2>Random rider : {{ randomRider.name }}</h2>
  <h1>ENTER A RIDER NAME</h1>
  <input type="text" @input="(e) => riderInput(e)" />
  <ul v-if="riders">
    <li v-for="rider in riders" :key="rider.id" @click="selectRider(rider)">
      {{ rider.name }}
    </li>
  </ul>

  <table>
    <tr>
      <th>Name</th>
      <th>Age</th>
      <th>Team</th>
      <th>Nationality</th>
      <th>Weight</th>
      <th>Height</th>
      <th>Specialities</th>
      <th>Win</th>
      <th>GT</th>
      <th>Classic</th>
    </tr>
    <tr v-for="rider in guesses" :key="rider.id">
      <td :class="rider.name === randomRider.name ? 'green' : 'red'">{{ rider.name }}</td>
      <td>{{ rider.age }}</td>
      <td>{{ rider.team }}</td>
      <td>{{ rider.nationality }}</td>
      <td>{{ rider.weight }}</td>
      <td>{{ rider.height }}</td>
      <td>{{ rider.specialities }}</td>
      <td>{{ rider.win }}</td>
      <td>{{ rider.gt_participation }}</td>
      <td>{{ rider.classic_participation }}</td>
    </tr>
  </table>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
