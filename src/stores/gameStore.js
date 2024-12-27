// stores/game.js
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
    state: () => ({
        gameMode: 'default',
        field: []
    }),
    actions: {
        setGameMode(mode) {
            this.gameMode = mode;
        },
        setField(field) {
            this.field = field;
        }
    }
});
