import { createApp } from 'vue'
import App from './App.vue'
import { setupGameStoreWatchers } from "@/stores/gameStoreWatchers";

const app = createApp(App);

setupGameStoreWatchers();

app.mount('#app');
