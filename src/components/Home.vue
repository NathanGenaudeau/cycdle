<script setup lang="ts">

</script>

<template>
  <div class="home">
    <div class="d-block pa-2">
      <v-btn size="x-large" rounded="lg" @click="$emit('gameChoice', 'rider-wt')">
        Devinez le coureur World Tour
      </v-btn>
    </div>
    <div class="d-block pa-2">
      <v-btn size="x-large" rounded="lg" @click="$emit('gameChoice', 'rider-prt')">
        Devinez le coureur Pro Tour
      </v-btn>
    </div>
  </div>
</template>