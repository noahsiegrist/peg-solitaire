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
        mode: Mode.Playing,
        field: [] as CellState[],
        size: 7,
        focusedCellIndex: -1,
        hoveredCellIndex: -1,
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

            const sources = [this.focusedCellIndex, this.hoveredCellIndex].filter((s) => s !== -1);
            for (const sourceIndex of sources) {
                if (this.isMoveAllowedFrom(sourceIndex as number, index)) return true;
            }
            return false;
        },

        isMoveAllowedFrom(sourceIndex: number, targetIndex: number): boolean {
            assert(this.mode === Mode.Playing, 'Cannot move in building mode');
            assert(this.field.length > targetIndex, 'Index out of bounds');
            if (sourceIndex === -1 || sourceIndex === targetIndex) return false;

            const source = this.field[sourceIndex];
            const target = this.field[targetIndex];
            if (!source?.isPlayable || !source?.isOccupied || !target?.isPlayable || target?.isOccupied) return false;

            const size = this.size;
            const sourceRow = Math.floor(sourceIndex / size);
            const sourceCol = sourceIndex % size;
            const targetRow = Math.floor(targetIndex / size);
            const targetCol = targetIndex % size;

            // Horizontal move: same row, two columns apart
            if (sourceRow === targetRow && Math.abs(targetCol - sourceCol) === 2) {
                const midCol = (sourceCol + targetCol) / 2;
                const midIndex = sourceRow * size + midCol;
                return this.field[midIndex].isOccupied === true;
            }

            // Vertical move: same column, two rows apart
            if (sourceCol === targetCol && Math.abs(targetRow - sourceRow) === 2) {
                const midRow = (sourceRow + targetRow) / 2;
                const midIndex = midRow * size + sourceCol;
                return this.field[midIndex].isOccupied === true;
            }

            // Any other move is invalid (prevents wrapping across borders)
            return false;
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

        // Building helpers
        setAllPlayable(isPlayable: boolean) {
            this.field.forEach((cell) => {
                cell.isPlayable = isPlayable;
                if (!isPlayable) cell.isOccupied = false;
            });
        },

        applyDefaultLayout() {
            const size = this.size;
            const total = size * size;
            this.field = Array.from({ length: total }, () => ({ isPlayable: true, isOccupied: true }));
            const mid = Math.floor(size / 2);
            this.field[mid * size + mid] = { isPlayable: true, isOccupied: false };

            const setOff = (r: number, c: number) => { this.field[r * size + c] = { isPlayable: false, isOccupied: false }; };
            if (size >= 7) {
                [[0, 0], [0, size - 2], [size - 2, 0], [size - 2, size - 2]]
                    .forEach(([r, c]) => [0, 1].forEach(dr => [0, 1].forEach(dc => setOff(r + dr, c + dc))));
            } else if (size >= 2) {
                [0, size - 1, size * (size - 1), size * size - 1]
                    .forEach(i => { this.field[i] = { isPlayable: false, isOccupied: false }; });
            }
        },

    },
    // persist: true,  Needs some other plugin
});
