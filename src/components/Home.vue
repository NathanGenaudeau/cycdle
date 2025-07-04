<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify'

import fr from '../assets/lang/fr.json';
import en from '../assets/lang/en.json';

const { mobile } = useDisplay();
const router = useRouter();

function redirection(selectedMode: string) {
  localStorage.setItem('mode', selectedMode);
  if (selectedMode === 'tdf') {
    router.push({ name: 'game-tdf' });
  } else {
    router.push({ name: 'game' });
  }
}

function formatText(text: string): string {
  if (mobile.value) return text.replace(" d", '<br>d').replace(" (", '<br>(');
  else return text.replace(" (", '<br>(');
}

const props = defineProps({ lang: String});
const langFile = ref(localStorage.getItem('lang') === 'en' ? en : fr);

watch(() => props.lang, () => {
  langFile.value = props.lang === 'en' ? en : fr;
});
</script>

<template>
  <div class="home">
    <div class="d-block pa-2">
      <v-btn size="large" rounded="lg" @click="redirection('rider-wt')">
        {{ langFile.home_title_wt }}
      </v-btn>
    </div>
    <div class="d-block pa-2">
      <v-btn size="large" rounded="lg" @click="redirection('rider-prt')">
        {{ langFile.home_title_prt }}
      </v-btn>
    </div>
    <div class="d-block pa-2 new-mode">
      <v-btn size="large" rounded="lg" @click="redirection('tdf')" v-html="formatText(langFile.home_title_tdf)">
      </v-btn>
    </div>
  </div>
</template>