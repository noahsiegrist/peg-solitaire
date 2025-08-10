<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';
import ControlsHeader from '@/components/controls/ControlsHeader.vue';
import ModeControls from '@/components/controls/ModeControls.vue';
import BuildingSection from '@/components/controls/BuildingSection.vue';
import PlayingStats from '@/components/controls/PlayingStats.vue';
import SolverControls from '@/components/controls/SolverControls.vue';

const gameStore = useGameStore();

const fillAll = () => gameStore.setAllPlayable(true);
const clearAll = () => gameStore.setAllPlayable(false);
const applyDefault = () => gameStore.applyDefaultLayout();

const playableCount = computed(() => gameStore.field.filter(c => c.isPlayable).length);
const pegCount = computed(() => gameStore.field.filter(c => c.isPlayable && c.isOccupied).length);

const resetAction = () => {
  if (gameStore.mode === Mode.Building) {
    gameStore.size = 7;
  }
  gameStore.resetGame();
};

// Collapsible panel (mobile minimize)
const isCollapsed = ref(false);
const isMobile = ref(false);
const mediaQuery = window.matchMedia('(max-width: 768px)');
const evaluateMobile = () => { isMobile.value = mediaQuery.matches; };

onMounted(() => {
  evaluateMobile();
  if (isMobile.value) {
    isCollapsed.value = true;
  }
  mediaQuery.addEventListener?.('change', evaluateMobile);
});

onUnmounted(() => {
  mediaQuery.removeEventListener?.('change', evaluateMobile);
});

const toggleCollapsed = () => { isCollapsed.value = !isCollapsed.value; };
</script>

<template>
  <div class="building-controls" :class="{ collapsed: isCollapsed }">
    <ControlsHeader :mode="gameStore.mode" :is-collapsed="isCollapsed" @toggle-collapsed="toggleCollapsed" />

    <ModeControls v-show="!isCollapsed"
                  :mode="gameStore.mode"
                  @toggle-mode="gameStore.toggleGameMode"
                  @reset="resetAction" />

    <BuildingSection v-if="gameStore.mode === Mode.Building" v-show="!isCollapsed"
                     :size="gameStore.size"
                     @update:size="val => gameStore.size = val"
                     @fill-all="fillAll"
                     @clear-all="clearAll"
                     @default-layout="applyDefault" />

    <PlayingStats v-else v-show="!isCollapsed"
                  :playable-count="playableCount"
                  :peg-count="pegCount" />

    <SolverControls v-show="!isCollapsed"
                    :is-solving="gameStore.isSolving"
                    :visited-states="gameStore.visitedStates"
                    :solution-moves="gameStore.solutionMoves"
                    @start="(speed) => gameStore.startAutoSolve(speed)"
                    @stop="() => gameStore.stopAutoSolve()"
                    @preview="(i) => gameStore.previewSolutionMove(i)"
                    @clear-preview="() => gameStore.clearSolutionPreview()" />
  </div>
</template>

<style scoped>
/* theme variables are locally scoped in .building-controls */

.building-controls {
  --panel-bg: rgba(20, 20, 28, 0.55);
  --panel-border: rgba(255, 255, 255, 0.14);
  --text: #f6f7fb;
  --muted: #b8bdcc;
  --primary: #6c7cff;
  --primary-hover: #5a6aff;
  --secondary: #484d55;
  --secondary-hover: #4b5563;

  position: fixed;
  top: 8vh;
  right: 6vw;
  z-index: 100;
  min-width: 280px;
  max-width: 340px;
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px;
  color: var(--text);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}

