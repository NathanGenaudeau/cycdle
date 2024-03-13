<script setup lang="ts">
import Home from './components/Home.vue';
import Game from './components/Game.vue';

import { ref } from 'vue';

const modeSelected = ref('');

const choseGame = (choice : string) => {
  modeSelected.value = choice;
};

</script>

<template>
  <!--<router-link to="/riders">Coureurs</router-link>-->
  <div>
    <Home v-if="!modeSelected" @gameChoice="choseGame" />
    <Game v-else :mode="modeSelected" />
  </div>
  
</template>

<style scoped>
</style>
