<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function redirection(selectedMode: string) {
  localStorage.setItem('mode', selectedMode);
  router.push({ name: 'game' });
}

</script>

<template>
  <div class="home">
    <div class="d-block pa-2">
      <v-btn size="x-large" rounded="lg" @click="redirection('rider-wt')">
        Devinez le coureur World Tour
      </v-btn>
    </div>
    <div class="d-block pa-2">
      <v-btn size="x-large" rounded="lg" @click="redirection('rider-prt')">
        Devinez le coureur Pro Tour
      </v-btn>
    </div>
  </div>
</template>