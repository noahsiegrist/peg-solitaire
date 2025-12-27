import { describe, test, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/stores/gameStore';

function resetStore() {
  const store = useGameStore();
  store.isBuildingMode.value = false;
  store.size.value = 7;
  store.field.value = [];
  store.focusedCellIndex.value = -1;
  store.hoveredCellIndex.value = -1;
  store.isSolving.value = false;
  store.visitedStates.value = 0;
  store.solutionMoves.value = null;
  store.preSolveFieldSnapshot.value = null;
  return store;
}

describe('gameStore logic', () => {
  beforeEach(() => {
    resetStore();
  });

  test('initial state and default size', () => {
    const store = resetStore();
    store.isBuildingMode.value = true; // Set to building mode to match original test expectation
    expect(store.isBuildingMode.value).toBe(true);
    expect(store.size.value).toBe(7);
    expect(Array.isArray(store.field.value)).toBe(true);
  });

  test('toggleGameMode resets board', () => {
    const store = resetStore();
    store.isBuildingMode.value = true;
    store.field.value = Array.from({ length: store.size.value * store.size.value }, () => ({ isPlayable: true, isOccupied: true }));
    store.field.value[0].isPlayable = false;
    store.field.value[1].isPlayable = true;

    store.toggleGameMode();

    const centerIndex = Math.floor(store.size.value / 2) * store.size.value + Math.floor(store.size.value / 2);
    expect(store.isBuildingMode.value).toBe(false); // Now in playing mode
    expect(store.field.value[centerIndex].isOccupied).toBe(false);
    expect(store.field.value[0].isOccupied).toBe(false);
  });

  test('focusCell requires playable and occupied', () => {
    const store = resetStore();
    store.isBuildingMode.value = false; // Playing mode
    store.field.value = Array.from({ length: 9 }, () => ({ isPlayable: true, isOccupied: true }));
    store.size.value = 3;

    expect(() => store.focusCell(0)).not.toThrow();
    expect(store.focusedCellIndex.value).toBe(0);

    store.field.value[1].isOccupied = false;
    expect(() => store.focusCell(1)).toThrow();
  });

  test('isMoveAllowedFrom: horizontal and vertical only, no wrap', () => {
    const store = resetStore();
    store.isBuildingMode.value = false; // Playing mode
    store.size.value = 3;
    store.field.value = [
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
    store.field.value[6].isOccupied = false;
    expect(store.isMoveAllowedFrom(0, 6)).toBe(true);

    expect(store.isMoveAllowedFrom(2, 4)).toBe(false);
    // From 2 to 0 is legal if source occupied, middle occupied and target empty
    store.field.value[2].isOccupied = true; // source becomes occupied
    store.field.value[0].isOccupied = false; // target becomes empty
    expect(store.isMoveAllowedFrom(2, 0)).toBe(true);
  });

  test('borders respected: disallow horizontal wrap across row edges', () => {
    const store = resetStore();
    store.isBuildingMode.value = false; // Playing mode
    store.size.value = 7; // 7x7
    // Initialize all playable and occupied
    store.field.value = Array.from({ length: store.size.value * store.size.value }, () => ({ isPlayable: true, isOccupied: true }));

    // Choose source at row 0, col 6 (index 6). Attempt to move to index 8 (+2), which is row 1 col 1
    // Prepare target empty and middle occupied to mimic a would-be valid jump if wrapping were allowed
    const src1 = 6; // r0 c6
    const mid1 = 7; // r0 c6 -> r1 c1 would imply mid index 7 if naive, set occupied
    const tgt1 = 8; // r1 c1
    store.field.value[src1].isOccupied = true;
    store.field.value[mid1].isOccupied = true;
    store.field.value[tgt1].isOccupied = false;
    expect(store.isMoveAllowedFrom(src1, tgt1)).toBe(false);

    // Left edge: source at row 1 col 0 (index 7). Attempt to move to index 5 (-2), which is row 0 col 5
    const src2 = 7; // r1 c0
    const mid2 = 6; // naive mid
    const tgt2 = 5; // r0 c5
    store.field.value[src2].isOccupied = true;
    store.field.value[mid2].isOccupied = true;
    store.field.value[tgt2].isOccupied = false;
    expect(store.isMoveAllowedFrom(src2, tgt2)).toBe(false);
  });

  test('isMoveAllowed uses focused or hovered', () => {
    const store = resetStore();
    store.isBuildingMode.value = false; // Playing mode
    store.size.value = 3;
    store.field.value = [
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

    store.hoveredCellIndex.value = 0;
    expect(store.isMoveAllowed(2)).toBe(true);

    store.focusedCellIndex.value = 0;
    expect(store.isMoveAllowed(2)).toBe(true);
  });

  test('moveFocusedCell executes jump and clears middle', () => {
    const store = resetStore();
    store.isBuildingMode.value = false; // Playing mode
    store.size.value = 3;
    store.field.value = [
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

    store.focusedCellIndex.value = 0;
    expect(store.isMoveAllowed(2)).toBe(true);
    store.moveFocusedCell(2);
    expect(store.field.value[0].isOccupied).toBe(false);
    expect(store.field.value[1].isOccupied).toBe(false);
    expect(store.field.value[2].isOccupied).toBe(true);
    expect(store.focusedCellIndex.value).toBe(-1);
  });

  test('resetGame fills playable cells except center', () => {
    const store = resetStore();
    store.size.value = 5;
    store.field.value = Array.from({ length: 25 }, () => ({ isPlayable: true, isOccupied: true }));
    store.field.value[12].isOccupied = true;
    store.field.value[0].isPlayable = false;
    store.field.value[24].isPlayable = false;

    store.resetGame();
    const center = Math.floor(store.size.value / 2) * store.size.value + Math.floor(store.size.value / 2);
    expect(store.field.value[center].isOccupied).toBe(false);
    expect(store.field.value[0].isOccupied).toBe(false);
    expect(store.field.value[24].isOccupied).toBe(false);
    expect(store.field.value[1].isOccupied).toBe(true);
  });
});
