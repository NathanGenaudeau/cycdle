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
        <v-img :src="logo" class="logo" @click="router.push('/cycdle')" />
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
        <v-card-text>
 
          <p class="help-text">
            Chaque jour, un coureur aléatoire est choisi parmi tous ceux en activité et selon le mode de jeu choisi.
            Le but du jeu est de trouver ce coureur avec le moins d'essais possible.
            À chaque essai, les informations du coureur que vous avez sélectionné donnerons des indications le coureur
            recherché.
            Flèche bas / fléche haut + rouge = valeur incorrecte
            Tick + vert = valeur correcte
            Croix + orange = pas d'information
          </p>
          <p class="help-text">
            Le graphiaque se base sur les spécialités du coureur selon PCS. Un coureur avec un score
            de 100 en montagne n'est pas forcément le meilleur du peloton en montagne mais c'est la spécialités dans
            laquelle il est le meilleur parmis les autres.
            En ce qui concerne les couleurs du graphique :
            -> rouge = + de 10 d'écart en positif/négatif
            -> orange = entre 3 et 10 d'écart (en positif ou négatif)
            -> vert = correct à 3 près (en + ou -)
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