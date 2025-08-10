<script setup lang="ts">
import { Mode } from '@/types/Mode';

defineProps<{ mode: Mode }>();
defineEmits<{ 'toggle-mode': []; 'reset': [] }>();
</script>

<template>
  <div class="section">
    <div class="row">
      <button class="btn btn-primary" @click="$emit('toggle-mode')">{{ mode === Mode.Building ? 'Start Playing' : 'Edit Layout' }}</button>
      <button class="btn btn-secondary" @click="$emit('reset')">Reset</button>
    </div>
  </div>
</template>


