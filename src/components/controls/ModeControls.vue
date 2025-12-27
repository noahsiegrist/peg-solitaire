<script setup lang="ts">
defineProps<{ isBuildingMode: boolean }>();
defineEmits<{ 'toggle-mode': []; 'reset': [] }>();
</script>

<template>
  <div class="section">
    <div class="row">
      <button class="btn btn-primary" @click="$emit('toggle-mode')">{{ isBuildingMode ? 'Start Playing' : 'Edit Layout' }}</button>
      <button class="btn btn-secondary" @click="$emit('reset')">Reset</button>
    </div>
  </div>
</template>


