<script setup lang="ts">
defineProps<{ isBuildingMode: boolean; isCollapsed: boolean }>();
defineEmits<{ 'toggle-collapsed': [] }>();
</script>

<template>
  <div class="header">
    <div class="title">Controls</div>
    <div class="mode-badge" :class="isBuildingMode ? 'building' : 'playing'">{{ isBuildingMode ? 'building' : 'playing' }}</div>
    <button class="collapse-btn" @click="$emit('toggle-collapsed')" :aria-expanded="!isCollapsed" :aria-label="isCollapsed ? 'Expand controls' : 'Collapse controls'">
      {{ isCollapsed ? 'Expand' : 'Collapse' }}
    </button>
  </div>
</template>


