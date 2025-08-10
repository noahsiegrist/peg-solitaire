import { watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';

export function setupGameStoreWatchers() {
    const gameStore = useGameStore();

    watch(
        () => gameStore.size,
        () => {
            // Initialize field on first load even if starting in Playing mode
            if (gameStore.mode !== Mode.Building && gameStore.field.length > 0) return;
            // Delegate to store action for default layout logic
            gameStore.applyDefaultLayout();
        },
    {
        immediate: true,
    }
    );
}