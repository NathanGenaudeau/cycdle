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
 
          <p class="help-text">
            Chaque jour, un coureur aléatoire (encore en activité) est choisi parmi les X premiers du classement UCI.
            Le but est de le trouver en moins d'essais possible.<br/>
            À chaque essai, les informations du coureur que vous avez sélectionné donnerons des indications sur le coureur
            recherché.<br/>
            Flèche haut/bas + rouge = valeur incorrecte<br/>
            Tick + vert = valeur correcte<br/>
            Croix + orange = pas d'information<br/>
          </p>
          <p class="help-text">
            Le graphique se base sur les spécialités du coureur selon  <a href="https://www.procyclingstats.com/">PCS</a>. Un coureur avec un score
            de 100 en montagne n'est pas forcément le meilleur du peloton en montagne mais c'est la spécialité dans
            laquelle il est le meilleur.<br/>
            Équivalence des couleurs :<br/>
            Rouge = + de 15% d'écart (en positif ou négatif)<br/>
            Orange = Entre 5% et 15% d'écart <br/>
            Vert = Correct à 5% près<br/>
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