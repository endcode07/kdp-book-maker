export const MS_LEVELS = {
  easy: { ops: ["+", "-"], max: 20, lo: 1, hi: 9, blanks: 4 },
  medium: { ops: ["+", "-", "*"], max: 60, lo: 1, hi: 9, blanks: 5 },
  hard: { ops: ["+", "-", "*", "/"], max: 99, lo: 2, hi: 12, blanks: 6 },
  expert: { ops: ["+", "-", "*", "/"], max: 99, lo: 2, hi: 12, blanks: 7 },
};

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export function apply(op, a, b) {
  let r;
  if (op === "+") r = a + b;
  else if (op === "-") r = a - b;
  else if (op === "*") r = a * b;
  else r = b !== 0 && a % b === 0 ? a / b : NaN;
  return Number.isInteger(r) ? r : NaN;
}

// Indeks sel: 0 1 2 / 3 4 5 / 6 7 8. Baris i: sel i*3, i*3+1 -> i*3+2 guna R[i].
// Lajur j: sel j, 3+j -> 6+j guna V[j].
function genGrid(cfg) {
  const ok = (v) => v >= 1 && v <= cfg.max;
  const need = cfg.ops.length === 2 ? 2 : 3;
  for (let t = 0; t < 200000; t++) {
    const a = rnd(cfg.lo, cfg.hi), b = rnd(cfg.lo, cfg.hi);
    const c = rnd(cfg.lo, cfg.hi), d = rnd(cfg.lo, cfg.hi);
    const R = [pick(cfg.ops), pick(cfg.ops), pick(cfg.ops)];
    const V = [pick(cfg.ops), pick(cfg.ops), pick(cfg.ops)];
    if (new Set([...R, ...V]).size < need) continue;
    const e = apply(R[0], a, b), f = apply(R[1], c, d);
    const g = apply(V[0], a, c), h = apply(V[1], b, d);
    if (!(ok(e) && ok(f) && ok(g) && ok(h))) continue;
    const i1 = apply(R[2], g, h), i2 = apply(V[2], e, f);
    if (!ok(i1) || i1 !== i2) continue;
    return { N: [a, b, e, c, d, f, g, h, i1], R, V };
  }
  return null;
}

export function countSolutions(gr, given, limit = 2) {
  const val = Array(9).fill(0);
  const cells = [];
  const bank = {};
  for (let i = 0; i < 9; i++) {
    if (given[i]) val[i] = gr.N[i];
    else { cells.push(i); bank[gr.N[i]] = (bank[gr.N[i]] || 0) + 1; }
  }
  const eqs = [];
  for (let i = 0; i < 3; i++) eqs.push([i * 3, i * 3 + 1, i * 3 + 2, gr.R[i]]);
  for (let j = 0; j < 3; j++) eqs.push([j, 3 + j, 6 + j, gr.V[j]]);
  const consistent = () =>
    eqs.every(([a, b, c, op]) => !val[a] || !val[b] || !val[c] || apply(op, val[a], val[b]) === val[c]);
  let count = 0;
  const rec = (k) => {
    if (k === cells.length) { count++; return; }
    const idx = cells[k];
    for (const key of Object.keys(bank)) {
      if (!bank[key]) continue;
      bank[key]--; val[idx] = Number(key);
      if (consistent()) rec(k + 1);
      bank[key]++; val[idx] = 0;
      if (count >= limit) return;
    }
  };
  if (consistent()) rec(0);
  return count;
}

export function makeMathSquare(level = "easy") {
  const cfg = MS_LEVELS[level];
  const gr = genGrid(cfg) || genGrid(MS_LEVELS.easy);
  const given = Array(9).fill(true);
  let blanks = 0;
  for (const i of shuffle([...Array(9).keys()])) {
    if (blanks >= cfg.blanks) break;
    given[i] = false;
    if (countSolutions(gr, given, 2) === 1) blanks++;
    else given[i] = true;
  }
  const bank = gr.N.filter((_, i) => !given[i]).sort((x, y) => x - y);
  return { ...gr, given, bank, level };
}
