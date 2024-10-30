<script setup lang="ts">
 
import logo from './assets/logo/cycdle-white.png';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
 
const router = useRouter();
 
const isHelpDialogActive = ref(false);
const isCreditDialogActive = ref(false);
 
</script>
 
<template>
  <v-layout class="app rounded rounded-md" style="height: 100vh;">
    <v-app-bar>
      <v-app-bar-title>
        <v-img :src="logo" class="logo" @click="router.push('/')" />
      </v-app-bar-title>
      <v-btn icon="mdi-help" @click="isHelpDialogActive = true"></v-btn>
      <v-btn icon="mdi-link-variant" @click="isCreditDialogActive = true"></v-btn>
    </v-app-bar>
 
    <v-main class="d-flex align-center justify-center" style="min-height: 100%;">
      <RouterView></RouterView>
    </v-main>
  </v-layout>
  <v-dialog max-width="500" v-model="isHelpDialogActive">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 ps-2">Comment jouer ?</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <p class="text-justify">
            Chaque jour, un coureur aléatoire (encore en activité) est choisi parmi les X premiers du classement UCI.
            Le but est de le trouver avec le moins d'essais possible.<br/>
            À chaque essai, les informations du coureur que vous avez sélectionné donnerons des indications sur le coureur
            recherché.
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
                <v-sheet>Valeur correcte</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>Valeur plus élevée</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>Pas d'info sur la valeur</v-sheet>
              </v-col>
            </v-row>
          </p>
          <p class="text-justify">
            Le graphique se base sur les spécialités du coureur selon <a href="https://www.procyclingstats.com/">PCS</a>. Un coureur avec un score
            de 100% en montagne n'est pas forcément le meilleur du peloton en montagne mais c'est la spécialité dans
            laquelle il est le meilleur.
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
                <v-sheet>Plus de 15% d'écart</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>5% à 15% d'écart</v-sheet>
              </v-col>
              <v-col class="d-flex justify-center align-center">
                <v-sheet>Correct à 5% près</v-sheet>
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
          <div class="text-h5 ps-2">Crédits</div>
          <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
        </v-card-title>
        <v-card-text class="modal-text">
          <div>Jeu développé par <a href="https://x.com/enilkaNrM">@enilkaNrM</a></div>
          <div>Les données sont tirées du site <a href="https://www.procyclingstats.com/">ProCyclingStats</a></div>
          <div>Cycdle est un projet <a href="https://github.com/NathanGenaudeau/cycdle">open source</a></div>
          <div>Jeu inspiré par <a href="https://wordle.louan.me/">Wordle FR</a></div>
          <div>Projet réalisé avec l'aide de <a href="https://x.com/SwanRoyer">@SwanRoyer</a></div>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>