import { describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/stores/gameStore';
import { Mode } from '@/types/Mode';

function createStore() {
  setActivePinia(createPinia());
  const store = useGameStore();
  return store;
}

describe('gameStore logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test('initial state and default size', () => {
    const store = createStore();
    expect(store.mode).toBe(Mode.Building);
    expect(store.size).toBe(7);
    expect(Array.isArray(store.field)).toBe(true);
  });

  test('toggleGameMode resets board', () => {
    const store = createStore();
    store.field = Array.from({ length: store.size * store.size }, () => ({ isPlayable: true, isOccupied: true }));
    store.field[0].isPlayable = false;
    store.field[1].isPlayable = true;

    store.toggleGameMode();

    const centerIndex = Math.floor(store.size / 2) * store.size + Math.floor(store.size / 2);
    expect(store.mode).toBe(Mode.Playing);
    expect(store.field[centerIndex].isOccupied).toBe(false);
    expect(store.field[0].isOccupied).toBe(false);
  });

  test('focusCell requires playable and occupied', () => {
    const store = createStore();
    store.mode = Mode.Playing;
    store.field = Array.from({ length: 9 }, () => ({ isPlayable: true, isOccupied: true }));
    store.size = 3;

    expect(() => store.focusCell(0)).not.toThrow();
    expect(store.focusedCellIndex).toBe(0);

    store.field[1].isOccupied = false;
    expect(() => store.focusCell(1)).toThrow();
  });

  test('isMoveAllowedFrom: horizontal and vertical only, no wrap', () => {
    const store = createStore();
    store.mode = Mode.Playing;
    store.size = 3;
    store.field = [
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
    ];

    expect(store.isMoveAllowedFrom(0, 2)).toBe(true);
    store.field[6].isOccupied = false;
    expect(store.isMoveAllowedFrom(0, 6)).toBe(true);

    expect(store.isMoveAllowedFrom(2, 4)).toBe(false);
    // From 2 to 0 is legal if source occupied, middle occupied and target empty
    store.field[2].isOccupied = true; // source becomes occupied
    store.field[0].isOccupied = false; // target becomes empty
    expect(store.isMoveAllowedFrom(2, 0)).toBe(true);
  });

  test('borders respected: disallow horizontal wrap across row edges', () => {
    const store = createStore();
    store.mode = Mode.Playing;
    store.size = 7; // 7x7
    // Initialize all playable and occupied
    store.field = Array.from({ length: store.size * store.size }, () => ({ isPlayable: true, isOccupied: true }));

    // Choose source at row 0, col 6 (index 6). Attempt to move to index 8 (+2), which is row 1 col 1
    // Prepare target empty and middle occupied to mimic a would-be valid jump if wrapping were allowed
    const src1 = 6; // r0 c6
    const mid1 = 7; // r0 c6 -> r1 c1 would imply mid index 7 if naive, set occupied
    const tgt1 = 8; // r1 c1
    store.field[src1].isOccupied = true;
    store.field[mid1].isOccupied = true;
    store.field[tgt1].isOccupied = false;
    expect(store.isMoveAllowedFrom(src1, tgt1)).toBe(false);

    // Left edge: source at row 1 col 0 (index 7). Attempt to move to index 5 (-2), which is row 0 col 5
    const src2 = 7; // r1 c0
    const mid2 = 6; // naive mid
    const tgt2 = 5; // r0 c5
    store.field[src2].isOccupied = true;
    store.field[mid2].isOccupied = true;
    store.field[tgt2].isOccupied = false;
    expect(store.isMoveAllowedFrom(src2, tgt2)).toBe(false);
  });

  test('isMoveAllowed uses focused or hovered', () => {
    const store = createStore();
    store.mode = Mode.Playing;
    store.size = 3;
    store.field = [
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
    ];

    store.hoveredCellIndex = 0;
    expect(store.isMoveAllowed(2)).toBe(true);

    store.focusedCellIndex = 0;
    expect(store.isMoveAllowed(2)).toBe(true);
  });

  test('moveFocusedCell executes jump and clears middle', () => {
    const store = createStore();
    store.mode = Mode.Playing;
    store.size = 3;
    store.field = [
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: true },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
      { isPlayable: true, isOccupied: false },
    ];

    store.focusedCellIndex = 0;
    expect(store.isMoveAllowed(2)).toBe(true);
    store.moveFocusedCell(2);
    expect(store.field[0].isOccupied).toBe(false);
    expect(store.field[1].isOccupied).toBe(false);
    expect(store.field[2].isOccupied).toBe(true);
    expect(store.focusedCellIndex).toBe(-1);
  });

  test('resetGame fills playable cells except center', () => {
    const store = createStore();
    store.size = 5;
    store.field = Array.from({ length: 25 }, () => ({ isPlayable: true, isOccupied: true }));
    store.field[12].isOccupied = true;
    store.field[0].isPlayable = false;
    store.field[24].isPlayable = false;

    store.resetGame();
    const center = Math.floor(store.size / 2) * store.size + Math.floor(store.size / 2);
    expect(store.field[center].isOccupied).toBe(false);
    expect(store.field[0].isOccupied).toBe(false);
    expect(store.field[24].isOccupied).toBe(false);
    expect(store.field[1].isOccupied).toBe(true);
  });
});


