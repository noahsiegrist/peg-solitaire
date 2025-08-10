import type { CellState } from '@/types/CellState';

export interface SolverMove { from: number; to: number; mid: number }

function cloneField(field: CellState[]): CellState[] {
  return field.map(c => ({ isPlayable: c.isPlayable, isOccupied: c.isOccupied }));
}

function generateMoves(field: CellState[], size: number): SolverMove[] {
  const moves: SolverMove[] = [];
  for (let i = 0; i < field.length; i++) {
    if (!field[i].isPlayable || !field[i].isOccupied) continue;
    const row = Math.floor(i / size), col = i % size;
    const candidates: Array<[number, number]> = [
      [row, col + 2],
      [row, col - 2],
      [row + 2, col],
      [row - 2, col],
    ];
    for (const [r, c] of candidates) {
      if (r < 0 || c < 0 || r >= size || c >= size) continue;
      const to = r * size + c;
      if (!field[to].isPlayable || field[to].isOccupied) continue;
      const midRow = (row + r) / 2;
      const midCol = (col + c) / 2;
      if (!Number.isInteger(midRow) || !Number.isInteger(midCol)) continue;
      const mid = midRow * size + midCol;
      if (field[mid].isOccupied) moves.push({ from: i, to, mid });
    }
  }
  return moves;
}

function applyMove(field: CellState[], move: SolverMove): void {
  field[move.from].isOccupied = false;
  field[move.mid].isOccupied = false;
  field[move.to].isOccupied = true;
}

function revertMove(field: CellState[], move: SolverMove): void {
  field[move.from].isOccupied = true;
  field[move.mid].isOccupied = true;
  field[move.to].isOccupied = false;
}

function countPegs(field: CellState[]): number {
  return field.reduce((n, c) => n + (c.isPlayable && c.isOccupied ? 1 : 0), 0);
}

export interface DfsOptions {
  size: number;
  shouldStop?: () => boolean;
  delayMs?: number;
  onVisit?: (visitedCount: number) => void | Promise<void>;
  onApplyMove?: (move: SolverMove, depth: number) => void | Promise<void>;
  onRevertMove?: (move: SolverMove, depth: number) => void | Promise<void>;
  recordSolutionPath?: boolean;
}

export interface DfsResult {
  solved: boolean;
  path?: SolverMove[];
  visited: number;
}

export async function solveDfs(field: CellState[], opts: DfsOptions): Promise<DfsResult> {
  const { size } = opts;
  const cur = cloneField(field);
  const seen = new Set<string>();
  const path: SolverMove[] = [];
  let visited = 0;

  const delay = async () => {
    if (!opts.delayMs || opts.delayMs <= 0) return;
    await new Promise((r) => setTimeout(r, opts.delayMs));
  };

  const key = (f: CellState[]) => f.map(c => (c.isPlayable ? (c.isOccupied ? '1' : '0') : 'x')).join('');

  async function dfs(depth: number): Promise<boolean> {
    if (opts.shouldStop?.()) return false;
    visited += 1;
    console.log('visited', visited);
    await opts.onVisit?.(visited);

    if (countPegs(cur) === 1) return true;

    const k = key(cur);
    if (seen.has(k)) return false;
    seen.add(k);

    const moves = generateMoves(cur, size);
    for (const m of moves) {
      if (opts.shouldStop?.()) return false;
      applyMove(cur, m);
      await opts.onApplyMove?.(m, depth);
      if (opts.recordSolutionPath) path.push(m);
      await delay();
      if (await dfs(depth + 1)) return true;
      await opts.onRevertMove?.(m, depth);
      if (opts.recordSolutionPath) path.pop();
      revertMove(cur, m);
      await delay();
    }
    return false;
  }

  const solved = await dfs(0);
  return { solved, path: opts.recordSolutionPath && solved ? path.slice() : undefined, visited };
}

