<script setup lang="ts">

import {defineProps} from "vue";
import {useGameStore} from "@/stores/gameStore";

const gameStore = useGameStore();

const prop = defineProps({
  cellId: {
    type: Number,
  },
});




const handleClick = () => {
  gameStore.setCell(prop.cellId);
};

</script>

<template>
  <div class="cell " @click="handleClick">
    <div  v-if="gameStore.field[prop.cellId] == 1">X</div>
  </div>
</template>

<style scoped>
.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #000;
}
</style>