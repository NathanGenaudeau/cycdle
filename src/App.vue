<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch, onMounted } from 'vue';
 
import logo from './assets/logo/cycdle-white.png';
import fr from './assets/lang/fr.json';
import en from './assets/lang/en.json';
 
const router = useRouter();
 
const isStatDialogActive = ref(false);
const isHelpDialogActive = ref(false);
const isCreditDialogActive = ref(false);

const lang = ref(localStorage.getItem('lang') || 'fr');
const langFile = ref(localStorage.getItem('lang') === 'fr' ? fr : en);

onMounted(async () => {
  if (!localStorage.getItem('lang')) localStorage.setItem('lang', 'fr');
});

watch(lang, () => {
  localStorage.setItem('lang', lang.value);
  langFile.value = lang.value === 'fr' ? fr : en;
});

let stats = JSON.parse(localStorage.getItem('stats') || '[]');

watch(isStatDialogActive, () => {
  stats = JSON.parse(localStorage.getItem('stats') || '[]');
});

</script>
 
<template>
  <v-layout class="app rounded rounded-md">
    <v-app-bar>
      <v-app-bar-title>
        <v-img :src="logo" class="logo" @click="router.push('/')" />
      </v-app-bar-title>
      <v-btn icon="mdi-chart-box-outline" @click="isStatDialogActive = true"></v-btn>
      <v-btn icon="mdi-help" @click="isHelpDialogActive = true"></v-btn>
      <v-btn icon="mdi-link-variant" @click="isCreditDialogActive = true"></v-btn>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-translate" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-btn icon="fi fi-fr" @click="lang = 'fr'"></v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn icon="fi fi-gb" @click="lang = 'en'"></v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
 
    <v-main class="d-flex align-center justify-center">
      <RouterView :lang />
    </v-main>
  </v-layout>
  <v-dialog max-width="500" v-model="isStatDialogActive">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 ps-2">stats</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <div>{{ stats }}</div>
          <!--idée stat : pourcentage carré rouge/vert, nb moyen carré vert par jour -->
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
  <v-dialog max-width="500" v-model="isHelpDialogActive">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 ps-2">{{ langFile.app_modal_how_to_play_title }}</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <p class="text-justify">
            {{ langFile.app_modal_how_to_play_text_1 }}
            <v-row class="mt-0">
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <v-chip color="green">
                    68kg <v-icon icon="mdi-check" />
                  </v-chip>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <v-chip color="red">
                    66kg <v-icon icon="mdi-chevron-up" />
                  </v-chip>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <v-chip color="red">
                    -- kg <v-icon icon="mdi-close" />
                  </v-chip>
                </v-sheet>
              </v-col>
            </v-row>
            <v-row class="mt-n4">
              <v-col class="d-flex justify-center align-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_1_1 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_1_2 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_1_3 }}</v-sheet>
              </v-col>
            </v-row>
          </p>
          <p class="text-justify">
            <span v-html="langFile.app_modal_how_to_play_text_2" ></span>
            <v-row class="mt-0">
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <img src="./assets/help/help_graph_red.png"/>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <img src="./assets/help/help_graph_orange.png"/>
                </v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>
                  <img src="./assets/help/help_graph_green.png"/>
                </v-sheet>
              </v-col>
            </v-row>
            <v-row class="mt-n4">
              <v-col class="d-flex justify-center align-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_2_1 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_2_2 }}</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>{{ langFile.app_modal_how_to_play_legend_2_3 }}</v-sheet>
              </v-col>
            </v-row>
          </p>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
  <v-dialog max-width="500" v-model="isCreditDialogActive">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 ps-2">{{ langFile.app_modal_credits_title }}</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <div v-html="langFile.app_modal_credits_text_1" ></div>
          <div v-html="langFile.app_modal_credits_text_2" ></div>
          <div v-html="langFile.app_modal_credits_text_3" ></div>
          <div v-html="langFile.app_modal_credits_text_4" ></div>
          <div v-html="langFile.app_modal_credits_text_5" ></div>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>