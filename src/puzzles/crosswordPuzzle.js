import { rgb } from "pdf-lib";
import { makeCrossword, CW_LEVELS } from "../generators/crossword";

const ORDER = ["easy", "medium", "hard", "expert"];
const INK = rgb(0.08, 0.13, 0.24);
const BLOCK = rgb(0.12, 0.16, 0.25);
const BLACK = rgb(0, 0, 0);
const RED = rgb(0.75, 0, 0);

const TEXT = {
  en: {
    name: "Crossword", across: "Across", down: "Down",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
    howto: ["1. Read each clue.", "2. Write the answer in the grid.", "    The number in brackets is how", "    many letters it has.", "3. Across goes left to right.", "    Down goes top to bottom."],
  },
  ms: {
    name: "Teka Silang Kata", across: "Mendatar", down: "Menurun",
    levels: { easy: "Mudah", medium: "Sederhana", hard: "Susah", expert: "Pakar" },
    howto: ["1. Baca setiap petunjuk.", "2. Tulis jawapan dalam grid.", "    Nombor dalam kurungan ialah", "    bilangan huruf.", "3. Mendatar dari kiri ke kanan.", "    Menurun dari atas ke bawah."],
  },
};

function parseEntries(text) {
  const seen = new Set();
  const out = [];
  for (const line of String(text).split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const word = line.slice(0, i).trim().toUpperCase().replace(/[^A-Z]/g, "");
    const clue = line.slice(i + 1).trim();
    if (word.length < 3 || word.length > 11 || !clue || seen.has(word)) continue;
    seen.add(word);
    out.push({ word, clue });
  }
  return out;
}

const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function makeDealer(pool) {
  let deck = [];
  return (n) => {
    const out = [];
    const want = Math.min(n, pool.length);
    let guard = 0;
    while (out.length < want && guard++ < 5000) {
      if (!deck.length) deck = shuffle(pool);
      const e = deck.pop();
      if (!out.includes(e)) out.push(e);
    }
    return out;
  };
}

function wrap(font, text, fs, maxW) {
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const t = cur ? cur + " " + w : w;
    if (font.widthOfTextAtSize(t, fs) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawGrid(ctx, page, p, gx, gy, cell, solved) {
  const { reg, hb } = ctx.fonts;
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      const x = gx + c * cell, y = gy - (r + 1) * cell;
      const ch = p.cells[r][c];
      if (!ch) {
        page.drawRectangle({ x, y, width: cell, height: cell, color: BLOCK });
        continue;
      }
      page.drawRectangle({
        x, y, width: cell, height: cell,
        color: rgb(1, 1, 1), borderColor: INK, borderWidth: solved ? 0.4 : 0.9,
      });
      if (solved) {
        const fs = cell * 0.62;
        const tw = hb.widthOfTextAtSize(ch, fs);
        page.drawText(ch, { x: x + (cell - tw) / 2, y: y + (cell - fs * 0.7) / 2, size: fs, font: hb, color: RED });
      } else if (p.nums[r][c]) {
        const ns = Math.max(5, cell * 0.3);
        page.drawText(String(p.nums[r][c]), { x: x + 1.5, y: y + cell - ns - 0.5, size: ns, font: reg, color: BLACK });
      }
    }
  }
}

export const crossword = {
  name: (lang) => (TEXT[lang] || TEXT.en).name,
  howto: (s, lang) => (TEXT[lang] || TEXT.en).howto,
  generate(s) {
    const entries = parseEntries(s.words);
    if (entries.length < 12) {
      throw new Error("Crossword needs at least 12 lines in the form WORD: clue (words of 3 to 11 letters). You have " + entries.length + ".");
    }
    const dealers = {}, pools = {};
    const out = [];
    for (let i = 0; i < s.count; i++) {
      const lv = s.level === "mixed" ? ORDER[Math.min(3, Math.floor((i * 4) / s.count))] : s.level;
      const cfg = CW_LEVELS[lv];
      if (!pools[lv]) {
        let pool = entries.filter((e) => e.word.length >= cfg.min && e.word.length <= cfg.max);
        if (pool.length < cfg.target * 1.5) pool = entries;
        pools[lv] = pool;
        dealers[lv] = makeDealer(pool);
      }
      const p = makeCrossword(lv, dealers[lv], pools[lv]);
      if (!p) throw new Error("Crossword (" + lv + "): could not build a grid. Add more words.");
      out.push(p);
    }
    return out;
  },
  drawPuzzle(ctx, page, p, n, x0, aw) {
    const { h, TOP, BOTTOM, fonts, L, lang, center } = ctx;
    const T = TEXT[lang] || TEXT.en;
    center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, fonts.hb, x0, aw);
    center(page, T.levels[p.level], h - TOP - 30, 11, fonts.reg, x0, aw);

    const gridMaxH = Math.min(aw, (h - TOP - BOTTOM) * 0.5);
    const cell = Math.min(gridMaxH / p.rows, aw / p.cols, 30);
    const gx = x0 + (aw - cell * p.cols) / 2;
    const gy = h - TOP - 45;
    drawGrid(ctx, page, p, gx, gy, cell, false);

    const gap = 14, colW = (aw - gap) / 2;
    const top = gy - cell * p.rows - 20;
    const avail = top - (BOTTOM + 6);
    const mk = (list, fs) =>
      list.map((it) => wrap(fonts.reg, `${it.n}. ${it.clue} (${it.word.length})`, fs, colW - 8));
    const height = (ls, fs) => ls.reduce((a, l) => a + l.length * fs * 1.22 + 2.5, 0);
    let fs = 10, A = mk(p.across, fs), D = mk(p.down, fs);
    for (; fs >= 6.5; fs -= 0.5) {
      A = mk(p.across, fs); D = mk(p.down, fs);
      if (Math.max(height(A, fs), height(D, fs)) + fs * 1.9 <= avail) break;
    }
    const col = (x, title, ls) => {
      page.drawText(title, { x, y: top - fs, size: fs + 1, font: fonts.hb, color: BLACK });
      let y = top - fs * 1.9 - fs;
      ls.forEach((lines) => {
        lines.forEach((ln, i) => {
          page.drawText(ln, { x: x + (i ? 8 : 0), y, size: fs, font: fonts.reg, color: BLACK });
          y -= fs * 1.22;
        });
        y -= 2.5;
      });
    };
    col(x0, T.across, A);
    col(x0 + colW + gap, T.down, D);
  },
  drawAnswer(ctx, page, p, gx, gy, size) {
    const cell = size / Math.max(p.rows, p.cols);
    const ox = (size - cell * p.cols) / 2;
    drawGrid(ctx, page, p, gx + ox, gy, cell, true);
  },
};
