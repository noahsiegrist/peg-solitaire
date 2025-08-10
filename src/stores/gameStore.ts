// stores/game.js
import { defineStore } from 'pinia';
import { Mode } from '@/types/Mode';
import {CellState} from "@/types/CellState";
import { solveDfs, type SolverMove } from '@/solver/dfsSolver';


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
        isSolving: false,
        visitedStates: 0,
        _shouldStopSolving: false as boolean,
        solutionMoves: null as SolverMove[] | null,
        preSolveFieldSnapshot: null as CellState[] | null,
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

        async startAutoSolve(speed: 'fast' | 'slow' = 'fast') {
            if (this.isSolving) return;
            if (this.mode !== Mode.Playing) {
                this.mode = Mode.Playing;
                this.resetGame();
            }
            this.isSolving = true;
            this.visitedStates = 0;
            this._shouldStopSolving = false;
            this.solutionMoves = null;
            this.preSolveFieldSnapshot = this.field.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
            try {
                const isFast = speed === 'fast';
                const SAMPLE_STRIDE = 1000;
                const result = await solveDfs(this.field, {
                    size: this.size,
                    shouldStop: () => this._shouldStopSolving,
                    delayMs: isFast ? 0 : 1,
                    onVisit: (v) => { this.visitedStates = v; },
                    onApplyMove: (move) => {
                        if (!isFast) {
                            this.focusedCellIndex = move.from;
                            this.field[move.from].isOccupied = false;
                            this.field[move.mid].isOccupied = false;
                            this.field[move.to].isOccupied = true;
                        } else {
                            if (this.visitedStates % SAMPLE_STRIDE === 0) {
                                this.focusedCellIndex = move.from;
                            }
                        }
                    },
                    onRevertMove: (move) => {
                        if (!isFast) {
                            this.field[move.to].isOccupied = false;
                            this.field[move.mid].isOccupied = true;
                            this.field[move.from].isOccupied = true;
                            this.focusedCellIndex = -1;
                        } else {
                            if (this.visitedStates % SAMPLE_STRIDE === 0) {
                                this.focusedCellIndex = -1;
                            }
                        }
                    },
                    recordSolutionPath: true,
                });
                if (result.solved && result.path) {
                    this.solutionMoves = result.path;
                }
            } finally {
                this.isSolving = false;
                this.focusedCellIndex = -1;
                this.hoveredCellIndex = -1;
                if (this.preSolveFieldSnapshot) {
                    this.field = this.preSolveFieldSnapshot.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
                }
            }
        },

        stopAutoSolve() {
            this._shouldStopSolving = true;
        },

        previewSolutionMove(index: number) {
            if (!this.preSolveFieldSnapshot || !this.solutionMoves || index < 0) return;
            const lastIndex = Math.min(index, this.solutionMoves.length - 1);
            const cloned = this.preSolveFieldSnapshot.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
            for (let i = 0; i <= lastIndex; i++) {
                const m = this.solutionMoves[i];
                if (cloned[m.from].isPlayable && cloned[m.mid].isPlayable && cloned[m.to].isPlayable) {
                    cloned[m.from].isOccupied = false;
                    cloned[m.mid].isOccupied = false;
                    cloned[m.to].isOccupied = true;
                }
            }
            this.field = cloned;
            const current = this.solutionMoves[lastIndex];
            this.focusedCellIndex = current.from;
        },

        clearSolutionPreview() {
            if (!this.preSolveFieldSnapshot) return;
            this.field = this.preSolveFieldSnapshot.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
            this.focusedCellIndex = -1;
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
