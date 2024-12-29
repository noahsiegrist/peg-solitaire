import { watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';

export function setupGameStoreWatchers() {
    const gameStore = useGameStore();

    watch(
        () => gameStore.size,
        (size) => {
            if (gameStore.mode === Mode.Building) {
                const newField = Array(size * size).fill(0).map(() => ({ isPlayable: true, isOccupied: true }));
                const halfSize = Math.floor(size / 2);
                // const quarterSize = Math.floor(size / 4);
                //
                //
                // for (let i = 0; i < size; i++) {
                //     for(let j = quarterSize; j < size-quarterSize; j++) {
                //         newField[i * size + halfSize] = 1;
                //         newField[halfSize * size + i] = 1;
                //     }
                //
                // }
                newField[halfSize * size + halfSize] = { isPlayable: true, isOccupied: false };
                gameStore.field = newField;
            }
        },
    {
        immediate: true,
    }
    );
}