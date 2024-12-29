// stores/game.js
import { defineStore } from 'pinia';
import { Mode } from '@/types/Mode';



export const useGameStore = defineStore('game', {
    state: () => ({
        mode: Mode.Building,
        field: [] as number[],
        size: 7,
    }),
    actions: {


        toggleGameMode() {
            this.mode = this.mode === Mode.Building ? Mode.Playing : Mode.Building;
        },
        setCell(index: number) {
            if(this.mode === Mode.Building) {
                this.field[index] = this.field[index] === 0 ? 1 : 0;
            }
        }
    },
    // persist: true,  Needs some other plugin
});
