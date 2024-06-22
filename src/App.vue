<script setup lang="ts">

import logo  from './assets/logo/cycdle-white.png';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
  <v-layout class="app rounded rounded-md" style="height: 100vh;">
      <v-app-bar>
        <v-img :src="logo" class="logo" @click="router.push('/')" />
        <v-btn icon="mdi-help"></v-btn>
      </v-app-bar>

    <v-main class="d-flex align-center justify-center" style="min-height: 100%;">
      <RouterView></RouterView>
    </v-main>
  </v-layout>
</template>