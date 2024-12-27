<template>
  <div class="game-field">

  </div>
</template>

<script>

import { useGameStore } from '@/stores/gameStore';

export default {
  name: 'GameField',

  setup() {
    const gameStore = useGameStore();
    return { gameStore };
  },
  data() {
    return {
      gameMode: GameMode.Building,
      field: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
    }
  }
}
</script>

<style scoped>

.game-field {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  width: 300px;
  margin: 0 auto;
}

</style>
