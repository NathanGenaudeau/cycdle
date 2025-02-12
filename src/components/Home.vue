<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';

import fr from '../assets/lang/fr.json';
import en from '../assets/lang/en.json';

const router = useRouter();

function redirection(selectedMode: string) {
  localStorage.setItem('mode', selectedMode);
  router.push({ name: 'game' });
}

const props = defineProps({ lang: String});
const langFile = ref(localStorage.getItem('lang') === 'fr' ? fr : en);

watch(() => props.lang, () => {
  langFile.value = props.lang === 'fr' ? fr : en;
});
</script>

<template>
  <div class="home">
    <div class="d-block pa-2">
      <v-btn size="x-large" rounded="lg" @click="redirection('rider-wt')">
        {{ langFile.home_title_wt }}
      </v-btn>
    </div>
    <div class="d-block pa-2">
      <v-btn size="x-large" rounded="lg" @click="redirection('rider-prt')">
        {{ langFile.home_title_prt }}
      </v-btn>
    </div>
  </div>
</template>