<template>
  <div class="app-container">
    <GameField />
    <BuildingControls />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import GameField from '@/components/GameField.vue';
import BuildingControls from "@/components/BuildingControls.vue";

@Options({
  components: {
    BuildingControls,
    GameField,
  },
})
export default class App extends Vue {}
</script>

<style>
.app-container {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
}

html, body { height: 100%; margin: 0; }
</style>
