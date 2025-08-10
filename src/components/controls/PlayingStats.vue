<script setup lang="ts">
defineProps<{ playableCount: number; pegCount: number }>();
</script>

<template>
  <div class="section">
    <div class="stats">
      <div class="stat"><span class="muted">Playable</span><strong>{{ playableCount }}</strong></div>
      <div class="stat"><span class="muted">Pegs</span><strong>{{ pegCount }}</strong></div>
    </div>
  </div>
</template>


