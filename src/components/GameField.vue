<template>
  <div
      class="game-field"
      :style="`grid-template-columns: repeat(${gameStore.size}, 1fr);`">
    <GameCell
        v-for="(cell, index) in gameStore.field"
        :key="index"
        :cellId="index" />
  </div>
</template>

<script setup>

import { useGameStore } from '@/stores/gameStore';
import GameCell from "@/components/GameCell.vue";

const gameStore = useGameStore();
</script>

<style scoped>

.game-field {
  display: grid;
  grid-gap: 3vh;
  width: 90vh;
  height: 90vh;
  margin: 0 auto;
}

</style>
