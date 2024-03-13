<script setup lang="ts">

</script>

<template>
    <div>
        <h1>Cycdle</h1>

        <h2 @click="$emit('gameChoice', 'rider-wt')">Devinez le coureur World Tour</h2>
        <h2 @click="$emit('gameChoice', 'rider-prt')">Devinez le coureur Pro Tour</h2>
        <h2 @click="$emit('gameChoice', 'stage-wt')">Devinez l'étape d'une course World Tour</h2>
    </div>
</template>

<style scoped>
    h2 {
        cursor: pointer;
    }
    h2:hover {
        color: #f00;
    }
    h1 {
        text-align: center;
    }
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>