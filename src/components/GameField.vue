<template>
  <div
      class="game-field"
      :style="`grid-template-columns: repeat(${gameStore.size.value}, 1fr);`">
    <GameCell
        v-for="(cell, index) in gameStore.field.value"
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
  gap: clamp(2px, 1.2vmin, 12px);
  width: min(92vmin, 92vw);
  aspect-ratio: 1 / 1;
  height: auto;
  max-width: 100vw;
  margin: 0 auto;
}

</style>
