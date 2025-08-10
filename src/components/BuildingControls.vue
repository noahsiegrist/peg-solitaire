<script setup lang="ts">

import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';

const gameStore = useGameStore();
</script>

<template>
  <div class="building-controls">
    <button @click="gameStore.toggleGameMode">{{gameStore.mode}}</button>
    <button @click="gameStore.resetGame">Reset Game</button>

    <div class="controlls" v-if="gameStore.mode === Mode.Building">
      <input type="range" min="1" max="20" class="slider" id="sizeSlider" v-model.number="gameStore.size">
    </div>
  </div>
</template>

<style scoped>

input button {
  margin: 0 10px;
}

.building-controls {
  position: fixed;
  top: 10vh;         /* Increased top spacing */
  right: 10vw;       /* Increased right spacing */
  z-index: 100;      /* Ensure it's on top */
  background-color: rgba(0, 0, 0, 0.2); /* Optional background */
  padding: 20px;     /* Increased padding for more space inside */
  border-radius: 8px;
  color: white;      /* Optional for text color */
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  background: #ddd;
  outline: none;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.slider:hover {
  background: #aaa;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
}
</style>