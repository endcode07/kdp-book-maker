export const CW_LEVELS = {
  easy: { min: 3, max: 6, target: 8 },
  medium: { min: 4, max: 8, target: 10 },
  hard: { min: 4, max: 10, target: 13 },
  expert: { min: 5, max: 11, target: 15 },
};

const W = 31;      // grid kerja
const MAXN = 13;   // saiz maksimum grid akhir
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function build(cands, limit) {
  const g = Array.from({ length: W }, () => Array(W).fill(""));
  const used = Array.from({ length: W }, () => Array(W).fill(0));
  const placed = [];
  let minR = W, maxR = -1, minC = W, maxC = -1;
  const inb = (r, c) => r >= 0 && c >= 0 && r < W && c < W;

  const canPlace = (word, r, c, dir) => {
    const dr = dir ? 1 : 0, dc = dir ? 0 : 1;
    const len = word.length;
    const er = r + dr * (len - 1), ec = c + dc * (len - 1);
    if (!inb(r, c) || !inb(er, ec)) return -1;
    const nR0 = Math.min(minR, r), nR1 = Math.max(maxR, er);
    const nC0 = Math.min(minC, c), nC1 = Math.max(maxC, ec);
    if (nR1 - nR0 + 1 > MAXN || nC1 - nC0 + 1 > MAXN) return -1;
    if (inb(r - dr, c - dc) && g[r - dr][c - dc]) return -1;
    if (inb(er + dr, ec + dc) && g[er + dr][ec + dc]) return -1;
    let cross = 0;
    for (let i = 0; i < len; i++) {
      const rr = r + dr * i, cc = c + dc * i;
      const ch = g[rr][cc];
      if (ch) {
        if (ch !== word[i]) return -1;
        if (used[rr][cc] & (dir ? 2 : 1)) return -1;
        cross++;
      } else {
        const pr = dir ? 0 : 1, pc = dir ? 1 : 0;
        if (inb(rr - pr, cc - pc) && g[rr - pr][cc - pc]) return -1;
        if (inb(rr + pr, cc + pc) && g[rr + pr][cc + pc]) return -1;
      }
    }
    return cross;
  };

  const put = (e, r, c, dir) => {
    const dr = dir ? 1 : 0, dc = dir ? 0 : 1;
    for (let i = 0; i < e.word.length; i++) {
      g[r + dr * i][c + dc * i] = e.word[i];
      used[r + dr * i][c + dc * i] |= dir ? 2 : 1;
    }
    const er = r + dr * (e.word.length - 1), ec = c + dc * (e.word.length - 1);
    minR = Math.min(minR, r); maxR = Math.max(maxR, er);
    minC = Math.min(minC, c); maxC = Math.max(maxC, ec);
    placed.push({ ...e, r, c, dir });
  };

  const order = shuffle(cands).sort((a, b) => b.word.length - a.word.length);
  const first = order.shift();
  put(first, Math.floor(W / 2), Math.floor((W - first.word.length) / 2), 0);

  let remaining = order;
  let progress = true;
  while (progress && remaining.length && placed.length < limit) {
    progress = false;
    for (const e of [...remaining]) {
      if (placed.length >= limit) break;
      let best = null, bestScore = -1;
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const ch = g[r][c];
          if (!ch) continue;
          for (let j = 0; j < e.word.length; j++) {
            if (e.word[j] !== ch) continue;
            for (const dir of [0, 1]) {
              const sr = dir ? r - j : r, sc = dir ? c : c - j;
              const s = canPlace(e.word, sr, sc, dir);
              if (s >= 1) {
                const score = s + Math.random() * 0.9;
                if (score > bestScore) { bestScore = score; best = [sr, sc, dir]; }
              }
            }
          }
        }
      }
      if (best) {
        put(e, best[0], best[1], best[2]);
        remaining = remaining.filter((x) => x !== e);
        progress = true;
      }
    }
  }
  return { g, placed, minR, maxR, minC, maxC };
}

// Potong grid, nombor sel, dan sahkan setiap larian huruf = satu perkataan.
function finalize(b) {
  const rows = b.maxR - b.minR + 1, cols = b.maxC - b.minC + 1;
  const cells = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => b.g[b.minR + r][b.minC + c]));
  const nums = Array.from({ length: rows }, () => Array(cols).fill(0));
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!cells[r][c]) continue;
      const sa = (c === 0 || !cells[r][c - 1]) && c + 1 < cols && cells[r][c + 1];
      const sd = (r === 0 || !cells[r - 1][c]) && r + 1 < rows && cells[r + 1][c];
      if (sa || sd) nums[r][c] = ++n;
    }
  }
  const across = [], down = [];
  for (const p of b.placed) {
    const r = p.r - b.minR, c = p.c - b.minC;
    const item = { n: nums[r][c], word: p.word, clue: p.clue, r, c };
    if (!item.n) return null;
    (p.dir ? down : across).push(item);
  }
  // semakan: setiap larian >= 2 huruf mesti sepadan dengan perkataan yang diletak
  const keyA = new Set(across.map((x) => x.r + "," + x.c + "," + x.word.length));
  const keyD = new Set(down.map((x) => x.r + "," + x.c + "," + x.word.length));
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      if (!cells[r][c]) { c++; continue; }
      let c2 = c; while (c2 < cols && cells[r][c2]) c2++;
      if (c2 - c >= 2 && !keyA.has(r + "," + c + "," + (c2 - c))) return null;
      c = c2;
    }
  }
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      if (!cells[r][c]) { r++; continue; }
      let r2 = r; while (r2 < rows && cells[r2][c]) r2++;
      if (r2 - r >= 2 && !keyD.has(r + "," + c + "," + (r2 - r))) return null;
      r = r2;
    }
  }
  across.sort((a, b2) => a.n - b2.n);
  down.sort((a, b2) => a.n - b2.n);
  return { rows, cols, cells, nums, across, down };
}

// entries: [{word, clue}], dealer(n) -> n entri untuk dicuba
export function makeCrossword(level, dealer, pool) {
  const cfg = CW_LEVELS[level];
  let best = null, bestScore = -1;
  for (let attempt = 0; attempt < 40; attempt++) {
    const cands = dealer(Math.min(pool.length, cfg.target * 2));
    if (cands.length < 4) break;
    const b = build(cands, cfg.target);
    const f = finalize(b);
    if (!f) continue;
    const count = b.placed.length;
    const score = Math.min(count, cfg.target) * 1000 - f.rows * f.cols;
    if (score > bestScore) { bestScore = score; best = { ...f, level }; }
    if (count >= cfg.target) break;
  }
  return best;
}
