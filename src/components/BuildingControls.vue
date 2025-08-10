<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';

const gameStore = useGameStore();

const toggleModeLabel = () => gameStore.mode === Mode.Building ? 'Start Playing' : 'Edit Layout';

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
}

// Collapsible panel (mobile minimize)
const isCollapsed = ref(false);
const isMobile = ref(false);
const mediaQuery = window.matchMedia('(max-width: 768px)');
const evaluateMobile = () => { isMobile.value = mediaQuery.matches; };

onMounted(() => {
  evaluateMobile();
  // Initialize collapsed on first mount for mobile screens
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
    <div class="header">
      <div class="title">Controls</div>
      <div class="mode-badge" :class="gameStore.mode">{{ gameStore.mode }}</div>
      <button class="collapse-btn" @click="toggleCollapsed" :aria-expanded="!isCollapsed" :aria-label="isCollapsed ? 'Expand controls' : 'Collapse controls'">
        {{ isCollapsed ? 'Expand' : 'Collapse' }}
      </button>
    </div>

    <div class="section" v-show="!isCollapsed">
      <div class="row">
        <button class="btn btn-primary" @click="gameStore.toggleGameMode">{{ toggleModeLabel() }}</button>
        <button class="btn btn-secondary" @click="resetAction">Reset</button>
      </div>
    </div>

    <div class="section" v-if="gameStore.mode === Mode.Building" v-show="!isCollapsed">
      <div class="slider-row">
        <label class="label" for="sizeSlider">Size</label>
        <output class="value">{{ gameStore.size }} × {{ gameStore.size }}</output>
      </div>
      <input type="range" min="1" max="20" class="slider" id="sizeSlider" v-model.number="gameStore.size">
      <div class="row">
        <button class="btn btn-secondary" @click="fillAll">Fill all</button>
        <button class="btn btn-secondary" @click="clearAll">Clear all</button>
        <button class="btn btn-secondary" @click="applyDefault">Default layout</button>
      </div>
    </div>

    <div class="section" v-else v-show="!isCollapsed">
      <div class="stats">
        <div class="stat"><span class="muted">Playable</span><strong>{{ playableCount }}</strong></div>
        <div class="stat"><span class="muted">Pegs</span><strong>{{ pegCount }}</strong></div>
      </div>
    </div>
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

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 8px; }
.title { font-weight: 600; letter-spacing: 0.3px; }
.collapse-btn { margin-left: 8px; background: transparent; border: 1px solid var(--panel-border); color: var(--muted); border-radius: 999px; padding: 4px 8px; cursor: pointer; font-size: 12px; }
.collapse-btn:hover { color: var(--text); border-color: #7f8ea3; }
.mode-badge {
  text-transform: capitalize;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #2d2f3a;
  border: 1px solid var(--panel-border);
}
.mode-badge.playing { background: rgba(76, 175, 80, 0.18); border-color: rgba(76,175,80,0.35); }
.mode-badge.building { background: rgba(108, 124, 255, 0.18); border-color: rgba(108,124,255,0.35); }

.section { margin-top: 16px; }
.section + .section { margin-top: 20px; }
.row { margin-top: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; row-gap: 10px; }

.btn { cursor: pointer; border: 1px solid transparent; border-radius: 8px; padding: 8px 12px; font-weight: 600; transition: all .2s ease; }
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-secondary { background: var(--secondary); color: white; }
.btn-secondary:hover { background: var(--secondary-hover); }
.btn-ghost { background: transparent; color: var(--muted); border-color: var(--panel-border); }
.btn-ghost:hover { color: var(--text); border-color: #7f8ea3; }

.slider-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.label { color: var(--muted); font-size: 12px; }
.value { font-variant-numeric: tabular-nums; color: var(--text); font-size: 12px; }

.slider { 
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08));
  outline: none;
  border-radius: 999px;
  transition: background 0.2s ease;
}
.slider { margin: 6px 0 4px; }
.slider:hover { background: linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.12)); }
.slider::-webkit-slider-thumb {
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
.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--primary);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

.stats { display: flex; gap: 14px; margin-top: 6px; flex-wrap: wrap; row-gap: 8px; }
.stat { display: flex; gap: 6px; align-items: baseline; padding: 6px 10px; border: 1px solid var(--panel-border); border-radius: 8px; }
.muted { color: var(--muted); font-size: 12px; }

.building-controls.collapsed {
  padding: 10px 12px;
}
.building-controls.collapsed .section { display: none; }
.building-controls.collapsed .mode-badge { display: none; }

@media (max-width: 768px) {
  .building-controls { top: auto; bottom: 16px; right: 16px; left: 16px; max-width: none; }
  .row { gap: 8px; row-gap: 8px; }
  .section { margin-top: 14px; }
}
</style>