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

    <div class="section" v-show="!isCollapsed">
      <div class="solver-card">
        <div class="row between">
          <div class="label">Auto-solver (DFS)</div>
          <div class="solver-controls segment">
            <button class="btn btn-secondary" :disabled="gameStore.isSolving" @click="gameStore.startAutoSolve('slow')">
              <span v-if="gameStore.isSolving" class="spinner" aria-hidden="true"></span>
              Slow
            </button>
            <button class="btn btn-primary" :disabled="gameStore.isSolving" @click="gameStore.startAutoSolve('fast')">
              <span v-if="gameStore.isSolving" class="spinner" aria-hidden="true"></span>
              Fast
            </button>
            <button class="btn btn-ghost" :disabled="!gameStore.isSolving" @click="gameStore.stopAutoSolve()">Stop</button>
          </div>
        </div>
        <div class="row solving-row" v-if="gameStore.isSolving">
          <span class="spinner" aria-hidden="true"></span>
          <span class="muted">Solving…</span>
          <span class="muted">Visited:</span>
          <strong>{{ gameStore.visitedStates }}</strong>
        </div>
        <div class="solutions" v-if="!gameStore.isSolving && gameStore.solutionMoves && gameStore.solutionMoves.length">
          <details open class="solution-accordion">
            <summary class="solution-summary">Solution ({{ gameStore.solutionMoves.length }} moves)</summary>
            <div class="solutions-body">
              <ol class="solution-list">
                <li v-for="(m, i) in gameStore.solutionMoves" :key="i" class="solution-item"
                    @mouseenter="gameStore.previewSolutionMove(i)"
                    @mouseleave="gameStore.clearSolutionPreview()">
                  <span class="step-index">{{ i + 1 }}</span>
                  <span class="step-desc">from <strong>{{ m.from }}</strong> <span class="arrow">→</span> over <strong>{{ m.mid }}</strong> <span class="arrow">→</span> to <strong>{{ m.to }}</strong></span>
                </li>
              </ol>
            </div>
          </details>
        </div>
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
.row.between { justify-content: space-between; }

.btn { cursor: pointer; border: 1px solid transparent; border-radius: 8px; padding: 8px 12px; font-weight: 600; transition: all .2s ease; }
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-secondary { background: var(--secondary); color: white; }
.btn-secondary:hover { background: var(--secondary-hover); }
.btn-ghost { background: transparent; color: var(--muted); border-color: var(--panel-border); }
.btn-ghost:hover { color: var(--text); border-color: #7f8ea3; }
.spinner {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  display: inline-block; margin-right: 6px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

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

.solutions { margin-top: 8px; max-height: 40vh; overflow: auto; border: 1px solid var(--panel-border); border-radius: 10px; }
.solution-accordion { padding: 6px 10px; }
.solution-summary { cursor: pointer; user-select: none; font-weight: 600; }
.solutions-body { margin-top: 6px; }
.solution-list { margin: 0; padding: 0; display: grid; }
.solution-list li { list-style: none; }
.solution-item { display: grid; grid-template-columns: 28px 1fr; align-items: center; gap: 8px; padding: 8px 10px; border-top: 1px solid var(--panel-border); }
.solution-item:first-child { border-top: none; }
.solution-item:hover { background: rgba(111, 207, 151, 0.14); }
.step-index { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: #2d2f3a; font-weight: 700; font-size: 12px; }
.step-desc .arrow { opacity: 0.7; padding: 0 4px; }

.solver-card { border: 1px solid var(--panel-border); border-radius: 12px; padding: 10px; background: rgba(0,0,0,0.06); }
.segment { display: inline-flex; gap: 8px; }
.solving-row { gap: 8px; }

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