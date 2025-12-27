<script setup lang="ts">

import { computed } from "vue";
import {useGameStore} from "@/stores/gameStore";

const gameStore = useGameStore();

const props = defineProps<{ cellId: number }>();


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
  MoveAllowedHover = 'cell-move-allowed-hover',
}
/* eslint-enable no-unused-vars */

const cellMode = computed<CellMode>(() => {
  const id = props.cellId;
  const { isBuildingMode, field, focusedCellIndex, hoveredCellIndex, isMoveAllowedFrom } = gameStore;

  if (isBuildingMode.value) {
    return field.value[id].isPlayable ? CellMode.Playable : CellMode.NotPlayable;
  }

  // Playing mode
  const cell = field.value[id];
  if (!cell.isPlayable) return CellMode.NotPlayable;
  if (focusedCellIndex.value === id) return CellMode.Focused;
  if (focusedCellIndex.value !== -1 && isMoveAllowedFrom(focusedCellIndex.value, id)) return CellMode.MoveAllowed;
  if (hoveredCellIndex.value !== -1 && isMoveAllowedFrom(hoveredCellIndex.value, id)) return CellMode.MoveAllowedHover;
  return cell.isOccupied ? CellMode.Occupied : CellMode.Empty;
})

const modeClass = computed(() => gameStore.isBuildingMode.value ? 'building' : 'playing');

const handleClick = () => {
  if (gameStore.isBuildingMode.value) {
    gameStore.toggleBuildingCell(props.cellId)
  }else if(cellMode.value === CellMode.MoveAllowed){
    gameStore.moveFocusedCell(props.cellId)
  }else if(cellMode.value === CellMode.Occupied){
    gameStore.focusCell(props.cellId)
  }
}

const handleMouseEnter = () => {
  if (gameStore.isBuildingMode.value) return;
  const cell = gameStore.field.value[props.cellId];
  if (cell?.isPlayable && cell?.isOccupied) {
    gameStore.hoveredCellIndex.value = props.cellId;
  }
}

const handleMouseLeave = () => {
  if (gameStore.isBuildingMode.value) return;
  if (gameStore.hoveredCellIndex.value === props.cellId) {
    gameStore.hoveredCellIndex.value = -1;
  }
}

</script>

<template>
  <div
    class="cell"
    :class="[cellMode, modeClass]"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
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

/* intentionally no base style for not-playable in building mode */

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

.cell-move-allowed-hover {
  background-color: #e0e0ff; /* lighter */
}

.cell-empty {
  background-color: #f6f6f6;
}

/* In playing mode, hide tiles that are not playable while preserving layout */
.playing.cell-not-playable {
  visibility: hidden;
}

/* Hover preview: when hovering an occupied peg in playing mode, show target cells */
/* Note: highlighting is determined in script via isMoveAllowedFrom; no extra CSS needed here. */

</style>
