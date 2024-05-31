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
  <v-layout class="rounded rounded-md" style="height: 100vh;">
    <v-app-bar title="Cycle"></v-app-bar>

    <v-main class="d-flex align-center justify-center" style="min-height: 100%;">
      <Home v-if="!modeSelected" @gameChoice="choseGame" />
      <Game v-else :mode="modeSelected" />
    </v-main>
  </v-layout>
</template>