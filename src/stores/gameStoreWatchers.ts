import { watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';

export function setupGameStoreWatchers() {
    const gameStore = useGameStore();

    watch(
        () => gameStore.size,
        (newSize) => {
            if (gameStore.mode !== Mode.Building) return;
            const size = Number(newSize);
            const newField = Array.from({ length: size * size }, () => ({ isPlayable: true, isOccupied: true }));
            const mid = Math.floor(size / 2);
            newField[mid * size + mid] = { isPlayable: true, isOccupied: false };

            const setOff = (r: number, c: number) => { newField[r * size + c] = { isPlayable: false, isOccupied: false }; };
            if (size >= 7) {
                [[0, 0], [0, size - 2], [size - 2, 0], [size - 2, size - 2]].forEach(([r, c]) => [0, 1].forEach(dr => [0, 1].forEach(dc => setOff(r + dr, c + dc))));
            } else if (size >= 2) {
                [0, size - 1, size * (size - 1), size * size - 1].forEach(i => { newField[i] = { isPlayable: false, isOccupied: false }; });
            }
            gameStore.field = newField;
        },
    {
        immediate: true,
    }
    );
}