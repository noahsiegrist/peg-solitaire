import { watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';

export function setupGameStoreWatchers() {
    const gameStore = useGameStore();

    watch(
        () => gameStore.size,
        (newSize) => {
            if (gameStore.mode === Mode.Building) {
                const halfSize = Math.floor(newSize / 2);
                const newField = Array(newSize * newSize).fill(0);

                for (let row = 0; row < newSize; row++) {
                    newField[row * newSize + halfSize] = 1;
                    newField[halfSize * newSize + row] = 1;
                }

                gameStore.field = newField;
            }
        },
    { immediate: true }
    );
}