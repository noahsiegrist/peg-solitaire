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
  border-radius: 100%;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); /* Adds a nice shadow */
  transition: box-shadow 0.3s ease; /* Smooth shadow transition */
}

.cell:hover {
  box-shadow: 0 8px 10px rgba(0, 0, 0, 0.15), 0 3px 5px rgba(0, 0, 0, 0.12); /* Darker shadow on hover */
}

.cell-not-playable {

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
.cell-occupied:hover {
  background-color: #e5ffe5;
}


.cell-move-allowed {
  background-color: #bebeff;
}

.cell-move-allowed:hover {
  background-color: #9292ff;
}

.cell-empty {
  background-color: #f6f6f6;
}

</style>