const ALL8 = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];

export const NS_LEVELS = {
  easy: { size: 12, dirs: [[0, 1], [1, 0]], min: 3, max: 4, count: 8 },
  medium: { size: 15, dirs: [[0, 1], [1, 0], [1, 1], [-1, 1]], min: 4, max: 5, count: 10 },
  hard: { size: 15, dirs: ALL8, min: 5, max: 6, count: 12 },
  expert: { size: 15, dirs: ALL8, min: 6, max: 8, count: 12 },
};

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const rev = (s) => s.split("").reverse().join("");

function pickNumbers(cfg) {
  const out = [];
  let guard = 0;
  while (out.length < cfg.count && guard++ < 5000) {
    const len = rnd(cfg.min, cfg.max);
    let s = String(rnd(1, 9));
    while (s.length < len) s += String(rnd(0, 9));
    if (new Set(s).size < (len >= 5 ? 3 : 2)) continue;
    if (out.some((o) => o.includes(s) || s.includes(o) || o.includes(rev(s)) || s.includes(rev(o)))) continue;
    out.push(s);
  }
  return out;
}

function place(nums, cfg) {
  const { size, dirs } = cfg;
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const sorted = [...nums].sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    let ok = false;
    for (let t = 0; t < 400 && !ok; t++) {
      const [dr, dc] = dirs[rnd(0, dirs.length - 1)];
      const r = rnd(0, size - 1), c = rnd(0, size - 1);
      const er = r + dr * (word.length - 1), ec = c + dc * (word.length - 1);
      if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
      let fit = true;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r + dr * i][c + dc * i];
        if (cell !== "" && cell !== word[i]) { fit = false; break; }
      }
      if (!fit) continue;
      for (let i = 0; i < word.length; i++) grid[r + dr * i][c + dc * i] = word[i];
      ok = true;
    }
    if (!ok) return null;
  }
  return grid;
}

// Berapa kali nombor muncul dalam grid (arah ikut tahap). Palindrom dikira sekali.
function occurrences(grid, num, dirs) {
  const size = grid.length;
  const seen = new Set();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const [dr, dc] of dirs) {
        const er = r + dr * (num.length - 1), ec = c + dc * (num.length - 1);
        if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
        let m = true;
        for (let i = 0; i < num.length; i++) {
          if (grid[r + dr * i][c + dc * i] !== num[i]) { m = false; break; }
        }
        if (m) {
          const a = r * size + c, b = er * size + ec;
          seen.add(Math.min(a, b) + "-" + Math.max(a, b));
        }
      }
    }
  }
  return seen.size;
}

export function countOccurrences(grid, num, dirs) {
  return occurrences(grid, num, dirs);
}

export function makeNumberSearch(level = "easy") {
  const cfg = NS_LEVELS[level];
  let last = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    const nums = pickNumbers(cfg);
    if (nums.length < cfg.count) continue;
    const base = place(nums, cfg);
    if (!base) continue;
    for (let f = 0; f < 400; f++) {
      const grid = base.map((row) => row.map((ch) => ch || String(rnd(0, 9))));
      const res = { grid, answer: base.map((row) => row.slice()), placed: nums, size: cfg.size, level };
      last = res;
      if (nums.every((n) => occurrences(grid, n, cfg.dirs) === 1)) {
        res.placed = [...nums].sort((a, b) => a.length - b.length || Number(a) - Number(b));
        return res;
      }
    }
  }
  if (last) last.placed = [...last.placed].sort((a, b) => a.length - b.length || Number(a) - Number(b));
  return last;
}
