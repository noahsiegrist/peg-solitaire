import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import {setupGameStoreWatchers} from "@/stores/gameStoreWatchers";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

setupGameStoreWatchers();

app.mount('#app');