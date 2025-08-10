<script setup lang="ts">
import { Mode } from '@/types/Mode';

defineProps<{ mode: Mode; isCollapsed: boolean }>();
defineEmits<{ 'toggle-collapsed': [] }>();
</script>

<template>
  <div class="header">
    <div class="title">Controls</div>
    <div class="mode-badge" :class="mode">{{ mode }}</div>
    <button class="collapse-btn" @click="$emit('toggle-collapsed')" :aria-expanded="!isCollapsed" :aria-label="isCollapsed ? 'Expand controls' : 'Collapse controls'">
      {{ isCollapsed ? 'Expand' : 'Collapse' }}
    </button>
  </div>
</template>


