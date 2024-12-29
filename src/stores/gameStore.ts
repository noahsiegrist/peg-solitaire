// stores/game.js
import { defineStore } from 'pinia';
import { Mode } from '@/types/Mode';
import {CellState} from "@/types/CellState";


function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}


export const useGameStore = defineStore('game', {
    state: () => ({
        mode: Mode.Building,
        field: [] as CellState[],
        size: 7,
        focusedCellIndex: -1,
    }),
    actions: {


        toggleGameMode() {
            this.mode = this.mode === Mode.Building ? Mode.Playing : Mode.Building;
            this.resetGame();
        },
        toggleBuildingCell(index: number) {
            assert(this.mode === Mode.Building, 'Cannot toggle building cell in playing mode');

            this.field[index].isPlayable = !this.field[index].isPlayable;
            if(!this.field[index].isPlayable) {
                this.field[index].isOccupied = false;
            }
        },
        focusCell(index: number) {
            assert(this.mode === Mode.Playing, 'Cannot focus cell in building mode');
            assert(this.field.length > index, 'Index out of bounds');
            assert(this.field[index].isPlayable, 'Cannot focus non-playable cell');
            assert(this.field[index].isOccupied, 'Cannot focus unoccupied cell');

            this.focusedCellIndex = index;
        },
        isMoveAllowed(index: number): boolean {
            assert(this.mode === Mode.Playing, 'Cannot move in building mode');
            assert(this.field.length > index, 'Index out of bounds');

            if( this.focusedCellIndex === -1
                || this.focusedCellIndex === index
                || !this.field[index].isPlayable
                || this.field[index].isOccupied) {
                return false;
            }

            const distance = Math.abs(index - this.focusedCellIndex);
            if(distance !== 2 && distance !== 2 * this.size) {
                return false;
            }
            const midIndex = index - (index - this.focusedCellIndex) / 2;
            return this.field[midIndex].isOccupied;
        },

        moveFocusedCell(index: number) {
            const midIndex = index - (index - this.focusedCellIndex) / 2;
            this.field[this.focusedCellIndex].isOccupied = false;
            this.field[midIndex].isOccupied = false;
            this.field[index].isOccupied = true;
            this.focusedCellIndex = -1;
        },

        resetGame() {
            this.field.forEach((cell) => {
                cell.isOccupied = cell.isPlayable;
            });
            this.field[Math.floor(this.size / 2) * this.size + Math.floor(this.size / 2)].isOccupied = false;
        },

    },
    // persist: true,  Needs some other plugin
});
