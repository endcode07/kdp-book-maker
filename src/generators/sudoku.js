export const SUDOKU_LEVELS = {
  easy: { clues: 40 },
  medium: { clues: 32 },
  hard: { clues: 28 },
  expert: { clues: 24 },
};

const pc = (x) => { let n = 0; while (x) { x &= x - 1; n++; } return n; };
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const bx = (i) => ((((i / 9) | 0) / 3) | 0) * 3 + (((i % 9) / 3) | 0);

// randomize=true: isi grid kosong dengan satu penyelesaian rawak
// randomize=false: kira jumlah penyelesaian (berhenti di "limit")
function search(g, limit, randomize) {
  const rows = Array(9).fill(0), cols = Array(9).fill(0), boxes = Array(9).fill(0);
  for (let i = 0; i < 81; i++) {
    const v = g[i];
    if (!v) continue;
    const m = 1 << v, r = (i / 9) | 0, c = i % 9, b = bx(i);
    if ((rows[r] | cols[c] | boxes[b]) & m) return 0;
    rows[r] |= m; cols[c] |= m; boxes[b] |= m;
  }
  let count = 0;
  const rec = () => {
    let best = -1, bestAvail = 0, bestN = 10;
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue;
      const avail = ~(rows[(i / 9) | 0] | cols[i % 9] | boxes[bx(i)]) & 0x3fe;
      const n = pc(avail);
      if (n === 0) return false;
      if (n < bestN) { best = i; bestAvail = avail; bestN = n; if (n === 1) break; }
    }
    if (best === -1) { count++; return true; }
    const r = (best / 9) | 0, c = best % 9, b = bx(best);
    let vals = [];
    for (let v = 1; v <= 9; v++) if (bestAvail & (1 << v)) vals.push(v);
    if (randomize) vals = shuffle(vals);
    for (const v of vals) {
      const m = 1 << v;
      g[best] = v; rows[r] |= m; cols[c] |= m; boxes[b] |= m;
      const done = rec();
      if (done && randomize) return true;
      g[best] = 0; rows[r] &= ~m; cols[c] &= ~m; boxes[b] &= ~m;
      if (count >= limit) return true;
    }
    return false;
  };
  rec();
  return count;
}

export function makeSudoku(level = "medium") {
  const solution = new Int8Array(81);
  search(solution, 1, true);
  const puzzle = Int8Array.from(solution);
  const target = SUDOKU_LEVELS[level].clues;
  let clues = 81;
  for (const i of shuffle([...Array(81).keys()])) {
    if (clues <= target) break;
    const v = puzzle[i];
    puzzle[i] = 0;
    if (search(puzzle, 2, false) === 1) clues--;
    else puzzle[i] = v;
  }
  return { puzzle, solution, clues };
}
