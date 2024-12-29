<script setup lang="ts">

import {computed, defineProps} from "vue";
import {useGameStore} from "@/stores/gameStore";
import {Mode} from "@/types/Mode";

const gameStore = useGameStore();

const prop = defineProps({
  cellId: {
    type: Number,
  },
});


/* eslint-disable no-unused-vars */
enum CellMode {
  // Building
  Playable = 'cell-playable',
  NotPlayable = 'cell-not-playable',
  // Playing
  Occupied = 'cell-occupied',
  Focused = 'cell-focused',
  Empty = 'cell-empty',
  MoveAllowed = 'cell-move-allowed',
}
/* eslint-enable no-unused-vars */

const cellMode = computed<CellMode>(() => {
  if (gameStore.mode === Mode.Building) {
    return gameStore.field[prop.cellId].isPlayable ? CellMode.Playable : CellMode.NotPlayable
  } else if (gameStore.mode === Mode.Playing) {
    if(!gameStore.field[prop.cellId].isPlayable){
      return CellMode.NotPlayable;
    }

    if(gameStore.focusedCellIndex === prop.cellId){
      return CellMode.Focused
    }
    if(gameStore.isMoveAllowed(prop.cellId)){
      return CellMode.MoveAllowed
    }
    return gameStore.field[prop.cellId].isOccupied ? CellMode.Occupied : CellMode.Empty;
  }
  return CellMode.Empty;
})

const handleClick = () => {
  if (gameStore.mode === Mode.Building) {
    gameStore.toggleBuildingCell(prop.cellId)
  }else if(cellMode.value === CellMode.MoveAllowed){
    gameStore.moveFocusedCell(prop.cellId)
  }else if(cellMode.value === CellMode.Occupied){
    gameStore.focusCell(prop.cellId)
  }
}

</script>

<template>
  <div class="cell" :class="[cellMode, gameStore.mode]" @click="handleClick">
  </div>
</template>

<style scoped>
.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #000;
}

.cell-not-playable {
  border: 0;
}

.cell-occupied {
  background-color: #fcc;
}

.cell-playable {
  background-color: #ccc;
}

.cell-focused {
  background-color: #cfc;
}

.cell-move-allowed {
  background-color: #0505b3;
}

</style>