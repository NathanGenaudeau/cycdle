<script setup lang="ts">

import { RouterView } from 'vue-router';

</script>

<template>
  <v-layout class="rounded rounded-md" style="height: 100vh;">
    <RouterLink to="/"><v-app-bar title="Cycle"></v-app-bar></RouterLink>

    <v-main class="d-flex align-center justify-center" style="min-height: 100%;">
      <RouterView></RouterView>
    </v-main>
  </v-layout>
</template>