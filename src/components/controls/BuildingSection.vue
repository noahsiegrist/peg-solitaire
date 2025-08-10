<script setup lang="ts">
defineProps<{ size: number }>();
defineEmits<{ 'update:size': [value: number]; 'fill-all': []; 'clear-all': []; 'default-layout': [] }>();
</script>

<template>
  <div class="section">
    <div class="slider-row">
      <label class="label" for="sizeSlider">Size</label>
      <output class="value">{{ size }} × {{ size }}</output>
    </div>
    <input type="range" min="1" max="20" class="slider" id="sizeSlider" :value="size" @input="$emit('update:size', Number(($event.target as HTMLInputElement).value))">
    <div class="row">
      <button class="btn btn-secondary" @click="$emit('fill-all')">Fill all</button>
      <button class="btn btn-secondary" @click="$emit('clear-all')">Clear all</button>
      <button class="btn btn-secondary" @click="$emit('default-layout')">Default layout</button>
    </div>
  </div>
</template>


