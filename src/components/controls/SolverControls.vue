<script setup lang="ts">
import type { SolverMove } from '@/solver/dfsSolver';

defineProps<{ isSolving: boolean; visitedStates: number; solutionMoves: SolverMove[] | null }>();
defineEmits<{ 'start': [speed: 'fast' | 'slow']; 'stop': []; 'preview': [index: number]; 'clearPreview': [] }>();
</script>

<template>
  <div class="section">
    <div class="solver-card">
      <div class="row between">
        <div class="label">Auto-solver (DFS)</div>
        <div class="solver-controls segment">
          <button class="btn btn-secondary" :disabled="isSolving" @click="$emit('start', 'slow')">
            <span v-if="isSolving" class="spinner" aria-hidden="true"></span>
            Slow
          </button>
          <button class="btn btn-primary" :disabled="isSolving" @click="$emit('start', 'fast')">
            <span v-if="isSolving" class="spinner" aria-hidden="true"></span>
            Fast
          </button>
          <button class="btn btn-ghost" :disabled="!isSolving" @click="$emit('stop')">Stop</button>
        </div>
      </div>
      <div class="row solving-row" v-if="isSolving">
        <span class="spinner" aria-hidden="true"></span>
        <span class="muted">Solving…</span>
        <span class="muted">Visited:</span>
        <strong>{{ visitedStates }}</strong>
      </div>
      <div class="solutions" v-if="!isSolving && solutionMoves && solutionMoves.length">
        <details open class="solution-accordion">
          <summary class="solution-summary">Solution ({{ solutionMoves.length }} moves)</summary>
          <div class="solutions-body">
            <ol class="solution-list">
              <li v-for="(m, i) in solutionMoves" :key="i" class="solution-item"
                  @mouseenter="$emit('preview', i)"
                  @mouseleave="$emit('clearPreview')">
                <span class="step-index">{{ i + 1 }}</span>
                <span class="step-desc">from <strong>{{ m.from }}</strong> <span class="arrow">→</span> over <strong>{{ m.mid }}</strong> <span class="arrow">→</span> to <strong>{{ m.to }}</strong></span>
              </li>
            </ol>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>