.building-controls :deep(.header) { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 8px; }
.building-controls :deep(.title) { font-weight: 600; letter-spacing: 0.3px; }
.building-controls :deep(.collapse-btn) { margin-left: 8px; background: transparent; border: 1px solid var(--panel-border); color: var(--muted); border-radius: 999px; padding: 4px 8px; cursor: pointer; font-size: 12px; }
.building-controls :deep(.collapse-btn:hover) { color: var(--text); border-color: #7f8ea3; }
.building-controls :deep(.mode-badge) {
  text-transform: capitalize;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #2d2f3a;
  border: 1px solid var(--panel-border);
}
.building-controls :deep(.mode-badge.playing) { background: rgba(76, 175, 80, 0.18); border-color: rgba(76,175,80,0.35); }
.building-controls :deep(.mode-badge.building) { background: rgba(108, 124, 255, 0.18); border-color: rgba(108,124,255,0.35); }

.building-controls :deep(.section) { margin-top: 16px; }
.building-controls :deep(.section + .section) { margin-top: 20px; }
.building-controls :deep(.row) { margin-top: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; row-gap: 10px; }
.building-controls :deep(.row.between) { justify-content: space-between; }

.building-controls :deep(.btn) { cursor: pointer; border: 1px solid transparent; border-radius: 8px; padding: 8px 12px; font-weight: 600; transition: all .2s ease; }
.building-controls :deep(.btn:active) { transform: translateY(1px); }
.building-controls :deep(.btn-primary) { background: var(--primary); color: white; }
.building-controls :deep(.btn-primary:hover) { background: var(--primary-hover); }
.building-controls :deep(.btn-secondary) { background: var(--secondary); color: white; }
.building-controls :deep(.btn-secondary:hover) { background: var(--secondary-hover); }
.building-controls :deep(.btn-ghost) { background: transparent; color: var(--muted); border-color: var(--panel-border); }
.building-controls :deep(.btn-ghost:hover) { color: var(--text); border-color: #7f8ea3; }
.building-controls :deep(.spinner) {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  display: inline-block; margin-right: 6px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.building-controls :deep(.slider-row) { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.building-controls :deep(.label) { color: var(--muted); font-size: 12px; }
.building-controls :deep(.value) { font-variant-numeric: tabular-nums; color: var(--text); font-size: 12px; }

.building-controls :deep(.slider) { 
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08));
  outline: none;
  border-radius: 999px;
  transition: background 0.2s ease;
}
.building-controls :deep(.slider) { margin: 6px 0 4px; }
.building-controls :deep(.slider:hover) { background: linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.12)); }
.building-controls :deep(.slider::-webkit-slider-thumb) {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.building-controls :deep(.slider::-moz-range-thumb) {
  width: 18px;
  height: 18px;
  background: var(--primary);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

.building-controls :deep(.stats) { display: flex; gap: 14px; margin-top: 6px; flex-wrap: wrap; row-gap: 8px; }
.building-controls :deep(.stat) { display: flex; gap: 6px; align-items: baseline; padding: 6px 10px; border: 1px solid var(--panel-border); border-radius: 8px; }
.building-controls :deep(.muted) { color: var(--muted); font-size: 12px; }

.building-controls :deep(.solutions) { margin-top: 8px; max-height: 40vh; overflow: auto; border: 1px solid var(--panel-border); border-radius: 10px; }
.building-controls :deep(.solution-accordion) { padding: 6px 10px; }
.building-controls :deep(.solution-summary) { cursor: pointer; user-select: none; font-weight: 600; }
.building-controls :deep(.solutions-body) { margin-top: 6px; }
.building-controls :deep(.solution-list) { margin: 0; padding: 0; display: grid; }
.building-controls :deep(.solution-list li) { list-style: none; }
.building-controls :deep(.solution-item) { display: grid; grid-template-columns: 28px 1fr; align-items: center; gap: 8px; padding: 8px 10px; border-top: 1px solid var(--panel-border); }
.building-controls :deep(.solution-item:first-child) { border-top: none; }
.building-controls :deep(.solution-item:hover) { background: rgba(111, 207, 151, 0.14); }
.building-controls :deep(.step-index) { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: #2d2f3a; font-weight: 700; font-size: 12px; }
.building-controls :deep(.step-desc .arrow) { opacity: 0.7; padding: 0 4px; }

.building-controls :deep(.solver-card) { border: 1px solid var(--panel-border); border-radius: 12px; padding: 10px; background: rgba(0,0,0,0.06); }
.building-controls :deep(.segment) { display: inline-flex; gap: 8px; }
.building-controls :deep(.solving-row) { gap: 8px; }

.building-controls.collapsed {
  padding: 10px 12px;
}
.building-controls.collapsed .section { display: none; }
.building-controls.collapsed .mode-badge { display: none; }

@media (max-width: 768px) {
  .building-controls { top: auto; bottom: 16px; right: 16px; left: 16px; max-width: none; }
  .building-controls :deep(.row) { gap: 8px; row-gap: 8px; }
  .building-controls :deep(.section) { margin-top: 14px; }
}
</style>