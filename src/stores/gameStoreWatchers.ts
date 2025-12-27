import { watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

export function setupGameStoreWatchers() {
    const gameStore = useGameStore();

    watch(
        () => gameStore.size.value,
        () => {
            // Initialize field on first load even if starting in Playing mode
            if (!gameStore.isBuildingMode.value && gameStore.field.value.length > 0) return;
            // Delegate to store action for default layout logic
            gameStore.applyDefaultLayout();
        },
    {
        immediate: true,
    }
    );
}
