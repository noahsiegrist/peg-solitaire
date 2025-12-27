// stores/gameStore.ts
import { reactive, toRefs } from 'vue';
import { CellState } from "@/types/CellState";
import { solveDfs, type SolverMove } from '@/solver/dfsSolver';


function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

// Singleton state - created once, shared across all consumers
const state = reactive({
    isBuildingMode: false,
    field: [] as CellState[],
    size: 7,
    focusedCellIndex: -1,
    hoveredCellIndex: -1,
    isSolving: false,
    visitedStates: 0,
    _shouldStopSolving: false,
    solutionMoves: null as SolverMove[] | null,
    preSolveFieldSnapshot: null as CellState[] | null,
});

export function useGameStore() {
    function toggleGameMode() {
        state.isBuildingMode = !state.isBuildingMode;
        resetGame();
    }

    function toggleBuildingCell(index: number) {
        assert(state.isBuildingMode, 'Cannot toggle building cell in playing mode');

        state.field[index].isPlayable = !state.field[index].isPlayable;
        if (!state.field[index].isPlayable) {
            state.field[index].isOccupied = false;
        }
    }

    function focusCell(index: number) {
        assert(!state.isBuildingMode, 'Cannot focus cell in building mode');
        assert(state.field.length > index, 'Index out of bounds');
        assert(state.field[index].isPlayable, 'Cannot focus non-playable cell');
        assert(state.field[index].isOccupied, 'Cannot focus unoccupied cell');

        state.focusedCellIndex = index;
    }

    function isMoveAllowed(index: number): boolean {
        assert(!state.isBuildingMode, 'Cannot move in building mode');
        assert(state.field.length > index, 'Index out of bounds');

        const sources = [state.focusedCellIndex, state.hoveredCellIndex].filter((s) => s !== -1);
        for (const sourceIndex of sources) {
            if (isMoveAllowedFrom(sourceIndex as number, index)) return true;
        }
        return false;
    }

    async function startAutoSolve(speed: 'fast' | 'slow' = 'fast') {
        if (state.isSolving) return;
        if (state.isBuildingMode) {
            state.isBuildingMode = false;
            resetGame();
        }
        state.isSolving = true;
        state.visitedStates = 0;
        state._shouldStopSolving = false;
        state.solutionMoves = null;
        state.preSolveFieldSnapshot = state.field.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
        try {
            const isFast = speed === 'fast';
            const SAMPLE_STRIDE = 1000;
            const result = await solveDfs(state.field, {
                size: state.size,
                shouldStop: () => state._shouldStopSolving,
                delayMs: isFast ? 0 : 1,
                onVisit: (v) => { state.visitedStates = v; },
                onApplyMove: (move) => {
                    if (!isFast) {
                        state.focusedCellIndex = move.from;
                        state.field[move.from].isOccupied = false;
                        state.field[move.mid].isOccupied = false;
                        state.field[move.to].isOccupied = true;
                    } else {
                        if (state.visitedStates % SAMPLE_STRIDE === 0) {
                            state.focusedCellIndex = move.from;
                        }
                    }
                },
                onRevertMove: (move) => {
                    if (!isFast) {
                        state.field[move.to].isOccupied = false;
                        state.field[move.mid].isOccupied = true;
                        state.field[move.from].isOccupied = true;
                        state.focusedCellIndex = -1;
                    } else {
                        if (state.visitedStates % SAMPLE_STRIDE === 0) {
                            state.focusedCellIndex = -1;
                        }
                    }
                },
                recordSolutionPath: true,
            });
            if (result.solved && result.path) {
                state.solutionMoves = result.path;
            }
        } finally {
            state.isSolving = false;
            state.focusedCellIndex = -1;
            state.hoveredCellIndex = -1;
            if (state.preSolveFieldSnapshot) {
                state.field = state.preSolveFieldSnapshot.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
            }
        }
    }

    function stopAutoSolve() {
        state._shouldStopSolving = true;
    }

    function previewSolutionMove(index: number) {
        if (!state.preSolveFieldSnapshot || !state.solutionMoves || index < 0) return;
        const lastIndex = Math.min(index, state.solutionMoves.length - 1);
        const cloned = state.preSolveFieldSnapshot.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
        for (let i = 0; i <= lastIndex; i++) {
            const m = state.solutionMoves[i];
            if (cloned[m.from].isPlayable && cloned[m.mid].isPlayable && cloned[m.to].isPlayable) {
                cloned[m.from].isOccupied = false;
                cloned[m.mid].isOccupied = false;
                cloned[m.to].isOccupied = true;
            }
        }
        state.field = cloned;
        const current = state.solutionMoves[lastIndex];
        state.focusedCellIndex = current.from;
    }

    function clearSolutionPreview() {
        if (!state.preSolveFieldSnapshot) return;
        state.field = state.preSolveFieldSnapshot.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
        state.focusedCellIndex = -1;
    }

    function isMoveAllowedFrom(sourceIndex: number, targetIndex: number): boolean {
        assert(!state.isBuildingMode, 'Cannot move in building mode');
        assert(state.field.length > targetIndex, 'Index out of bounds');
        if (sourceIndex === -1 || sourceIndex === targetIndex) return false;

        const source = state.field[sourceIndex];
        const target = state.field[targetIndex];
        if (!source?.isPlayable || !source?.isOccupied || !target?.isPlayable || target?.isOccupied) return false;

        const size = state.size;
        const sourceRow = Math.floor(sourceIndex / size);
        const sourceCol = sourceIndex % size;
        const targetRow = Math.floor(targetIndex / size);
        const targetCol = targetIndex % size;

        // Horizontal move: same row, two columns apart
        if (sourceRow === targetRow && Math.abs(targetCol - sourceCol) === 2) {
            const midCol = (sourceCol + targetCol) / 2;
            const midIndex = sourceRow * size + midCol;
            return state.field[midIndex].isOccupied === true;
        }

        // Vertical move: same column, two rows apart
        if (sourceCol === targetCol && Math.abs(targetRow - sourceRow) === 2) {
            const midRow = (sourceRow + targetRow) / 2;
            const midIndex = midRow * size + sourceCol;
            return state.field[midIndex].isOccupied === true;
        }

        // Any other move is invalid (prevents wrapping across borders)
        return false;
    }

    function moveFocusedCell(index: number) {
        const midIndex = index - (index - state.focusedCellIndex) / 2;
        state.field[state.focusedCellIndex].isOccupied = false;
        state.field[midIndex].isOccupied = false;
        state.field[index].isOccupied = true;
        state.focusedCellIndex = -1;
    }

    function resetGame() {
        state.field.forEach((cell) => {
            cell.isOccupied = cell.isPlayable;
        });
        state.field[Math.floor(state.size / 2) * state.size + Math.floor(state.size / 2)].isOccupied = false;
    }

    // Building helpers
    function setAllPlayable(isPlayable: boolean) {
        state.field.forEach((cell) => {
            cell.isPlayable = isPlayable;
            if (!isPlayable) cell.isOccupied = false;
        });
    }

    function applyDefaultLayout() {
        const size = state.size;
        const total = size * size;
        state.field = Array.from({ length: total }, () => ({ isPlayable: true, isOccupied: true }));
        const mid = Math.floor(size / 2);
        state.field[mid * size + mid] = { isPlayable: true, isOccupied: false };

        const setOff = (r: number, c: number) => { state.field[r * size + c] = { isPlayable: false, isOccupied: false }; };
        if (size >= 7) {
            [[0, 0], [0, size - 2], [size - 2, 0], [size - 2, size - 2]]
                .forEach(([r, c]) => [0, 1].forEach(dr => [0, 1].forEach(dc => setOff(r + dr, c + dc))));
        } else if (size >= 2) {
            [0, size - 1, size * (size - 1), size * size - 1]
                .forEach(i => { state.field[i] = { isPlayable: false, isOccupied: false }; });
        }
    }

    return {
        // State as refs for reactivity
        ...toRefs(state),
        // Actions
        toggleGameMode,
        toggleBuildingCell,
        focusCell,
        isMoveAllowed,
        isMoveAllowedFrom,
        startAutoSolve,
        stopAutoSolve,
        previewSolutionMove,
        clearSolutionPreview,
        moveFocusedCell,
        resetGame,
        setAllPlayable,
        applyDefaultLayout,
    };
}
