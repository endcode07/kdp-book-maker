import { rgb } from "pdf-lib";
import { makeWordSearch, LEVELS } from "../generators/wordsearch";

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
      const w = deck.pop();
      if (!out.includes(w)) out.push(w);
    }
    return out;
  };
}

const TEXT = {
  en: {
    name: "Word Search",
    howto: {
      mudah: ["1. Find the words listed below each grid.", "2. Words go across and down.", "3. Circle each word you find."],
      sederhana: ["1. Find the words listed below each grid.", "2. Words go across, down and diagonally.", "3. Circle each word you find."],
      susah: ["1. Find the words listed below each grid.", "2. Words can go in any direction,", "    including backwards.", "3. Circle each word you find."],
    },
  },
  ms: {
    name: "Cari Kata",
    howto: {
      mudah: ["1. Cari perkataan dalam senarai di bawah grid.", "2. Perkataan tersembunyi ke kanan dan ke bawah.", "3. Bulatkan setiap perkataan yang dijumpai."],
      sederhana: ["1. Cari perkataan dalam senarai di bawah grid.", "2. Perkataan tersembunyi ke kanan, bawah", "    dan serong.", "3. Bulatkan setiap perkataan yang dijumpai."],
      susah: ["1. Cari perkataan dalam senarai di bawah grid.", "2. Perkataan boleh tersembunyi ke semua arah,", "    termasuk terbalik.", "3. Bulatkan setiap perkataan yang dijumpai."],
    },
  },
};

function drawGrid(ctx, page, p, gx, gy, size, answerMode, ratio) {
  const mono = ctx.fonts.mono;
  const cell = size / p.size;
  page.drawRectangle({
    x: gx, y: gy - size, width: size, height: size,
    color: rgb(1, 1, 1), borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: answerMode ? 0.5 : 1,
  });
  const lineColor = rgb(0.55, 0.55, 0.55);
  const lw = answerMode ? 0.4 : 0.5;
  for (let i = 1; i < p.size; i++) {
    page.drawLine({ start: { x: gx + i * cell, y: gy }, end: { x: gx + i * cell, y: gy - size }, thickness: lw, color: lineColor });
    page.drawLine({ start: { x: gx, y: gy - i * cell }, end: { x: gx + size, y: gy - i * cell }, thickness: lw, color: lineColor });
  }
  const fs = cell * ratio;
  for (let r = 0; r < p.size; r++) {
    for (let c = 0; c < p.size; c++) {
      const ch = (answerMode ? p.answer : p.grid)[r][c];
      if (!ch) continue;
      const tw = mono.widthOfTextAtSize(ch, fs);
      page.drawText(ch, {
        x: gx + c * cell + (cell - tw) / 2,
        y: gy - r * cell - cell / 2 - fs * 0.3,
        size: fs, font: mono,
        color: answerMode ? rgb(0.75, 0, 0) : rgb(0, 0, 0),
      });
    }
  }
}

export const wordSearch = {
  name: (lang) => (TEXT[lang] || TEXT.en).name,
  howto: (s, lang) => (TEXT[lang] || TEXT.en).howto[s.level],
  generate(s) {
    const cfg = LEVELS[s.level];
    const pool = [...new Set(
      s.words.split(/[,\n]/).map((x) => x.trim().toUpperCase().replace(/[^A-Z]/g, ""))
        .filter((x) => x.length >= 3 && x.length <= cfg.size)
    )];
    if (pool.length < cfg.words) {
      throw new Error(`Word Search: need at least ${cfg.words} words (max ${cfg.size} letters each). You have ${pool.length}.`);
    }
    const deal = makeDealer(pool);
    return Array.from({ length: s.count }, () => makeWordSearch(deal(cfg.words), s.level));
  },
  drawPuzzle(ctx, page, p, n, x0, aw) {
    const { h, TOP, BOTTOM, fonts, L, center } = ctx;
    center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, fonts.hb, x0, aw);
    const size = Math.min(aw, h - TOP - BOTTOM - 130);
    const gx = x0 + (aw - size) / 2;
    const gy = h - TOP - 35;
    drawGrid(ctx, page, p, gx, gy, size, false, 0.6);
    const ws = p.placed.map((x) => x.word).join("   ");
    page.drawText(ws, { x: gx, y: gy - size - 22, size: 12, font: fonts.reg, maxWidth: size, lineHeight: 17 });
  },
  drawAnswer(ctx, page, p, gx, gy, size) {
    drawGrid(ctx, page, p, gx, gy, size, true, 0.7);
  },
};
